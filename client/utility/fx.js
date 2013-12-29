window.FX = function(renderer, scene, camera){

	var dpr = window.devicePixelRatio || 1;
	
	this.init = function(){

		//Create Shader Passes
	    this.composer = new THREE.EffectComposer(renderer);
        this.composer.setSize(window.innerWidth * dpr, window.innerHeight * dpr);
	    this.renderPass = new THREE.RenderPass(scene, camera, null, new THREE.Color(0xFFFFFF));
	    this.composer.addPass(this.renderPass);

	    //FXAA - AntiAliasing
	    var effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
        var width = window.innerWidth || 2;
        var height = window.innerHeight || 2;
        effectFXAA.uniforms['resolution'].value.set(1 / (width * dpr ), 1 / (height * dpr ));
        this.composer.addPass(effectFXAA);

        //Tilt shift
        this.hblur = new THREE.ShaderPass(THREE.HorizontalTiltShiftShader);
        this.vblur = new THREE.ShaderPass(THREE.VerticalTiltShiftShader);
        this.setBlur(2.5, 0.5);

        this.composer.addPass(this.hblur);
        this.composer.addPass(this.vblur);

        //film grain
        var effectFilm = new THREE.FilmPass(0.025, 0, 100, false);
        this.composer.addPass(effectFilm);

	    //copy pass?
	    var copyPass = new THREE.ShaderPass(THREE.CopyShader);
	    copyPass.renderToScreen = true;
	    this.composer.addPass(copyPass);

	}.call(this);

	this.setBackground = function(color){
		this.renderPass.clearColor = color;
	}

	this.setBlur = function(blur, point){

		var bluriness = blur;

        this.hblur.uniforms['h'].value = bluriness / window.innerWidth;
        this.vblur.uniforms['v'].value = bluriness / window.innerHeight;
        this.hblur.uniforms['r'].value = this.vblur.uniforms['r'].value = point;

	}

	this.render = function(delta){
		this.composer.render(delta);
	}

}