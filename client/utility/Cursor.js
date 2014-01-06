window.Cursor = function(element){

	//var element = $('.cursor');
	
	// this.init = function(){



	// }.call(this);

	this.move = function(mouseX, mouseY){

		//move
		element.style.left = mouseX + 'px';
		element.style.top = mouseY + 'px';

	}

	// this.getRotation = function(){

	//     // edge from X to Y
	//     var north = new THREE.Vector3(0,0,-1);
	//     var direction = new THREE.Vector3().subVectors( DDD.camera.position, north );
	//     var arrow = new THREE.ArrowHelper( direction, north );

	//     return arrow.rotation;

	// }

}