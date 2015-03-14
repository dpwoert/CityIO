var THREE = require('three');

module.exports = function(fov, aspect, near, far, group){

	var projection, current, currentLook;
	var animation = {};
	var prevAnimation = {};
	var status = 'fixed';

	//create camera
	var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.needsUpdate = false;

	//change z and y axis
	// camera.up = new THREE.Vector3( 0, -1, -1 );

	var convert = function(pos){

		return pos;

		// group.updateMatrixWorld();
		var converted = group.localToWorld(pos);
		converted.y *= -1;
		return converted;

	};

	camera.setProjection = function(_projection){

		//save
		projection = _projection;

		//chainable
		return camera;
	};

	camera.gotoGeo = function(lat, lon, height){

		//get position from projection
		var newPos = projection.translate3D(lat, lon);
		var newPos3 = convert( new THREE.Vector3(newPos.x, newPos.y, height) );

		//save
		camera.position.copy(newPos3);

		//save
		current = newPos3.clone();

		//chainable
		return camera;
	};

	camera.lookAtGeo = function(lat, lon, height){

		//get position from projection
		var newPos = projection.translate3D(lat, lon);
		var lookAt = convert( new THREE.Vector3(newPos.x, newPos.y, height) );

		camera.lookAt( lookAt );

		//save
		currentLook = lookAt.clone();

		//chainable
		return camera;

	};

	camera.interpolateTo = function(center, dest, distance, extrapolate){

		var _center;
		_center = projection.translate3D(center.lat, center.lon);
		_center = new THREE.Vector3(_center.x, _center.y, center.height);

		var _dest;
		_dest = projection.translate3D(dest.lat, dest.lon);
		_dest = new THREE.Vector3(_dest.x, _dest.y, center.height);


		var line = new THREE.Line3(_center, _dest);
		var totalDistance = line.distance();
		var relDistance = distance / totalDistance;

		if(relDistance > 0.8){
			relDistance = 0.8;
		}

		var newPoint;
		if(extrapolate){
			relDistance += 1;
			newPoint = line.at(relDistance);
		} else {
			newPoint = line.at(1-relDistance);
		}

		camera.animateTo(convert(newPoint), dest);

	};

	camera.animateTo = function(to, lookTo, time, callback){

		var _to, _lookTo;
		time = time || 2000;

		if(to instanceof THREE.Vector3 === false){

			//generate to
			_to = projection.translate3D(to.lat, to.lon);
			_to = convert( new THREE.Vector3(_to.x, _to.y, to.height) );

		} else {

			//to already given
			_to = to;

		}

		if(lookTo instanceof THREE.Vector3 === false){

			//generate look to
			_lookTo = projection.translate3D(lookTo.lat, lookTo.lon);
			_lookTo = convert( new THREE.Vector3(_lookTo.x, _lookTo.y, lookTo.height) );

		} else {

			// look to already given
			_lookTo = lookTo.clone();

		}

		//save animation object for rendering
		animation = {

			'type': 'fly',

			'from': current.clone(),
			'lookFrom': currentLook.clone(),

			'to': _to,
			'lookTo': _lookTo,

			'timeFrom': +Date.now(),
			'timeTo': +Date.now() + time

		};

		//callback?
		if(callback){
			animation.callback = callback;
		}

		//trigger rendering
		camera.needsUpdate = true;

		//chainable
		return camera;
	};

	var generateHoverPlace = function(center, radius, height, speed, elapsedTime){
		return new THREE.Vector3(
			center.x + radius * Math.cos( speed * elapsedTime ),
			height,
			center.z + radius * Math.sin( speed * elapsedTime )
		);
	};

	camera.flyAround = function(center, radius, height, speed, fromCallback){

		//settings
		radius = radius || 500;
		height = height || 250;
		speed = speed || 0.10;

		var _center, _look;
		if(center instanceof THREE.Vector3){

			_center = convert( center.clone() );
			// center = convert(center.clone());
			_look = _center.clone();

		} else {

			//get center point
			center.height = center.height || -50;
			var point = projection.translate3D(center.lat, center.lon);
			_center = convert( new THREE.Vector3(point.x, point.y, center.height) );
			_look = _center.clone();

		}

		//generate start point
		var startPoint = generateHoverPlace(_center, radius, height, speed, 0);

		//move to place?
		if(!fromCallback){

			camera.animateTo(startPoint, _look, 1000, function(){

				//when on correct position start animating
				camera.flyAround(center, radius, height, speed, true);

			});


		} else {

			//change animation object
			animation = {
				'type': 'hover',
				'start': +Date.now(),
				'count': 0,
				'speed': speed,
				'radius': radius,
				'center': _center,
				'height': height
			};

			currentLook = animation.center.clone();

		}

		//save for animation
		camera.needsUpdate = true;

	};

	var paused = false;
	camera.pause = function(){
		paused = true;
	};

	camera.render = function(){

		//check if needs to render
		if(!camera.needsUpdate){
			return false;
		}

		status = 'moving';

		if(animation.type === 'hover'){

			// animation.count += delta;
			animation.count += 0.02;
			// var elapsedTime = +Date.now() - animation.start;

			var newPos = generateHoverPlace(animation.center, animation.radius, animation.height, animation.speed, animation.count);
			camera.position.copy(newPos);
			camera.lookAt( animation.center );

			current = camera.position.clone();

		}

		else if(animation.type === 'fly'){

			//calculate progress
			var duration = animation.timeTo - animation.timeFrom;
			var now = +Date.now() - animation.timeFrom;
			var progress = now/duration;

			//when paused make sure last frame is triggered
			if(paused && progress > 1){
				progress = 1;
			}

			//not paused now
			paused = false;

			//check if done
			if(progress <= 1){

				//prevent overdoing
				if(progress > 1){
					progress = 1;
				}

				//lerp and ease
				var pos = IO.tools.lerp3(animation.from, animation.to, progress);
				var look = IO.tools.lerp3(animation.lookFrom, animation.lookTo, progress);

				//do updating
				camera.position.x = pos.x;
				camera.position.y = pos.y;
				camera.position.z = pos.z;
				camera.lookAt(look);

				//save current pos
				current = pos.clone();
				currentLook = look.clone();

			} else {

				//prevent rendering next time
				camera.needsUpdate = false;
				prevAnimation = animation;
				status = 'fixed';

				//save callback
				var callback = animation.callback || undefined;

				//reset
				animation = {};

				//execute callback when set
				if(callback !== undefined){
					callback();
				}

			}

		}

	};

	//return camera
	return camera;

};
