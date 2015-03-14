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
	this.scene.fog = new THREE.FogExp2( 0xFFFFFF, 0.00050 );
	this.scene.fog.night = new THREE.Color(0x222222);
    this.scene.fog.day = new THREE.Color(0xFFFFFF);

	//Add rotated world to scene
	this.scene.add(this.group);
	this.group.rotateX(-Math.PI/2);
	// this.group.rotateX(Math.PI/2);
	// this.group.rotateZ(-Math.PI/2);

	// this.group.rotation.z = 90 * Math.PI/180;
	// this.group.rotation.x = -90 * Math.PI/180;
	this.group.updateMatrixWorld();


	//create light
	this.hemisphere = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
	this.scene.add(this.hemisphere);

	// Append to canvas
	canvas.appendChild( this.renderer.domElement );

};
