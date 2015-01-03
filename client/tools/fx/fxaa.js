var ShaderPass = require('../../lib/shader-pass.js');
var FXAAShader = require('../../lib/fxaa.js');

module.exports = function(){

	//check
	if(!this.composer){
		console.warn('composer not found');
		return false;
	}

	//FXAA - AntiAliasing
	this.effectFXAA = new ShaderPass(FXAAShader);
	// var width = window.innerWidth || 2;
	// var height = window.innerHeight || 2;
	// this.effectFXAA.uniforms.resolution.value.set(1 / (width * this.dpr ), 1 / (height * this.dpr ));
	this.composer.addPass(this.effectFXAA);

};
