window.DDD = {

	//collections
	material: {},
	buildings: [],
	groups: [],

	//options
	merge: false,

	//colors
	pollution: {
		min: 20.806,
		max: 45.5,
		steps: 6,
		colors: [0xbdc3c7,0xB1DEBC, 0x6CD6A0,0x009470,0x009470,0xB32706]
	}

};

DDD.init = function(){

	//camera
	DDD.camera = new THREE.PerspectiveCamera( 45 , window.innerWidth / window.innerHeight, 0.1, 3000 );
    DDD.camera.position.z = 500;
    DDD.camera.position.y = 200;
    // DDD.camera.rotation.order = "YXZ";

    //make scene
    DDD.scene = new THREE.Scene();
    DDD.group = new THREE.Object3D();
    DDD.scene.add(DDD.group);
    DDD.group.rotateX(-Math.PI/2);

    //start
    DDD.renderer = new THREE.WebGLRenderer();
    DDD.renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( DDD.renderer.domElement );

    //make material
   	DDD.makeMaterials();

    var planeGeo = new THREE.PlaneGeometry(2500, 2500, 10, 10);
    var planeMat = new THREE.MeshLambertMaterial({color: 0xecf0f1});
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
	// DDD.controls = new THREE.FlyControls( DDD.camera );

	// DDD.controls.movementSpeed = 50;
	// DDD.controls.rollSpeed = Math.PI / 8;
	// DDD.controls.autoForward = false;
	// DDD.controls.dragToLook = false;

	DDD.controls = new THREE.FirstPersonControls( DDD.camera );

	DDD.controls.movementSpeed = 100;
	DDD.controls.lookSpeed = 0.125;
	DDD.controls.lookVertical = true;
	DDD.controls.constrainVertical = false;
	// DDD.controls.verticalMin = 1.1;
	// DDD.controls.verticalMax = 2.2;
};

DDD.animate = function(){

	//pause
    if(DDD.pause) return false;

    //shedule next frame
    requestAnimationFrame( DDD.animate );

    //check if all objects are loaded
    if(DDD.buildings.length < 10000) return false;

    //update
    DDD.controls.update( DDD.clock.getDelta() );

    //render
    DDD.renderer.render( DDD.scene, DDD.camera );

}

DDD.makeMaterials = function(){

	//make scale for pollution
	DDD.pollution.scale = d3.scale.linear()
		.domain([DDD.pollution.min, DDD.pollution.max])
		.range([0,DDD.pollution.steps-1]);

	//start
	DDD.material.building = [];

	//loop
	for(var i = 0; i < DDD.pollution.steps; i++){

		DDD.material.building[i] = new THREE.MeshLambertMaterial({
	    	color: DDD.pollution.colors[i],
	    	shading: THREE.FlatShading,
	    	// transparent: true,
	    	// opacity: 0.5
    	}); 

	}

}

DDD.addBuilding = function(building,data){

	//loop through polygones
	$.each(building, function(key,val){

		//group on pollution
		var material = DDD.material.building[Math.round(DDD.pollution.scale(data.fijnstof.no2))];

		//get points
		var points = DDD.getPoints(val);
		var shape = new THREE.Shape(points);

		//make height
		var height;
		if(data.height) { height = data.height; }
		else { height = data.calculated }
		height *= geo.pixelScale;

		//add data
		var userdata = {};
		userdata.id = data.id;
		userdata.bouwjaar = +data.bouwjaar;
		userdata.height = data.calculated;
		userdata.height3D = height;
		userdata.fijnstof = data.fijnstof;
		userdata.raw = data;

		//add debug data
		userdata.tile = {
			url: data.tileUrl,
		    point: data.tilePoint
		}

		//make model?
		if(!data.url){

			//settings
			var extrusionSettings = {
				amount: height,
				//bevelSize: 15,
				bevelEnabled: false,
				//steps: 0,
				bevelThickness: 0,
				steps: 1
			};

			//extrude & make mesh
			var geometry = new THREE.ExtrudeGeometry( shape, extrusionSettings );
		    //var bufferGeometry = THREE.BufferGeometryUtils.fromGeometry( geometry );
			var building3D = new THREE.Mesh( geometry , material );

			//save userdata to model
			building3D.userData = userdata;

			//add to stage
			DDD.buildings.push(building3D);
			DDD.group.add(building3D);

		}
		//load model
		else {
			DDD.loadModel(data.url, material, userdata);
		}

	});

};

DDD.loadModel = function(url, material, userdata){

	loader = new THREE.JSONLoader();
	loader.load( 'models/' + url , function( geometry ) {

		mesh = new THREE.Mesh( geometry, material );
		mesh.userData = userdata;
		mesh.userData.custom = true;

		//add to stage
		DDD.buildings.push(mesh);
		DDD.group.add( mesh );

	} );

}

DDD.getPoints = function(obj){
	var points = [];

	for(var i = 0 ; i < obj.length ; i++){
		points.push( DDD.translatePoint2D([ obj[i][0],obj[i][1] ]) );
	}

	return points;
};

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
};