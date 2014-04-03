IO.elements.Surfaces = function(scene){

	this.types = {
		'floor': { 'colorDay': new THREE.Color(0xDDDDDD), 'colorNight': new THREE.Color(0x333333) },
		'water': { 'colorDay': new THREE.Color(0x81c6f6), 'colorNight': new THREE.Color(0x11485f) },
		'nature': { 'colorDay': new THREE.Color(0x80c146), 'colorNight': new THREE.Color(0x254F0B) },
	};

	this.data = [];
	var keys = [];

	var pointer = 0;

	this.init = function(){

		//create types
		var i = 1;
		_.each(this.types, function(type,key){

			keys.push(key);

			//uniforms
			type.uniforms = {
				"currentTime" : { type: "f", value: 0 },
				"colorDay" : { type: "c", value: type.colorDay },
				"colorNight" : { type: "c", value: type.colorNight },

				"fogColor" : { type: "c", value: scene.fog.color },
				"fogNight" : { type: "c", value: scene.fog.night },
				"fogDay" : { type: "c", value: scene.fog.day },
				"fogDensity" : { type: "f", value: scene.fog.density },
			};

			//material
			type.material = new THREE.ShaderMaterial({
				uniforms: type.uniforms,
			    vertexShader : Shaders.surfaceVertex,
			    fragmentShader: Shaders.surfaceFragment,
			    fog: true
			});

			//geometry
			type.geometry = new THREE.Geometry();

			//height (z-index sorting)
			type.height = i*2;

			//make mesh
			type.mesh = new THREE.Mesh(type.geometry, type.material);

			//itterate heights
			i++;

		});

	}.call(this);

	var addPolygon = function(list, data){

		//generate points in 2d space
		var points = [];

		//translate to 2d
		for(var i = 0 ; i < list.length ; i++){
			points.push( IO.points.translate2D([ list[i][0], list[i][1] ]) );
		}

		var shape = new THREE.Shape(points);
		var height = this.types[data.type].height ? this.types[data.type].height : 1;

		//settings
		var extrusionSettings = {
			amount: height,
			//bevelSize: 15,
			bevelEnabled: false,
			//steps: 0,
			bevelThickness: 0,
			steps: 1
		};

		//extrude & make mesh
		var geometry = new THREE.ExtrudeGeometry( shape, extrusionSettings );
		THREE.GeometryUtils.merge(this.types[data.type].geometry,geometry);
		geometry.dispose();

	}

	this.add = function(data){

		if(data.geom.type == "LineString"){
			return false;
		}

		//get polygones
		var list;
		if(data.geom.type == "MultiPolygon"){
			list = data.geom.coordinates[0];
			for(var x = 0 ; x < list.length ; x++){
				addPolygon.call(this, list[x], data);
			}
		}
		else if (data.geom.coordinates.length > 1){
			list = data.geom.coordinates;
			//multi
			for(var x = 0 ; x < list.length ; x++){
				addPolygon.call(this, list[x], data);
			}
		}
		else {
			//single
			list = data.geom.coordinates[0];
			addPolygon.call(this, list, data);
		}

	};

	this.changeTime = function(time){

		var key;
		for ( var i = 0 ; i < keys.length ; i++){
			key = keys[i];
			this.types[key].uniforms.currentTime.value = time;
		}

	};

	//use a source
	this.source = function(type,source){

		for( var i = 0 ; i < source.length ; i++){
			source[i].type = type;
		}

		if(this.data.length > 1){
			this.data = this.data.concat(source);
		} else {
			this.data = source;
		}

	};

	this.loadNext = function(){

		//add
		this.add(this.data[pointer]);

		//delete
		this.data[pointer] = null;

		pointer++;

	}

	this.addTo = function(obj3d){

		this.parent = obj3d;

	};

	this.finished = function(){

		var key;
		for ( var i = 0 ; i < keys.length ; i++){
			key = keys[i];
			this.parent.add( this.types[key].mesh );
		}

	}

};
