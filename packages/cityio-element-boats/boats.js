if(!IO || !IO.elements){
	console.warn('IO element missing');
	return false;
}

IO.elements.Boats = function(scene, settings){

	var boatList = [];
	var geoms = {};
	var models = {
		ship: '/3dmodels/ship2.json'
	};

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

	var self = this;
	this.workRouter = function(e){
		self.live(e.data);
	};

	this.render = function(){

	};

	this.live = function(api){
		//api change
		//api remove
		//api add

		console.log(api);
	};

};
