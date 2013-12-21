window.Surfaces = function(scene){
	
	this.types = {
		'floor': { 'colorDay': new THREE.Color(0xDDDDDD), 'colorNight': new THREE.Color(0xF5F5F5) },
		'water': { 'colorDay': new THREE.Color(0x81c6f6), 'colorNight': new THREE.Color(0x11485f) },
		'nature': { 'colorDay': new THREE.Color(0xF5F5F5), 'colorNight': new THREE.Color(0xF5F5F5) },
	};

	this.data = [];

	this.init = function(){

		//create types
		var i = 1;
		_.each(this.types, function(type){

			//uniforms
			type.uniforms = {
				"time" : { type: "f", value: 0 },
				"colorDay" : { type: "c", value: type.colorDay },
				"colorNight" : { type: "c", value: type.colorNight },

				"fogColor" : { type: "c", value: scene.fog.color },
				"fogDensity" : { type: "f", value: scene.fog.density },
			};

			//material
			type.material = new THREE.ShaderMaterial({
				uniforms: type.uniforms,
			    vertexShader : Template.shaderSurfaceVertex(),
			    fragmentShader: Template.shaderSurfaceFragment(),
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

	this.add = function(data){

		//generate points in 2d space
		var points = [];
		var list = data.geom.coordinates[0];
		for(var i = 0 ; i < list.length ; i++){
			points.push( scene.points.translate2D([ list[i][0], list[i][1] ]) );
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

	};

	this.changeTime = function(time){

		_.each(this.types, function(type){

			type.uniforms.time.value = time;

		});
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

	this.startLoading = function(){

		//load all
		var item;
		for( var i = 0 ; i < this.data.length ; i ++ ){
			item = this.data[i];
			this.add(item);
			scene.preloader.step();
		}

	};

	this.addTo = function(obj3d){

		_.each(this.types, function(type){

			obj3d.add(type.mesh);

		});

	};

};