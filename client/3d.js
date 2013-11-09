window.DDD = {

	material: {},

	buildings: []

};

DDD.init = function(){

	//camera
	DDD.camera = new THREE.PerspectiveCamera( 45 , window.innerWidth / window.innerHeight, 0.1, 5000 );
    DDD.camera.position.z = 500;

    //make scene
    DDD.scene = new THREE.Scene();

    //start
    DDD.renderer = new THREE.WebGLRenderer();
    DDD.renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( DDD.renderer.domElement );

    //make material
    DDD.material.building = new THREE.MeshLambertMaterial({
    	//wireframe: true,
    	color: 0x95a5a6,
    	shading: THREE.FlatShading,
    });

    var planeGeo = new THREE.PlaneGeometry(5000, 5000, 50, 50);
    var planeMat = new THREE.MeshLambertMaterial({color: 0xecf0f1});
    var plane = new THREE.Mesh(planeGeo, planeMat);
    //plane.rotation.x = -Math.PI/2;
    DDD.scene.add(plane);

    //light
    var hemisphere = new THREE.HemisphereLight(0xffffff, 0x999999, 1);
 	DDD.scene.add(hemisphere);

    //camera
    DDD.setCameraControls();

    //action
    DDD.animate();

    DDD.enabled = true;

};

DDD.setCameraControls = function(){
	DDD.controls = new THREE.FlyControls( DDD.camera );
	//DDD.controls = new THREE.OrbitControls( DDD.camera );

	DDD.controls.movementSpeed = 50;
	DDD.controls.domElement = DDD.renderer.domElement;
	DDD.controls.rollSpeed = Math.PI / 8;
	DDD.controls.autoForward = false;
	DDD.controls.dragToLook = false;
};

DDD.animate = function(){

	//pause
    if(DDD.pause) return false

    //shedule next frame
    requestAnimationFrame( DDD.animate );

    DDD.controls.update(0.1);

    //render
    DDD.renderer.render( DDD.scene, DDD.camera );

}

DDD.loadData = function(d){

	//loop through BAG data
	$.each(d, function(key,val){
		DDD.addBAG(val.geom.coordinates);
		// return false;
	});

};

DDD.addBAG = function(obj){

	//loop through polygones
	$.each(obj, function(key,val){

		//get points
		var points = DDD.getPoints(val);
		var shape = new THREE.Shape(points);
		
		//settings
		var extrusionSettings = {
			amount: Math.random()*20 + 10,
			//bevelSize: 15,
			bevelEnabled: false,
			//steps: 0,
			bevelThickness: 0
		};

		//extrude & make mesh
		var geometry = new THREE.ExtrudeGeometry( shape, extrusionSettings );
		var building = new THREE.Mesh( geometry, DDD.material.building );

		// building.position.x = points[0].x;
		// building.position.y = points[0].y;
		//building.scale.set(10,10,0);

		DDD.buildings.push(building);
		DDD.scene.add(building);

	});

}

DDD.getPoints = function(obj){
	var points = [];

	for(var i = 0 ; i < obj.length ; i++){
		points.push( DDD.translatePoint2D([ obj[i][0],obj[i][1] ]) );
	}

	return points;
}

DDD.translatePoint2D = function(point2){
	var coords = geo.projection([ +point2[1], +point2[0] ]);
	var center = geo.centerProjection;

	var point = [];
	var mp = 100000;
	// point[0] = (point2[0] * mp) - (geo.center[1]*mp);
	// point[1] = (point2[1] * mp) - (geo.center[0]*mp);
	point[0] = coords[0] - center[0];
	point[1] = coords[1] - center[1];

	// console.log(point);

	return new THREE.Vector2(point[0],point[1]);
}