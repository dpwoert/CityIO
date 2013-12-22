window.Preloader = function(html, callback){

	this.stepSize = 1000;
	this.toLoad = 0;
	this.loaded = 0;
	this.ready = false;
	this.classes = [];
	this.started = false;
	
	this.init = function(){

	}.call(this);

	this.start = function(){

		//measure loading time
		this.startTime = +Date.now();
		this.started = true;
		this.currentClass = 0;
		this.i = 0;

		//log
		console.log('start loading');
		console.time('loading');

		// for( var i = 0 ; i < this.classes.length ; i++){
		// 	console.log('load ' + this.classes[i].valueOf() );

		// 	for( var j = 0 ; j < this.classes[i].data.length ; j++){
		// 		this.classes[i].loadNext();
		// 		this.step();
		// 	}

		// }


	};

	this.loading = function(){
		
		//step
		this.i += this.stepSize;
		var c = this.currentClass;
		var end = this.i;
		var start = end-this.stepSize;

		//finished?
		if(c >= this.classes.length){
			this.finished();
			return false;
		}


		//check
		if(this.i >= this.classes[this.currentClass].data.length){

			//save for next itteration
			this.currentClass++;
			this.i = 0;
			
			end = this.classes[c].data.length;

			console.log('next set loading');
		}

		for( var j = start ; j < end ; j++){

			this.classes[c].add( this.classes[c].data[j] );
			delete this.classes[c].data[j];
			this.step();
		}

	}

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
		// if(this.loaded == this.toLoad){
		// 	this.finished();
		// }

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
		this.classes = null;

		console.log('finished loading');
		console.timeEnd('loading');
	}

}