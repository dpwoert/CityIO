window.Streets = function(scene){

	//types
	this.types = [
		{ name: 'soundDay', visible: true },
		{ name: 'soundNight', visible: false }
		//night: { search: 'soundNight', visible: false }
	];

	//scale domain
	var domainMin = 50;
	var domainMax = 75;

	//scale range
	var rangeMin = 5;
	var rangeMax = 30;

	//scale exponent
	var exponent = 20;

	var pointer = 0;
	
	this.init = function(){

		//create materials
		_.each(this.types, function(type){

			//uniforms
			type.uniforms = {
				"minHeight" : { type: "f", value: rangeMin },
				"maxHeight" : { type: "f", value: rangeMax },
				"colorStart" : { type: "v4", value: new THREE.Vector4( (252/255), (238/255), (195/255), 1 ) },
				"colorStop" : { type: "v4", value: new THREE.Vector4( 1 , (192/255) , (1/255), 1 ) }, //oranje
				"colorEnd" : { type: "v4", value: new THREE.Vector4( (219/255), (65/255), (44/255), 1 ) },
				"stopPos" : { type: "f", value: 0.4 },

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
			    visible: type.visible
			});

			//geometry
			type.geometry = new THREE.Geometry();

			//make mesh
			type.mesh = new THREE.Mesh(type.geometry, type.material);

		});

		//scale
		this.scale = d3.scale.pow()
			.domain([domainMin,domainMax])
			.range([rangeMin,rangeMax])
			.exponent(exponent);


	}.call(this);

	this.add = function(data){

		var list = data.points;

		//check
		if(list.length < 1 ) return false;

		for( var i = 0 ; i < this.types.length ; i ++){
			var type = this.types[i];

			//sort sound data
			var sound = data[type.name].sort(function(a,b){return a.key-b.key});

			var path = [];

			//make 3d path
			for(var i = 0 ; i < list.length ; i++){

				var point = list[i];

				//get height
				var height = sound[i] ? this.scale(sound[i].db) : 1;

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