var THREE = require('three');

//add easing - from http://gizma.com/easing/#cub3
Math.easeInOutQuad = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) {
		return c/2*t*t + b;
	}
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};

Math.easeInOutCubic = function (t, b, c, d) {
	t /= d/2;
	if (t < 1){
		return c/2*t*t*t + b;
	}
	t -= 2;
	return c/2*(t*t*t + 2) + b;
};

module.exports = function(from, to, completed){

	return new THREE.Vector3(
		Math.easeInOutCubic(completed, from.x, to.x-from.x, 1),
		Math.easeInOutCubic(completed, from.y, to.y-from.y, 1),
		Math.easeInOutCubic(completed, from.z, to.z-from.z, 1)
	);

};
