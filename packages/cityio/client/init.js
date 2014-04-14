var setScene = function(){

    //make scene
    IO.scene = new THREE.Scene();
    IO.group = new THREE.Object3D();
    IO.scene.add(IO.group);
    IO.group.rotateX(-Math.PI/2);

    //translation
    IO.points = new IO.classes.Points(IO.center, IO.zoom);

    //timeline
    IO.timeline = new IO.classes.Timeline();

    //fog
    IO.scene.fog = new THREE.FogExp2( 0xFFFFFF, 0.0005 );
    IO.scene.fog.night = new THREE.Color(0x222222);
    IO.scene.fog.day = new THREE.Color(0xFFFFFF);
    IO.timeline.addFog(IO.scene.fog, 1, 0.12);

}

var setControls = function(){

    IO.controls = new THREE.FirstPersonControls( IO.camera );

    IO.controls.freeze = true;

    IO.controls.movementSpeed = 100;
    IO.controls.lookSpeed = 0.05;
    IO.controls.lookVertical = true;
    IO.controls.constrainVertical = true;
    IO.controls.verticalMin = 1.4;
    IO.controls.verticalMax = 2.2;

};

var setLight = function(){

    //light
    var hemisphere = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
    IO.scene.add(hemisphere);

    // make a sun (zon)
    var zon = new THREE.PointLight(0xFFFFFF);
    zon.position.x = 1000;
    zon.position.y = 1000;
    zon.position.z = 1000;
    zon.intensity = 0.2;
    IO.scene.add(zon);

    //add to timeline
    IO.timeline.addLight(hemisphere,0.8,0.2);
    IO.timeline.addLight(zon,0.2,0.1);

}

IO.start3d = function(){

    this.renderList.push(

        function(delta){
            if(IO.timeline.needsUpdate) IO.timeline.render( delta );
        },
        function(delta){
            if(IO.cameraControl.needsUpdate) IO.cameraControl.render( delta );
        },
        function(delta){
            IO.controls.update( delta );
        },
        function(delta){
            IO.FX.render( delta );
        }

    );

}

IO.init = function(pos, zoom){

	//check
	IO.zoom = zoom || 22;
	if(!pos) console.warn('no position given');
	IO.center = pos;

    console.log('init');

	//camera
    IO.camera = new THREE.PerspectiveCamera( 45 , window.innerWidth / window.innerHeight, 0.1, 7000 );
    IO.camera.position.z = 500;
    IO.camera.position.y = 200;

    setScene();
    console.log('scene added');
    setLight();

    console.log('light added');

    //element - remove jq, use jq-lite or other option
    IO.$element = $('body .visualization');

    //start
    IO.renderer = new THREE.WebGLRenderer();
    IO.renderer.setSize( IO.$element.width(), IO.$element.height() );

    IO.$element.append( IO.renderer.domElement );

    //camera
    setControls();
    IO.cameraControl = new IO.classes.CameraPosition();

    //FX
    IO.FX = new IO.classes.FX();

    //action
    IO.clock = new THREE.Clock();
    IO.render();
    IO.enabled = true;

};
