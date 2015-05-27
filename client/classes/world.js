module.exports = function(canvas, projection, FXlist){

	var pause = true;
	var world = this;

	//add events
	this.events = new THREE.EventDispatcher();

	//create projection
	this.projection = projection;

	//Setup renderer and cameras
	IO.tools.createThree.call(this, canvas);

	//get mouse positions
	this.mouse = new IO.classes.Mouse(this);

	//setup geo
	this.camera.setProjection(this.projection);

	//add FX
	this.FX = new IO.classes.FX(this.renderer, this.scene, this.camera, this);

	//add FX from list
	FXlist = FXlist || [];
	for( var i = 0 ; i < FXlist.length ; i++ ){
		this.FX.add(FXlist[i]);
	}

	//trigger applying FX
	this.FX
		.add('FXAA')
		.add('copyShader')
		.resize();

	//prevent showing before playing
	canvas.style.visibility = 'hidden';

	//add list
	this.render = new IO.classes.RenderManager();

	//add to the list of renderable function
	this.render.add('controls', this.camera.render);
	this.render.add('fx', this.FX.render);
	// this.render.add(this.renderer.render);

	//add preloader
	this.preloader = new IO.classes.Loader();

	world.events.dispatchEvent({ type: 'created' });

	//shortcut to preloader
	this.load = function(list){

		return this.preloader
			.add(list)
			.start();

	}

	//playback controls
	this.start = function(){

		console.log('start', this.scene);

		var startRender = pause;
		canvas.style.visibility = 'visible';
		pause = false;

		if(startRender){
			world.render.start();
			world.events.dispatchEvent({ type: 'start' });
		}

	};

	this.stop = function(){
		pause = true;
		world.render.stop();

		world.events.dispatchEvent({ type: 'stop' });
	};

	//resize
	var resize = function(){

		console.log('resize triggered');
		var w = this.renderer.domElement.parentNode.offsetWidth;
		var h = this.renderer.domElement.parentNode.offsetHeight;

		this.renderer.setSize( w, h );
		this.camera.aspect = w / h;
		this.camera.updateProjectionMatrix();
		this.FX.resize(w, h);

		//make public
		this.size = {
			width: w,
			height: h
		};

		world.events.dispatchEvent({ type: 'resize', size: this.size });

	}.bind(this);

	//destroy webGL buffers and memory
	var destroyWebGL = function(){

		//destroy WebGL thingies
		IO.tools.destroyGroup(this.group, this.scene);
		this.renderer.clear();
		this.FX.destroy();
		this.mouse.destroy();
		this.FX = undefined;
		this.camera = undefined;
		this.scene = undefined;
		this.group = undefined;
		this.mouse = undefined;
		this.render = undefined;
		this.events = undefined;

		//remove DOM element
		var elem = this.renderer.domElement;
		elem.parentNode.removeChild(elem);

		world = undefined;

	}.bind(this);

	//events
	window.addEventListener('resize', resize, false);
	resize();

	//make sure event listeners and garbages are destroyed
	this.destroy = function(){

		world.render.stop(true);
		window.removeEventListener('resize', resize, false);
		world.events.dispatchEvent({ type: 'destroy' });
		destroyWebGL();

	};

};
