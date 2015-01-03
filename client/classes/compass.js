var THREE = require('three');

module.exports = function(world){

	var self = this;
	var update;

	this.getDirection = function(){

		var q = world.camera.quaternion;
		var pVec = new THREE.Vector3( 1, 0, 0 ).applyQuaternion( q );

		var heading = Math.atan2( pVec.z, pVec.x );
		heading += Math.PI/2;
		heading *= 180 / Math.PI;
		heading = heading > 0 ? heading : heading + 360;
		heading = Math.floor(heading % 360);

		return heading;

	};

	this.updateElement = function(element){

		update = window.setInterval(function(){

			var rotation = self.getDirection();

			//transform
			element.style.webkitTransform = 'rotate('+rotation+'deg)';
			element.style.mozTransform = 'rotate('+rotation+'deg)';
			element.style.transform = 'rotate('+rotation+'deg)';

		}, 250);

	};

	this.destroy = function(){

		window.clearInterval(update);

	};

};
