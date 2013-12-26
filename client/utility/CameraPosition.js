window.CameraPosition = function(scene, camera, translate){

	this.objects = {};
	
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
		camera.position = translate.localToWorld(local);

		//look at
		var lookAt = new THREE.Vector3();
		lookAt.z = 0;
		lookAt.z = obj.lookAt[0];
		lookAt.x = obj.lookAt[1];

		translate.updateMatrixWorld();
		camera.lookAt( translate.localToWorld(lookAt) );

	}

}