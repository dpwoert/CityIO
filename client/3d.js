window.DDD = {

	//collections
	material: {},
	buildings: [],
	groups: [],
	cacheGeom: [],

	//options
	merge: true,

	//colors
	pollution: {
		min: 20.806,
		max: 45.5,
		steps: 5,
		// colors: [0xbdc3c7,0xB1DEBC, 0x6CD6A0,0x009470,0x009470,0xB32706]

		//colors: [0x8999A8, 0xBCD3E7, 0x4A535B, 0x545F68, 0x353C42]
		// colors: [0xAAD7D9,0x79B3AD,0x6A877F,0x586E55,0x454D46]
		// colors: [0xF2EDE4, 0xD9D1C7, 0x8D8681, 0x303440, 0x666A73]
		// colors: [0xFAFAFA, 0xBFBCB8, 0x7F7E7A, 0x403F3D, 0x313133]
		// colors: [0xf1f1f1, 0xd6dfdb, 0xbfcdc6, 0xdfa5a1, 0xe87364]
		colors: [ 0xf9f9f9, 0xe8e8e8, 0xdbdbdb, 0xdfa5a1, 0xe87364]
	},

	//street heights
	groundlines: false,
	streetHeight: { min: 1.0, max: 30.0 },
	streetHeights: d3.scale.pow()
		.domain([50,75])
		.range([1,30])
		.exponent(20)

};

DDD.init = function(){

	//camera
	DDD.camera = new THREE.PerspectiveCamera( 45 , window.innerWidth / window.innerHeight, 0.1, 4000 );
    DDD.camera.position.z = 500;
    DDD.camera.position.y = 200;
    // DDD.camera.rotation.order = "YXZ";

    //make scene
    DDD.scene = new THREE.Scene();
    DDD.group = new THREE.Object3D();
    DDD.scene.add(DDD.group);
    DDD.group.rotateX(-Math.PI/2);

    //translation
    var points = new Points(geo.center,geo.zoom);
    DDD.scene.points = points;

    //fog
    DDD.scene.fog = new THREE.FogExp2( 0xFFFFFF, 0.0003 );

    //start
    DDD.renderer = new THREE.WebGLRenderer();
    DDD.renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( DDD.renderer.domElement );

   	//floor
    var planeGeo = new THREE.PlaneGeometry(3000, 3000, 1, 1);
    var planeMat = new THREE.MeshLambertMaterial({color: 0xF5F5F5});
    var plane = new THREE.Mesh(planeGeo, planeMat);
    DDD.group.add(plane);

    //light
    DDD.hemisphere = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
 	DDD.scene.add(DDD.hemisphere);

	// make a sun (zon)
 	DDD.zon = new THREE.PointLight(0xFFFFFF);
	DDD.zon.position.x = 1000;
	DDD.zon.position.y = 1000;
	DDD.zon.position.z = 1000;
	DDD.zon.intensity = 0.2;
	DDD.scene.add(DDD.zon);

    //camera
    DDD.setCameraControls();

    //action
    DDD.clock = new THREE.Clock();
    DDD.animate();

    DDD.enabled = true;

};

DDD.setCameraControls = function(){

	DDD.controls = new THREE.FirstPersonControls( DDD.camera );

	DDD.controls.movementSpeed = 100;
	DDD.controls.lookSpeed = 0.125;
	DDD.controls.lookVertical = true;
	DDD.controls.constrainVertical = true;
	DDD.controls.verticalMin = 1.4;
	DDD.controls.verticalMax = 2.2;
};

DDD.animate = function(){

	//pause
    if(DDD.pause) return false;

    //shedule next frame
    requestAnimationFrame( DDD.animate );

    //check if all objects are loaded
    if(!DDD.loaded) return false;

    //update
    DDD.controls.update( DDD.clock.getDelta() );

    //render
    DDD.renderer.render( DDD.scene, DDD.camera );

}