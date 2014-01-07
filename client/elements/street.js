window.Streets = function(scene){

	this.scale = d3.scale.linear().domain([0,1]).range([0,1]);

	//car
	var car = {
		"colorStart" : { type: "v4", value: new THREE.Vector4( (252/255), (238/255), (195/255), 1 ) },
		"colorStop" : { type: "v4", value: new THREE.Vector4( 1 , (192/255) , (1/255), 1 ) }, 
		"colorEnd" : { type: "v4", value: new THREE.Vector4( (219/255), (65/255), (44/255), 1 ) },
		"stopPos" : { type: "f", value: 0.4 }
	};

	//train
	var train = {
		"colorStart" : { type: "v4", value: new THREE.Vector4( (150/255), (150/255), (150/255), 1 ) },
		"colorStop" : { type: "v4", value: new THREE.Vector4( (100/255), (100/255) , (100/255), 1 ) },
		"colorEnd" : { type: "v4", value: new THREE.Vector4( (0/255), (0/255), (0/255), 1 ) },
		"stopPos" : { type: "f", value: 0.7 }
	};

	//types
	this.types = [
		{ name: 'soundDay', visible: true, day: 1, scale: d3.scale.linear().domain([0,0.5]).range([1,0]).clamp(true), color: car },
		{ name: 'soundNight', visible: false, day: 0, scale: d3.scale.linear().domain([0.5,1]).range([0,1]).clamp(true), color: car },
		{ name: 'soundDay', visible: true, day: 1, scale: d3.scale.linear().domain([0,0.5]).range([1,0]).clamp(true), color: train },
		{ name: 'soundNight', visible: false, day: 0, scale: d3.scale.linear().domain([0.5,1]).range([0,1]).clamp(true), color: train }
	];

	//scale domain
	var domainMin = 50;
	var domainMax = 75;

	//scale range
	var rangeMin = 5;
	var rangeMax = 30;

	//scale exponent
	// var exponent = 20;
	var exponentDay = 20;
	var exponentNight = 40;

	var pointer = 0;
	
	this.init = function(){

		//create materials
		_.each(this.types, function(type){

			//uniforms
			type.uniforms = {
				"minHeight" : { type: "f", value: rangeMin },
				"maxHeight" : { type: "f", value: rangeMax },
				"colorStart" : type.color.colorStart,
				"colorStop" : type.color.colorStop,
				"colorEnd" : type.color.colorEnd,
				"stopPos" : type.color.stopPos,

				"day" : { type: "f", value: type.day },

				"currentTime" : { type: "f", value: 0 },
				"fogColor" : { type: "c", value: scene.fog.color },
				"fogNight" : { type: "c", value: scene.fog.night },
				"fogDay" : { type: "c", value: scene.fog.day },
				"fogDensity" : { type: "f", value: scene.fog.density },
			};

			//material
			type.material = new THREE.ShaderMaterial({
				uniforms: type.uniforms,
			    vertexShader : Template.shaderTubeVertex(),
			    fragmentShader: Template.shaderTubeFragment(),
			    fog: true,
			    //visible: type.visible
			});

			//geometry
			type.geometry = new THREE.Geometry();

			//make mesh
			type.mesh = new THREE.Mesh(type.geometry, type.material);

		});

		//scales
		this.scaleDay = d3.scale.pow()
			.domain([domainMin,domainMax])
			.range([rangeMin,rangeMax])
			.exponent(exponentDay);

		this.scaleNight = d3.scale.pow()
			.domain([domainMin,domainMax])
			.range([rangeMin,rangeMax])
			.exponent(exponentNight);


	}.call(this);

	this.add = function(data){

		var list = data.points;

		//check
		if(list.length < 1 ) return false;

		//get types needed
		if(!data.rail){
			currentTypes = [ this.types[0], this.types[1] ];
		}
		else {
			currentTypes = [ this.types[2], this.types[3] ];
		}

		var type;
		for( var i = 0 ; i < currentTypes.length ; i ++){
			type = currentTypes[i];

			//sort sound data
			var sound = data[type.name].sort(function(a,b){return a.key-b.key});

			var path = [];

			//make 3d path
			for(var j = 0 ; j < list.length ; j++){

				var point = list[j];

				//get height
				var height = 1;
				if(type.day == 1){
					height = sound[j] ? this.scaleDay(sound[j].db) : 1;
				} else {
					height = sound[j] ? this.scaleDay(sound[j].db) : 1;
				}

				//points
				var V2 = scene.points.translate2D([ point[1], point[0] ]);
				var V3 = new THREE.Vector3( V2.x , V2.y , height );

				path.push(V3);
				
			}

			//make tube
			var path3D = new THREE.SplineCurve3(path);
			var tube = new THREE.TubeGeometry(path3D, 2, 1.1, 3, false, true);
			THREE.GeometryUtils.merge(type.geometry,tube);
			tube.dispose();

		}

	};

	this.changeTime = function(time){

		var type;
		for ( var i = 0 ; i < this.types.length ; i++){
			this.types[i].uniforms.currentTime.value = time;
			this.types[i].uniforms.day.value = this.types[i].scale(time);
		}

	};

	this.source = function(source){
		this.data = source;
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

		for( var i = 0 ; i < this.types.length ; i++ ){
			
           	this.parent.add(this.types[i].mesh);

		}

	}

};