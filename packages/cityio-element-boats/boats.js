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

	window.BOATS = boatList;

	//3d material
	var material = new THREE.MeshLambertMaterial({
		color: 0x333333,
		shading: THREE.FlatShading
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
		var mesh = new THREE.Mesh(geom, material);

		//scale
		var scale = options.scale * 0.1;
		scale = scale == 0 ? 0.5 : scale;
		//scale *= 2;

		//pivot point
		// var rotate = new THREE.Matrix4().makeTranslation( 0, scale, 0 );
		//mesh.applyMatrix( rotate );

		//scale
		mesh.scale.set(scale,scale,scale);

		//rotate
		var rotation = new THREE.Quaternion();
		rotation.setFromEuler( new THREE.Euler(Math.PI/2, THREE.Math.degToRad(options.rotation)-(Math.PI/2), 0) );

		//legacy
		mesh.rotation.setFromQuaternion(rotation);
		//mesh.rotateX(Math.PI/2);
		//mesh.rotateY(THREE.Math.degToRad(options.rotation)-(Math.PI/2));

		//set initial position
		var points = IO.points.translate2D( options.position );
		var points3d = new THREE.Vector3(points.x,points.y,0);
		mesh.position = points3d;

		//add
		IO.group.add(mesh);
		boatList.push({
			'id': options.id,
			'mesh': mesh,
			'from': points3d,
			'to': points3d,
			'rotFrom': options.rotation,
			'rotTo': options.rotation,
			'q': rotation
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

		//to
		var _to = IO.points.translate2D( options.position );
		var to = new THREE.Vector3(_to.x,_to.y,0);

		//get from
		var boat = getBoat(options.id);
		var from = boat.to;

		//check
		if(to.x == from.x && to.y == from.y){
			return false;
		}

		//rotation
		var rotFrom = boat.rotTo;
		var rotTo = options.rotation;

		//save
		boat.to = to;
		boat.from = from;
		boat.rotTo = rotTo;
		boat.rotFrom = rotFrom;
		boat.q = new THREE.Quaternion().setFromEuler( new THREE.Euler(Math.PI/2, THREE.Math.degToRad(boat.rotTo)-(Math.PI/2), 0) );

	};

	var lerp3d = function(from, to, time){
		return new THREE.Vector3(
			from.x + time * (to.x - from.x),
			from.y + time * (to.y - from.y),
			from.z + time * (to.z - from.z)
		);
	}

	var slerp = function(from, to, time){
		var rot = from + time * (to - from);
	}

	this.render = function(){

		var current = +new Date();
		var progress = (current - this.lastUpdate)/(this.futureUpdate - this.lastUpdate);
		for( var i = 0 ; i < boatList.length ; i++ ){

			var boat = boatList[i];

			//don't inerpolate when not needed
			if(boat.from == boat.to) return false;

			//interpolate
			boat.mesh.position = lerp3d(boat.from, boat.to, progress);
			//interpolate rotation
			boat.mesh.quaternion.slerp(boat.q, progress);

		}

	}.bind(this);

	this.live = function(api){

		//save update time
		var prevUpdate = this.lastUpdate || +new Date();
		this.lastUpdate = +new Date();
		this.futureUpdate = this.lastUpdate + (this.lastUpdate - prevUpdate);

		//render?
		if(!this.rendering){
			IO.renderList.push(this.render);
			this.rendering = true;
		} else {
			//save previous changes
			for( var i = 0 ; i < boatList.length ; i++ ){
				boatList[i].from = boatList[i].to;
			}
		}

		console.log(api);

		//add boats
		for( var i = 0; i < api.add.length ; i++ ){
			addBoat(api.add[i]);
		}

		//delete boats
		for( var i = 0; i < api.remove.length ; i++){
			deleteBoat(api.remove[i]);
		}

		//change boats
		for( var i = 0; i < api.change.length ; i++){
			console.log('change!');
			changeBoat(api.change[i]);
		}

	}.bind(this);

};
