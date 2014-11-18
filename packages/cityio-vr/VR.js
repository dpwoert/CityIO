IO.loadVR = function(){

    console.log('checking for VR');

    if(navigator.mozGetVRDevices || navigator.getVRDevices){

        console.info('VR Device detected');

        //load controls
        IO.controls = new THREE.VRControls( IO.camera );

        console.log('controls created');

        console.log(IO.renderer);

        //load effect
        IO.VREffect = new THREE.VREffect( IO.renderer );
    	IO.VREffect.setSize( window.innerWidth, window.innerHeight );

        IO.renderList.push(function(delta){
            // IO.VREffect.render(delta);
        });

    } else {

        console.info('VR Device not detected');

    }

}
