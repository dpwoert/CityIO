IO.VR = navigator.mozGetVRDevices || navigator.getVRDevices;

IO.loadVR = function(){

    console.log('checking for VR');
    //https://github.com/MozVR/vr-web-examples/blob/master/threejs-vr-boilerplate/index.html

    if(IO.VR){

        console.info('VR Device detected');

        //load controls
        IO.controls = new THREE.VRControls( IO.camera );

        console.log('controls created');

        //size
        var width = window.innerWidth;
        var height = window.innerHeight;

        //load effect
        IO.VREffect = new THREE.VREffect( IO.renderer );
    	IO.VREffect.setSize( width, height );

        IO.renderList = [

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
                IO.VREffect.render(IO.scene, IO.camera);
            }

        ];

        document.body.addEventListener( 'dblclick', function() {
            IO.VREffect.setFullScreen( true );
            IO.resize();
        });

        //remove menubar
        $('#sidebar').remove();

        //resize function
        IO.resize = function(){

            console.log('VR resize');

            $e = $('body .visualization');
            IO.camera.aspect = window.innerWidth/window.innerHeight;
            IO.camera.updateProjectionMatrix();
            IO.VREffect.setSize( window.innerWidth, window.innerHeight );


        }

    } else {

        console.info('VR Device not detected');

    }

};
