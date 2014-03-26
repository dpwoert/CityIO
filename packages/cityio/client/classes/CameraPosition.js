IO.classes.CameraPosition = function(){

	this.objects = {};
	this.current = {
		from: null,
		to: null
	};

	this.first = true;
	this.needsUpdate = false;

	this.add = function(id, pos, lookAt, height){

		var pixels = IO.points.translate([pos[1], pos[0]]);
		var pixels2 = IO.points.translate([lookAt[1], lookAt[0]]);

		this.objects[id] = {
			'id': id,
			'geo': pos,
			'pos': pixels,
			'lookAt': pixels2,
			'height': height
		};
	};

	this.addSpot = function(id, pos, show){

		var pixels = IO.points.translate([pos[0], pos[1]]);
		var pixels2 = IO.points.translate([pos[0], pos[1]]);
		pixels[0] += (500 * IO.points.pixelScale);

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

		IO.group.updateMatrixWorld();
		var p1 = IO.group.localToWorld(local);

		//look at
		var lookAt = new THREE.Vector3();
		lookAt.z = 0;
		lookAt.x = obj.lookAt[0];
		lookAt.y = obj.lookAt[1];

		//look at right subject
		var p2 = IO.group.localToWorld(lookAt);

		//animate
		if(this.first){

			this.first = false;

			IO.camera.position = p1;
			IO.camera.lookAt( p2 );

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
		IO.camera.position = fromEye;
		IO.camera.lookAt(fromTarget);

		//save
		this.animation = {
			'fromEye': fromEye,
			'fromTarget': fromTarget,
			'toEye': toEye,
			'toTarget': toTarget
		};

		//trigger rendering
		this.needsUpdate = true;
		IO.controls.freeze = true;

	};

	this.lerp3d = function(from, to, completed){
		return new THREE.Vector3(
			Math.easeInOutCubic(completed, from.x, to.x-from.x, 1),
			Math.easeInOutCubic(completed, from.y, to.y-from.y, 1),
			Math.easeInOutCubic(completed, from.z, to.z-from.z, 1)
		);
	}

	this.render = function(delta){

		this.completed += 0.01;

		var eye = this.lerp3d(this.animation.fromEye, this.animation.toEye, this.completed);
		var target = this.lerp3d(this.animation.fromTarget, this.animation.toTarget, this.completed);

		IO.camera.position = eye;
		IO.camera.lookAt(target);

		this.updateControls();

		//check if completed
		if(this.completed >= 1){
			this.needsUpdate = false;
			//controls.freeze = false;
		}

	};

    this.updateControls = function(){

        //http://www.gamedev.net/topic/626401-quaternion-from-latitude-and-longitude/?view=findpost&p=4949706
		var theta = Math.PI + Math.atan2(IO.camera.quaternion.z, IO.camera.quaternion.x);
		var phi = Math.acos(IO.camera.quaternion.y);

		var lat = phi / Math.PI * 180 - 90;
		var lon = (theta / (2 * Math.PI) * 360 - 180);
		// var lon = theta / (2 * Math.PI) * 360 - 180;

		IO.controls.lat = lat;
		IO.controls.lon = lon + 90;


    };

    this.flyMode = function(){

    	showPopup('controls', true, function(){
    		IO.controls.freeze = false;
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
