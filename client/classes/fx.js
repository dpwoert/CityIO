var THREE = require('three');
var EffectComposer = require('../lib/effect-composer.js');
var RenderPass = require('../lib/render-pass.js');

module.exports = function(renderer, scene, camera, world){

	//active when not using VR
	this.active = true;

	// this.dpr = window.devicePixelRatio || 1;
	this.dpr = 2;

	//Create Shader Passes
	this.composer = new EffectComposer(renderer);
	this.composer.setSize(renderer.domElement.offsetWidth * this.dpr, renderer.domElement.offsetHeight * this.dpr);
	this.renderPass = new RenderPass(scene, camera, null, new THREE.Color(0xFFFFFF));
	this.composer.addPass(this.renderPass);

	//get max size
	var gl = renderer.context;
	var max = gl.getParameter(gl.MAX_TEXTURE_SIZE);

	//abbility to add FX
	this.add = function(name){
		IO.FXlib[name].call(this, scene, camera, renderer, world);
		return this; //chainable
	};

	//always add FXAA
	// this.add('FXAA');

	this.render = function(delta){
		this.composer.render(delta);
	}.bind(this);

	this.setBackground = function(color){
		this.renderPass.clearColor = color;
		return this;
	};

	this.resize = function(){

		var width = renderer.domElement.offsetWidth * this.dpr;
		var height = renderer.domElement.offsetHeight * this.dpr;
		var ratio;

		if(width < 1024){
			width = 1024;
		}

		//check for max. texture size for dimensions
		if(width > height && width > max){

			ratio = height/width;
			width = max;
			height *= ratio;

		}
		else if( height > width && height > max ){

			ratio = width/height;
			height = max;
			max *= ratio;

		}

		//on resize
		this.composer.setSize(width, height);
		if(this.effectFXAA){
			this.effectFXAA.uniforms.resolution.value.set(1 / width, 1 / height);
		}

	};

	this.destroy = function(){

		this.composer.reset();
		this.composer.renderTarget1.dispose();
		this.composer.renderTarget2.dispose();

		this.composer.renderTarget1 = undefined;
		this.composer.renderTarget2 = undefined;

	};

};
