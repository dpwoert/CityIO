var THREE = require('three');

module.exports = function(world){

	var stop = false;
	var _process;
	var list = [];

	var lerp = function(from, to, progress){
		var delta = to - from;
		return from + (delta*progress);
	};

	var animate = function(property, progress, options){

		//animate vectors
		if(property instanceof THREE.Vector3){
			property.copy(IO.tools.lerp3(options.from, options.to, progress));
		}

		//animate material
		if(property instanceof THREE.Material){

			if(options.type === 'opacity'){

				property.transparent = true;
				// var delta = options.to - options.from;
				// property.opacity = options.from + (delta*progress);
				property.opacity = lerp(options.from, options.to, progress);

			}

			if(options.type === 'color'){

				property.color = options.from.lerp(options.to, progress);

			}

		}

		//animate meshes (scale)
		if(property instanceof THREE.Mesh){
			property.scale.copy(IO.tools.lerp3(options.from, options.to, progress));
		}

		//custom
		if(options.tick instanceof Function){
			options.tick(property, progress, options, lerp);
		}

	};

	var detectFrom = function(property, options){

		//animate vectors
		if(property instanceof THREE.Vector3){
			return property.clone();
		}

		//animate material
		if(property instanceof THREE.Material){

			if(options.type === 'opacity'){
				return property.opacity;
			}

			if(options.type === 'color'){
				return property.color.clone();
			}

		}

		//animate meshes (scale)
		if(property instanceof THREE.Mesh){

			return property.scale.clone();

		}

	};

	var update = function(){

		//stop when needed
		if(stop){
			world.render.remove(_process);
		}

		for( var i = 0 ; i < list.length ; i++ ){

			var anim = list[i];
			var finished = false;

			//On first iteration set this as start point in time
			if(!anim.start){
				anim.start = +Date.now();
			}

			//when paused, recalculate starting point
			if(pauseTime){
				anim.start += +Date.now() - pauseTime;
			}

			//calculate progress
			var now = +Date.now() - anim.start;
			var progress = now/anim.duration;

			//check if finished
			if(progress > 1){
				progress = 1;
				finished = true;
			}

			//interpolate
			animate(anim.property, progress, anim);

			//finished so remove from list
			if(finished){
				list.splice(i, 1);
			}

		}

		//reset pause
		if(pauseTime){
			pauseTime = undefined;
		}

		//rerun next time (when needed)
		if(list.length > 0){
			world.render.remove(_process);
		}

	}.bind(this);

	var pauseTime;
	var pause = function(){
		pauseTime = +Date.now();
	};

	this.add = function(property, options){

		var from = options.from || detectFrom(property, options);

		list.push({

			from: from,
			to: options.to,
			duration: options.duration || 1000,
			ease: 'easeInOutCubic',
			property: property,
			type: options.type,
			tick: options.tick

		});

	};

	this.start = function(){
		stop = false;
		_process = world.render.add(update, pause);
	};

	this.stop = function(){
		stop = true;
		world.render.remove(_process);
	};

};
