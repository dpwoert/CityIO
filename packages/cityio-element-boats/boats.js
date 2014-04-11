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
	var material = new THREE.MeshLambertMaterial({
		color: 0x333333,
		shading: THREE.FlatShading
	})

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
		var mesh = new THREE.Mesh(geom, material);

		//rotate & scale
		IO.group.add(mesh);
		mesh.scale.set(4,4,4);
		mesh.rotateX(Math.PI/2);
		mesh.rotateY(THREE.Math.degToRad(options.rotation));

		//set initial position
		var points = IO.points.translate2D( options.position );
		var points3d = new THREE.Vector3(points.x,points.y,-3);
		mesh.position = points3d;

		boatList.push({
			'id': options.id,
			'mesh': mesh,
			'from': points3d,
			'to': points3d,
			'rotFrom': options.rotation,
			'rotTo': options.rotation
		});

	};

	var deleteBoat = function(id){
		var boatID = getBoat(id, true);
		var boat = boatList[boatID];

		//remove
		IO.group.remove(boat);
		boatList.slice(boatID,1);
	};

	var changeBoat = function(options){
		var _to = IO.points.translate2D( options.position );
		var to = new THREE.Vector3(_to.x,_to.y,-3);
		var boat = getBoat(options.id);
		var from = boat.to;
		boat.to = to;
		boat.from = from;
	};

	var lerp3d = function(from, to, time){
		return new THREE.Vector3(
			from.x + time * (to.x - from.x),
			from.y + time * (to.y - from.y),
			from.z + time * (to.z - from.z)
		);
	}

	this.render = function(){

		var current = +new Date();
		var progress = (this.futureUpdate - this.lastUpdate)/(current - this.lastUpdate);
		console.log(progress);
		for( var i = 0 ; i < boatList.length ; i++ ){

			var boat = boatList[i];
			boat.mesh.position = lerp3d(boat.from, boat.to, progress);
			//add rotation

		}

	}.bind(this);

	this.live = function(api){

		//save update time
		var prevUpdate = this.lastUpdate || +new Date();
		this.lastUpdate = +new Date();
		this.futureUpdate = this.lastUpdate + (this.lastUpdate - prevUpdate);

		//render
		if(!this.rendering){
			IO.renderList.push(this.render);
			this.rendering = true;
		}

		console.log(api);

		//add boats
		for( var i = 0; i < api.add.length ; i++ ){
			addBoat(api.add[i]);
		}

		//delete boats
		for( var i = 0; i < api.remove.length ; i++){
			removeBoat(api.remove[i]);
		}

		//change boats
		for( var i = 0; i < api.remove.length ; i++){
			changeBoat(api.remove[i]);
		}

	}.bind(this);

};
