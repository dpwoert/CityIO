window.CameraPosition = function(scene, camera, controls, translate){

	this.objects = {};
	this.current = {
		from: null,
		to: null
	};

	this.first = true;
	this.needsUpdate = false;

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

	this.addSpot = function(id, pos, show){

		var pixels = scene.points.translate([pos[0], pos[1]]);
		var pixels2 = scene.points.translate([pos[0], pos[1]]);
		pixels[0] += (500 * scene.points.pixelScale);

		/*
			var geom = new THREE.IcosahedronGeometry(15,0);
			var mat = new THREE.MeshLambertMaterial({ shading: THREE.FlatShading, color: 0xFF0000 });
			this.mesh = new THREE.Mesh(geom, mat)
			this.mesh.position = new THREE.Vector3(pixels2[0],pixels2[1],20);
			DDD.group.add(this.mesh);
		*/

		this.objects[id] = {
			'id': id,
			'geo': pos,
			'pos': pixels,
			'lookAt': pixels2,
			'height': 400
		};

		if(show){
			this.switchTo(id);
		}

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
		lookAt.x = obj.lookAt[0];
		lookAt.y = obj.lookAt[1];

		//look at right subject
		var p2 = translate.localToWorld(lookAt);

		//animate
		if(this.first){

			this.first = false;

			camera.position = p1;
			camera.lookAt( p2 );

			//update controls
			this.updateControls();

		} else {
			this.animateTo(p1, p2);
		}

		//save
		this.current.from = p1;
		this.current.to = p2;

	};

	this.animateTo = function(toEye, toTarget){
		this.animate(this.current.from,this.current.to,toEye,toTarget);
	};

	this.animate = function(fromEye, fromTarget, toEye, toTarget){

		//freeze controls
		//controls.freeze = true;

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
		DDD.controls.freeze = true;

	};

	this.render = function(delta){

		this.completed += (delta * 0.01);

		var eye = this.animation.fromEye.lerp(this.animation.toEye, this.completed);
		var target = this.animation.fromTarget.lerp(this.animation.toTarget, this.completed);

		camera.position = eye;
		camera.lookAt(target);

		this.updateControls();

		//check if completed
		if(this.completed >= 0.1){
			this.needsUpdate = false;
			//controls.freeze = false;
		}

	};

    this.updateControls = function(){

        //http://www.gamedev.net/topic/626401-quaternion-from-latitude-and-longitude/?view=findpost&p=4949706
        
		console.log('update controls');
		var theta = Math.PI + Math.atan2(camera.quaternion.z, camera.quaternion.x);
		var phi = Math.acos(camera.quaternion.y);

		var lat = phi / Math.PI * 180 - 90;
		var lon = (theta / (2 * Math.PI) * 360 - 180);
		// var lon = theta / (2 * Math.PI) * 360 - 180;

		controls.lat = lat;
		controls.lon = lon + 90;
	

    };

    this.flyMode = function(){

    	showPopup('controls', true, function(){
    		DDD.controls.freeze = false;
    	});

    }

    this.init = function(){

    	//camera positions
		var that = this;
		$('.cameraPositions li').click(function(){
			that.switchTo.call(that, $(this).attr('rel'));
			$('li.selected').removeClass('selected');
			$(this).addClass('selected');
		});

		//flight mode
		$('.flymode').click(function(){
			that.flyMode();
			$('li.selected').removeClass('selected');
			$(this).addClass('selected');
		});

	}.call(this);

}