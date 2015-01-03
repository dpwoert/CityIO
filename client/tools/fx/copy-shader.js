var CopyShader = require('../../lib/copy-shader.js');
var ShaderPass = require('../../lib/shader-pass.js');

module.exports = function(){

	//check
	if(!this.composer){
		console.warn('composer not found');
		return false;
	}

	//copy pass?
	var copyPass = new ShaderPass(CopyShader);
	copyPass.renderToScreen = true;
	this.composer.addPass(copyPass);

};
