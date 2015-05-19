var THREE = require('three');

module.exports = function(fov, aspect, near, far, group){

	var projection, current, currentLook;
	var animation = {};
	var prevAnimation = {};
	var status = 'fixed';

	//create camera
	var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.needsUpdate = false;

	//make public
	var convert = function(pos){

		var converted = group.localToWorld(pos);
		return converted;

	};

	camera.setProjection = function(_projection){

		//save
		projection = _projection;

		//chainable
		return camera;
	};

	camera.gotoGeo = function(point){

		//get position from projection
		var newPos = projection.translate3D(point);
		newPos = convert( newPos );

		camera.position.copy(newPos);

		//save
		current = newPos.clone();

		//chainable
		return camera;
	};

	camera.lookAtGeo = function(point){

		//get position from projection
		var newPos = projection.translate3D(point);
		var lookAt = convert( newPos );

		camera.lookAt( lookAt );

		//save
		currentLook = lookAt.clone();

		//chainable
		return camera;

	};

	camera.interpolateTo = function(center, dest, distance, extrapolate){

		var _center;
		_center = projection.translate3D(center);

		var _dest;
		_dest = projection.translate3D(dest);

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

		camera.animateTo(newPoint, dest);

	};

	var processPoint = function(point){

		if( point instanceof THREE.Vector3 ){

			return point;

		} else {

			//generate to
			_to = projection.translate3D(point);
			return convert( _to );

		}

	};

	var createSpline = function(points){

		var path;

		//position: create linear path when only 2 points
		if( points.length === 2 ){

			path = new THREE.Path();
			path.fromPoints([ points[0], points[1] ]);

		}

		//position: create spline
		else {

			path = new THREE.SplineCurve3(points);

		}

		return path;

	}

	camera.animateTo = function(points, duration, callback){

		var position = [];
		var look = [];
		duration = duration || 2000;

		//add current position of camera to beginning of path
		position.push( current.clone() );
		look.push( currentLook.clone() );

		//points must be array of multiple arrays
		if( points[0] && points[0] instanceof Array === false ){
			var _point = points;
			points = [_point];
		}

		//progress all point given
		for( var i = 0 ; i < points.length ; i++ ){

			var point = points[i];
			position.push( processPoint(point[0]) );
			look.push( processPoint(point[1]) );

		}

		//create paths
		var path = new THREE.SplineCurve3(position);
		var pathLook = new THREE.SplineCurve3(look);

		//save animation object for rendering
		animation = {

			'type': 'fly',

			'position': path,
			'look': pathLook,

			'timeFrom': +Date.now(),
			'timeTo': +Date.now() + duration,

			'ease': Math.easeInOutCubic || options.ease

		};

		//callback?
		if(callback){
			animation.callback = callback;
		}

		console.log(animation);

		//trigger rendering
		camera.needsUpdate = true;

		//chainable
		return camera;
	};

	var generateHoverPlace = function(center, radius, speed, elapsedTime){
		return new THREE.Vector3(
			center.x + radius * Math.cos( speed * elapsedTime ),
			center.y,
			center.z + radius * Math.sin( speed * elapsedTime )
		);
	};

	camera.flyAround = function(center, radius, speed, fromCallback){

		//settings
		radius = radius || 500;
		speed = speed || 0.10;

		var _center, _look;
		if(center instanceof THREE.Vector3){

			_center = center.clone();
			// center = convert(center.clone());
			_look = _center.clone();

		} else {

			//get center point
			var point = projection.translate3D(center);
			_center = convert( point);
			_look = _center.clone();

		}

		//generate start point
		var startPoint = generateHoverPlace(_center, radius, speed, 0);

		//move to place?
		if(!fromCallback){

			camera.animateTo([startPoint, _look], 1000, function(){

				//when on correct position start animating
				camera.flyAround(center, radius, speed, true);

			});


		} else {

			//change animation object
			animation = {
				'type': 'hover',
				'start': +Date.now(),
				'count': 0,
				'speed': speed,
				'radius': radius,
				'center': _center
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

			var newPos = generateHoverPlace(animation.center, animation.radius, animation.speed, animation.count);
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
				var eased = animation.ease(progress, 0, 1, 1);
				var position = animation.position.getPointAt(eased);
				var look = animation.look.getPointAt(eased);

				//do updating
				camera.position.copy(position);
				camera.lookAt(look);

				//save current pos
				current = position.clone();
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
