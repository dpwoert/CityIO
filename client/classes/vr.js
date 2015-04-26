var VR_Effect = require('../lib/vr-effect.js');
var VRControls = require('../lib/vr-controls.js');

module.exports = function(world){

    this.support = navigator.mozGetVRDevices || navigator.getVRDevices;

    world.renderer.setClearColor(0xffffff, 1);

    //load controls
    controls = new VRControls( world.camera );

    //size
    var width = window.innerWidth;
    var height = window.innerHeight;

    //load effect
    var VREffect = new VR_Effect( world.FX.composer.renderer );
	VREffect.setSize( width, height );

    //controls update - only when supported
    if(this.support){
        world.render.addBefore('fx', 'controls', controls.update);
    }

    //update stereoscopic vision
    world.render.add('vr', function(delta){
        VREffect.render(world.scene, world.camera);
    });

    this.start = function(){

        world.start();
        IO.VREffect.setFullScreen( true );
        this.resize();
        controls.zeroSensor();

    };

    this.resize = function(){

        world.resize();
        VREffect.setSize( window.innerWidth, window.innerHeight );

    };

}
