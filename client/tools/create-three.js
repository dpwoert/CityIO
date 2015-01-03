var THREE = require('three');

module.exports = function(canvas, minHeight){

	var width = window.innerWidth;
	var height = window.innerHeight;

	if(width < 1024){
		width = 1024;
	}

	if(minHeight){
		height = minHeight;
	}

	this.renderer = new THREE.WebGLRenderer( { antialias: true } );
	this.renderer.setClearColor( 0xFFFFFF, 1 );
	this.renderer.setSize(width, height);

	//rotate world
	this.group = new THREE.Object3D();

	//Setup camera
	this.camera = new IO.classes.GeoCamera(60, width/height , 1, 5000, this.group);
	this.camera.position.z = 1500;

	//Setup scene
	this.scene = new THREE.Scene();
	this.scene.fog = new THREE.FogExp2( 0xAAAAAA, 0.00075 );

	//Add rotated world to scene
	this.scene.add(this.group);
	// this.group.rotateX(Math.PI/2);
	// this.group.rotateZ(-Math.PI/2);
	// this.group.updateMatrixWorld();

	//create light
	var hemisphere = new THREE.HemisphereLight(0xffffff, 0xdddddd, 1);
	this.scene.add(hemisphere);

	// Append to canvas
	canvas.appendChild( this.renderer.domElement );

};
