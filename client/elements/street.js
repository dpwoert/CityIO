window.Streets = function(scene){

	//types
	this.types = {
		day: { search: 'soundDay' },
		//night: { search: 'soundNight' }
	}

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
				// "colorStop" : { type: "v4", value: new THREE.Vector4( (209/255) , (162/255) , (87/255), 1 ) },
				// "colorEnd" : { type: "v4", value: new THREE.Vector4( (209/255), (102/225), (87/225), 1 ) },
				"colorEnd" : { type: "v4", value: new THREE.Vector4( (219/255), (65/255), (44/255), 1 ) },
				"stopPos" : { type: "f", value: 0.4 },

				"fogColor" : { type: "c", value: scene.fog.color },
				"fogDensity" : { type: "f", value: scene.fog.density },
			};

			//material
			type.material = new THREE.ShaderMaterial({
				uniforms: type.uniforms,
			    vertexShader : Template.shaderTubeVertex(),
			    fragmentShader: Template.shaderTubeFragment(),
			    fog: true
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

		scale = this.scale;
		_.each(this.types, function(type){

			//sort sound data
			var sound = data[type.search].sort(function(a,b){return a.key-b.key});

			var path = [];

			//make 3d path
			for(var i = 0 ; i < list.length ; i++){

				var point = list[i];

				//get height
				var height = sound[i] ? scale(sound[i].db) : 1;

				//points
				var V2 = scene.points.translate2D([ point[1], point[0] ]);
				var V3 = new THREE.Vector3( V2.x , V2.y , height );

				path.push(V3);
				
			}

			//make tube
			var path3D = new THREE.SplineCurve3(path);
			var tube = new THREE.TubeGeometry(path3D, 3, 1.1, 5, false, true);
			THREE.GeometryUtils.merge(type.geometry,tube);
			// tube.dispose();

		});

	};

	this.changeTime = function(time){

		_.each(this.types, function(type){

			type.uniforms.time.value = time;

		});
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

		_.each(this.types, function(type){

           	obj3d.add(type.mesh);

        });

	};

};