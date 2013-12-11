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
		colors: [0xFAFAFA, 0xBFBCB8, 0x7F7E7A, 0x403F3D, 0x313133]
	},

	//street heights
	groundlines: false,
	streetHeights: d3.scale.log().domain([50,75]).range([1,50]).base(2)

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

    //fog
    DDD.scene.fog = new THREE.FogExp2( 0xFFFFFF, 0.0003 );

    //start
    DDD.renderer = new THREE.WebGLRenderer();
    DDD.renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( DDD.renderer.domElement );

    //make material
   	DDD.makeMaterials();

   	//floor
    var planeGeo = new THREE.PlaneGeometry(3000, 3000, 10, 10);
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

		//make cache for merge
		if(DDD.merge){
			DDD.cacheGeom[i] = new THREE.Geometry();
		}
	}

	//lines
    DDD.material.streetTube = new THREE.MeshLambertMaterial({
    	color: 0xFF0000,
    	//shading: THREE.FlatShading,
	}); 

	DDD.cacheTube = new THREE.Geometry();
	var streets3D = new THREE.Mesh ( DDD.cacheTube , DDD.material.streetTube );
	DDD.group.add(streets3D);


}

DDD.addBuilding = function(building,data){

	//loop through polygones
	$.each(building, function(key,val){

		//group on pollution
		var no2 = data.fijnstof ? data.fijnstof.no2 : DDD.pollution.min;
		var groupKey = Math.round(DDD.pollution.scale(no2));
		var material = DDD.material.building[groupKey];

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

			if(DDD.merge){
				THREE.GeometryUtils.merge(DDD.cacheGeom[groupKey],geometry);
			} else {
				//don't merge and add userdata
				var building3D = new THREE.Mesh( geometry , material );

				//save userdata to model
				building3D.userData = userdata;

				//add to stage
				DDD.buildings.push(building3D);
				DDD.group.add(building3D);
				
			}

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

DDD.buildingsFinished = function(){

	//merge buildings
	if(DDD.merge){

		for(var i = 0; i < DDD.pollution.steps; i++){

			building3D = new THREE.Mesh(DDD.cacheGeom[i], DDD.material.building[i]);

			DDD.buildings.push(building3D);
			DDD.group.add(building3D);

		}

	}

	DDD.loaded = true;

	console.log('buildings added');
}

DDD.addStreet = function(points, data){

	var points2D = DDD.getPoints(points);

	//sort sound data
	var soundNight = data.soundNight.sort(function(a,b){return a.key-b.key});
	var soundDay = data.soundDay.sort(function(a,b){return a.key-b.key});

	//geometry
	// var geom = new THREE.Geometry();
	var path = [];

	$.each(points, function(key,point){

		//get height
		var height = soundDay[key] ? DDD.streetHeights(soundDay[key].db) : 1;

		//points
		var V2 = DDD.translatePoint2D([ point[1],point[0] ]);
		var V3 = new THREE.Vector3( V2.x , V2.y , height );

		// geom.vertices.push(V3);
		path.push(V3);

		//line down
		if(DDD.groundlines){

			var geom2 = new THREE.Geometry();
			geom2.vertices.push(new THREE.Vector3( V2.x , V2.y , 1 ));
			geom2.vertices.push(new THREE.Vector3( V2.x , V2.y , height ));
			var line2 = new THREE.Line(geom2, DDD.material.street2);
			DDD.group.add(line2);

		}
	});

	if(path.length > 0){

		//make line
		// var line = new THREE.Line(geom, DDD.material.street);
		// DDD.group.add(line);

		//make tube
		var path3D = new THREE.SplineCurve3(path);
		var tube = new THREE.TubeGeometry(path3D, 10, 1.2, 10, false, true);
		THREE.GeometryUtils.merge(DDD.cacheTube,tube);

	}


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
	point[0] = coords[0] - center[0];
	point[1] = coords[1] - center[1];

	// console.log(point);

	return new THREE.Vector2(point[0],point[1]);
};