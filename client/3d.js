window.DDD = {};

DDD.init = function(center, zoom){


    //camera
    DDD.camera = new THREE.PerspectiveCamera( 45 , window.innerWidth / window.innerHeight, 0.1, 7000 );
    DDD.camera.position.z = 500;
    DDD.camera.position.y = 200;

    DDD.setScene(center, zoom);
    DDD.setLight();

    //element
    DDD.$ = $('body .visualization');

    //start
    DDD.renderer = new THREE.WebGLRenderer();
    DDD.renderer.setSize( DDD.$.width(), DDD.$.height() );

    DDD.$.append( DDD.renderer.domElement );

    //camera
    DDD.setControls();
    DDD.scene.camera = new CameraPosition(DDD.scene, DDD.camera, DDD.controls, DDD.group);
    DDD.addCameras();

    //FX
    DDD.FX = new FX(DDD.renderer, DDD.scene, DDD.camera);

    //action
    DDD.clock = new THREE.Clock();
    DDD.animate();

    DDD.enabled = true;

};

DDD.setScene = function(center, zoom){

	//make scene
    DDD.scene = new THREE.Scene();
    DDD.group = new THREE.Object3D();
    DDD.scene.add(DDD.group);
    DDD.group.rotateX(-Math.PI/2);

    //translation
    var points = new Points(center, zoom);
    DDD.scene.points = points;

    //preloader
    DDD.preloader = new Preloader();
    DDD.scene.preloader = DDD.preloader;

    //timeline
    DDD.timeline = new Timeline();
    DDD.scene.timeline = DDD.timeline;

    //fog
    DDD.scene.fog = new THREE.FogExp2( 0xFFFFFF, 0.0005 );
    DDD.scene.fog.night = new THREE.Color(0x222222);
    DDD.scene.fog.day = new THREE.Color(0xFFFFFF);
    DDD.timeline.addFog(DDD.scene.fog, 1, 0.12);

}

DDD.addCameras = function(){

	//add points

    DDD.scene.camera.add(9, [51.67285, 5.29323], [51.69203, 5.30217], 2500); //Overview top
    DDD.scene.camera.add(0, [51.67285, 5.29323], [51.69203, 5.30217], 500); //Overview
    DDD.scene.camera.add(1, [51.68877, 5.31707], [51.68873, 5.31170], 80); //Z-Willemsvaart. 
    DDD.scene.camera.add(2, [51.69088, 5.30097], [51.69402, 5.29868], 220); //Brugplein
    DDD.scene.camera.add(3, [51.72748, 5.30275], [51.72380, 5.30920], 150); //Maaspoort
    DDD.scene.camera.add(4, [51.67950, 5.29550], [51.68490, 5.29408], 150); //Wilhelminapleim
    DDD.scene.camera.add(5, [51.68105, 5.30482], [51.68515, 5.30353], 250); //Zuidwal

	//switch to first
    DDD.scene.camera.switchTo(9);
    DDD.scene.camera.switchTo(0);

}

DDD.setControls = function(){

	DDD.controls = new THREE.FirstPersonControls( DDD.camera );

	DDD.controls.freeze = true;

	DDD.controls.movementSpeed = 100;
	DDD.controls.lookSpeed = 0.125;
	DDD.controls.lookVertical = true;
	DDD.controls.constrainVertical = true;
	DDD.controls.verticalMin = 1.4;
	DDD.controls.verticalMax = 2.2;

};

DDD.setLight = function(){

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

	//add to timeline
	DDD.timeline.addLight(DDD.hemisphere,0.8,0.2);
	DDD.timeline.addLight(DDD.zon,0.2,0.1);

}

DDD.animate = function(){

	//pause
    if(DDD.pause) return false;

    //shedule next frame
    requestAnimationFrame( DDD.animate );

    //check if all objects are loaded
    if(!DDD.preloader.ready) {

    	//need to load
    	if(DDD.preloader.started) {
    		DDD.preloader.loading();
    	}

    	return false;
    }

    //still seeing intro
    if(!DDD.preloader.hidden) return false;

    //timeline
    var delta = DDD.clock.getDelta();
    if(DDD.timeline.needsUpdate) DDD.timeline.render( delta );
    if(DDD.scene.camera.needsUpdate) DDD.scene.camera.render( delta );

    //controls
    DDD.controls.update( delta );

    //render
    // DDD.renderer.render( DDD.scene, DDD.camera );
    DDD.FX.render(delta);

}

/*
//resize
window.onresize = _.debounce(function(){

    //intro
    //if(!DDD.preloader.ready) Template.intro.resize();

    //update normal renderer
    DDD.renderer.setSize( DDD.$.width(), DDD.$.height() );
    DDD.camera.aspect = DDD.$.width() / DDD.$.height();
    DDD.camera.updateProjectionMatrix();

    //update fx
    DDD.FX.resize();
})
*/