var ShaderPass = require('../../lib/shader-pass.js');
var HorizontalTiltShiftShader = require('../../lib/horizontal-tilt-shift-shader.js');
var VerticalTiltShiftShader = require('../../lib/vertical-tilt-shift-shader.js');

module.exports = function(scene, camera, renderer, world){

    //check
    if(!this.composer){
        console.warn('composer not found');
        return false;
    }

    var current;

    //abbility to set
    this.setBlur = function(blur, point, spread, animate){

        spread = spread || 1;

        //only set
        if(!animate){

            this.hblur.uniforms.h.value = blur / window.innerWidth;
            this.vblur.uniforms.v.value = blur / window.innerHeight;
            this.hblur.uniforms.r.value = point;
            this.vblur.uniforms.r.value = point;
            this.hblur.uniforms.spread.value = spread;
            this.vblur.uniforms.spread.value = spread;

            //save
            current = [blur, point, spread];

        }

        //animate
        else {

            var anim = new IO.classes.Animation(world);
            var duration = animate === true ? 1000 : animate;

            //custom setter function for animation
            var fn = function(property, progress, options, lerp){

                var blur = lerp(options.from[0], options.to[0], progress);
                var point = lerp(options.from[1], options.to[1], progress);
                var spread = lerp(options.from[2], options.to[2], progress);
                property.setBlur(blur, point, spread);

            };

            //add property
            anim.add(this, {
                'from': current,
                'to': [blur, point, spread],
                'duration': duration,
                'tick': fn
            });

            //start
            anim.start();

        }

    };

    //init
    this.hblur = new ShaderPass(HorizontalTiltShiftShader);
    this.vblur = new ShaderPass(VerticalTiltShiftShader);
    this.setBlur(20, 0.55, 1.65);

    this.composer.addPass(this.hblur);
    this.composer.addPass(this.vblur);

};
