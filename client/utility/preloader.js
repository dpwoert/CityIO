window.Preloader = function(html, callback){

	this.stepSize = 1000;
	this.toLoad = 0;
	this.loaded = 0;
	this.ready = false;
	this.classes = [];
	
	this.init = function(){

	}.call(this);

	this.start = function(){

		//measure loading time
		this.startTime = +Date.now();

		//log
		console.log('start loading');

		for( var i = 0 ; i < this.classes.length ; i++){
			this.classes[i].startLoading();
		}

	};

	this.load = function(classes){

		for( var i = 0 ; i < classes.length ; i++){
			this.toLoad+=classes[i].data.length;
			this.classes.push(classes[i]);
		}

	}

	this.step = function(){

		//one extra item had loaded
		this.loaded++;

		//check if needs to update display
		if(this.loaded % this.stepSize == 0){
			this.update()
		}

		//check if finished
		if(this.loaded == this.toLoad){
			this.finished();
		}

	};

	//update display
	this.update = function(){

		//measure loading time
		var time = +Date.now();
		var elapsed = time-this.startTime;

		//procent
		var procent = this.loaded / this.toLoad;
		var remaining = Math.round( (elapsed * (1-procent)) / 1000 );

		console.log('loaded ' + (procent * 100) + '% - ' + remaining + ' seconds remaining');


	};

	//done
	this.finished = function(){

		//done
		this.ready = true;
		
		//callback
		if(_.isFunction(callback)) callback();

		//delete preloader data
		//delete this.data;

		console.log('finished loading');
	}

}