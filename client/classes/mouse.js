module.exports = function(world){

	//init
	// var projector = new THREE.Projector();
	var clickable = [];
	var element = world.renderer.domElement;

	//listen to click event
	var clickEvt = function(evt){

		//translate mouse Y value
		var top = element.getBoundingClientRect().top + document.body.scrollTop;
		var y = evt.clientY - top + document.body.scrollTop;

		//translate mouse to Vector
		var vector = new THREE.Vector3(
			( evt.clientX / window.innerWidth ) * 2 - 1,
			- ( y / window.innerHeight ) * 2 + 1,
			0.5
		);

		//get objects in ray
		vector.unproject( world.camera );
		var ray = new THREE.Raycaster( world.camera.position, vector.sub( world.camera.position ).normalize() );
		var intersects = ray.intersectObjects( clickable );

		if ( intersects.length > 0 ) {

			var intersection = intersects[0];
			var object = intersection.object;

			//get geo coordinate
			var clicked = intersection.point;
			intersection.geo = world.projection.reverse(clicked);

			// alert('clicked at ' + geo[0] + ', ' + geo[1]);

			//click event
			if(object.onClick){
				object.onClick(intersection);
			}

		}

	};

	element.addEventListener('click', clickEvt);

	this.addSpot = function(element, callback){

		//click
		if(callback){
			element.onClick = callback;
		}

		clickable.push(element);
	};

	this.destroy = function(){
		clickable = undefined;
		window.removeEventListener('resize', clickEvt, false);
	};

};
