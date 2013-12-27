window.CameraPosition = function(scene, camera, controls, translate){

	this.objects = {};
	this.current = {
		from: null,
		to: null
	};

	this.first = true;
	this.needsUpdate = false;
	
	this.init = function(){

	}.call(this);

	this.add = function(id, pos, lookAt, height){

		var pixels = scene.points.translate([pos[1], pos[0]]);
		var pixels2 = scene.points.translate([lookAt[1], lookAt[0]]);

		this.objects[id] = {
			'id': id,
			'geo': pos,
			'pos': pixels,
			'lookAt': pixels2,
			'height': height
		};
	};

	this.switchTo = function(id){

		//get camera pos
		var obj = this.objects[id];

		var local = new THREE.Vector3();
		local.z = obj.height ? obj.height : 100;
		local.x = obj.pos[0];
		local.y = obj.pos[1];

		translate.updateMatrixWorld();
		var p1 = translate.localToWorld(local);

		//look at
		var lookAt = new THREE.Vector3();
		lookAt.z = 0;
		lookAt.z = obj.lookAt[0];
		lookAt.x = obj.lookAt[1];

		//look at right subject
		var p2 = translate.localToWorld(lookAt);

		//update controls
		//TODO

		//animate
		if(this.first){

			this.first = false;

			camera.position = p1;
			camera.lookAt( p2 );

		} else {
			this.animateTo(p1, p2);
		}

		//save
		this.current.from = p1;
		this.current.to = p2;

	}

	this.animateTo = function(toEye, toTarget){
		this.animate(this.current.from,this.current.to,toEye,toTarget);
	};

	this.animate = function(fromEye, fromTarget, toEye, toTarget){

		//reset animation
		this.completed = 0;

		//set start position
		camera.position = fromEye;
		camera.lookAt(fromTarget);

		//save
		this.animation = {
			'fromEye': fromEye,
			'fromTarget': fromTarget,
			'toEye': toEye,
			'toTarget': toTarget
		};

		//trigger rendering
		this.needsUpdate = true;

	};

	this.render = function(delta){

		this.completed += delta * 0.01;

		var eye = this.animation.fromEye.lerp(this.animation.toEye, this.completed);
		var target = this.animation.fromTarget.lerp(this.animation.toTarget, this.completed);

		camera.position = eye;
		camera.lookAt(target);

		//check if completed
		if(this.completed >= 1){
			this.needsUpdate = false;
		}

	};

}