window.Preloader = function(callback){

	this.stepSize = 50;
	this.updateSize = 1000;
	this.toLoad = 0;
	this.loaded = 0;
	this.ready = false;
	this.hidden = false;
	this.classes = [];
	this.started = false;

	var width = 325;
	
	this.init = function(){

		//make promise
		this.deferred = Q.defer();
		this.promise = this.deferred.promise;

	}.call(this);

	this.start = function(){

		//measure loading time
		this.startTime = +Date.now();
		this.started = true;
		this.currentClass = 0;
		this.i = 0;

		Session.set("buffer", false);

		//log
		console.log('start loading');
		console.time('loading');

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
		var clean = false;
		if(this.i >= this.classes[this.currentClass].data.length){

			//save for next itteration
			this.currentClass++;
			this.i = 0;
			
			end = this.classes[c].data.length;

			console.log('next set loading');
			clean = true;
		}

		for( var j = start ; j < end ; j++){

			this.classes[c].add( this.classes[c].data[j] );
			delete this.classes[c].data[j];
			this.step();
		}

		if(clean){
			this.classes[c].finished.call(this.classes[c]);
			this.classes[c] = null;
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
		if(this.loaded % this.updateSize == 0){
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

		//console.log('loaded ' + (procent * 100) + '% - ' + remaining + ' seconds remaining');
		document.querySelector("#preloader .bar").style.width = (width * procent) + 'px';

	};

	//done
	this.finished = function(){

		//ready
		this.ready = true;
		this.deferred.resolve();
		var that = this;
		
		//callback
		if(_.isFunction(callback)) callback();

		//change copy
		document.querySelector("#preloaderCopy").innerHTML = '';
		var loader = document.querySelector("#preloader");
		loader.innerHTML = 'Map';
		loader.className = 'button';

		loader.addEventListener("click",function(){

			Session.set("hideIntro", true);
			that.hidden = true;

			ga('send', 'event', 'loaded', 'true');

		});

		//delete preloader data
		this.classes = null;

		console.log('finished loading');
		console.timeEnd('loading');
	}

}