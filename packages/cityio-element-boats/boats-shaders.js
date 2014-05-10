if(!IO || !IO.elements){
	console.warn('IO element missing');
	return false;
}

IO.elements.Boats = function(scene, settings){

	//ship objects
	var boatList = [];
	var geoms = {};
	var models = {
		ship: '/3dmodels/ship2.json'
	};

	//3d material
	var uniforms = THREE.UniformsUtils.clone(THREE.ShaderLib['lambert']).uniforms;
	uniforms.timer = { type: "f", value: 0 };
	uniforms.destination = { type: 'm4', value: new THREE.Matrix4() };

	var material = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader : Shaders.boatVertex,
		fragmentShader: Shaders.boatFragment,
		fog: true,
		lights: true,
		color: 0x333333
	});

	this.load = function(){

		console.log('start loading boats');

		var promises = [];
		var loaded = Q.defer();

		_.each(models, function(val, key){

			//promise
			var promise = Q.defer();
			promises.push(promises);

			//load
			var loader = new THREE.JSONLoader();
			loader.load( "/3dmodel/ship2.json", function( geometry ) {

				//loaded
				geoms[key] = geometry;
				promise.resolve();

			});

		});

		//webworker
		this.worker = new Worker('/webworker/boats-webworker.js');
		this.worker.postMessage('start');
		this.worker.addEventListener('message', this.workRouter);

		//all loaded?
		Q.all(promises).then(function(){
			console.log('boats loaded');
			loaded.resolve();
		});

		return loaded;

	};

	this.workRouter = function(e){
		this.live(e.data);
	}.bind(this);

	var getBoat = function(id, key){

		for( var i = 0 ; i < boatList.length ; i++ ){
			//found
			if (boatList[i].id == id){
				if(key) return i;
				return boatList[i];
			}
		}

		//not found
		return false;
	}

	var addBoat = function(options){

		var geom = geoms[options.model];
		var _material = material.clone();
		var mesh = new THREE.Mesh(geom, material);

		//set initial position
		var points = IO.points.translate2D( options.position );
		var points3d = new THREE.Vector3(points.x,points.y,-3);
		mesh.position = points3d;

		//rotate & scale
		IO.group.add(mesh);
		mesh.scale.set(4,4,4);
		mesh.rotateX(Math.PI/2);
		mesh.rotateY(THREE.Math.degToRad(options.rotation));

		//position in 3d world
		mesh.material.uniforms.destination.value = mesh.matrixWorld;

		boatList.push({
			'id': options.id,
			'mesh': mesh,
			'from': points3d,
			'to': points3d,
			'rotFrom': options.rotation,
			'rotTo': options.rotation
		});

		window.BOAT = mesh;

	};

	var deleteBoat = function(id){
		var boatID = getBoat(id, true);
		var boat = boatList[boatID];

		//remove
		IO.group.remove(boat);
		boatList.slice(boatID,1);
	};

	var changeBoat = function(options){
		console.log('change');
		var _to = IO.points.translate2D( options.position );
		var to = new THREE.Vector3(_to.x,_to.y,-3);
		var boat = getBoat(options.id);
		var from = boat.to;
		boat.to = to;
		boat.from = from;

		//animate
		//IO.group.updateMatrixWorld();
		//boat.mesh.material.uniforms.destination.value = IO.localToWorld( to.clone() );

	};

	var lerp3d = function(from, to, time){
		return new THREE.Vector3(
			from.x + time * (to.x - from.x),
			from.y + time * (to.y - from.y),
			from.z + time * (to.z - from.z)
		);
	}

	var seconds = 0;
	this.render = function(delta){

		seconds += delta;
		if(seconds > 60) seconds = 0;

		material.uniforms.timer.value = seconds/60;

	}.bind(this);

	this.live = function(api){

		//start rendering
		if(!this.rendering){
			IO.renderList.push(this.render);
			this.rendering = true;
		}

		//add boats
		for( var i = 0; i < api.add.length ; i++ ){
			addBoat(api.add[i]);
		}

		//delete boats
		for( var i = 0; i < api.remove.length ; i++){
			removeBoat(api.remove[i]);
		}

		//change boats
		for( var i = 0; i < api.change.length ; i++){
			changeBoat(api.change[i]);
		}

	}.bind(this);

};
