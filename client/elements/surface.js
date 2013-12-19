window.Surfaces = function(scene){
	
	this.types = {
		'ground': { 'colorDay': new THREE.Color(0xF5F5F5), 'colorNight': new THREE.Color(0xF5F5F5) },
		'nature': { 'colorDay': new THREE.Color(0xF5F5F5), 'colorNight': new THREE.Color(0xF5F5F5) },
	};

	this.init = function(){

		this.material = [];
		this.geometry = [];

		//create materials
		_.each(this.types, function(type){

			//uniforms
			type.uniforms = {
				"time" : { type: "f", value: 0 },
				"colorDay" : { type: "v4", value: type.colorDay },
				"colorNight" : { type: "v4", value: type.colorNight }, //oranje

				"fogColor" : { type: "c", value: scene.fog.color },
				"fogDensity" : { type: "f", value: scene.fog.density },
			};

			//material
			type.material = new THREE.ShaderMaterial({
				uniforms: type.uniforms,
			    vertexShader : Template.shaderFaceVertex(),
			    fragmentShader: Template.shaderFaceFragment(),
			    fog: true
			});

			//geometry
			type.geometry = new THREE.Geometry();

			//make mesh
			type.mesh = new THREE.Mesh(type.geometry, type.material);

		});

	}.call(this);

	this.add = function(list, type, height){

		//generate points in 2d space
		var points = [];
		for(var i = 0 ; i < list.length ; i++){
			points.push( scene.points.translate2D([ list[i][0],list[i][1] ]) );
		}

		var shape = new THREE.Shape(points);
		var height = height ? height : 1;

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
		THREE.GeometryUtils.merge(this.types[type].geometry,geometry);			

	};

	this.changeTime = function(time){

		_.each(this.types, function(type){

			type.uniforms.time.value = time;

		});
	};

	this.addTo = function(obj3d){

		_.each(this.types, function(type){

			obj3d.add(type.mesh);

		});

	};

};