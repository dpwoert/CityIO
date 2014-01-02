window.Timeline = function(){

	//day = 0 | night = 1
	this.now = 0;
	this.day = true;

	this.items = [];
	this.lights = [];
	this.fog = null;
	
	//add to html
	this.init = function(){

		//animation scale
		this.scale = d3.scale.pow()
			.domain([0,1])
			.range([0,1])
			.exponent(1.1)
			.clamp(true);

	}.call(this);

	//switch between day/night
	this.switch = function(){
		this.needsUpdate = true;
		this.day = this.day ? false : true;

		console.log('switch light');
	};

	this.switchTo = function(day){
		this.needsUpdate = true;
		this.day = day;
	}

	this.render = function(delta){

		var d = (delta * 0.25);

		if(this.day){
			this.now -= d;
		} else {
			this.now += d;
		}

		//check
		if(this.now > 1) this.now = 1;
		if(this.now < 0) this.now = 0;

		//animate items
		for( var i = 0 ; i < this.items.length ; i++ ){
			this.items[i].changeTime(this.now);
		}

		// animate lights
		for( var j = 0 ; j < this.lights.length ; j++ ){
			var light = this.lights[j];
			light.light.intensity = light.scale(this.now);
		}

		var fogColor = this.fog.scale(this.now);
		this.fog.fog.color.r = fogColor;
		this.fog.fog.color.g = fogColor;
		this.fog.fog.color.b = fogColor;

		// DDD.renderer.setClearColor(this.fog.fog.color, 1);
		DDD.FX.setBackground(this.fog.fog.color);

		//end?
		if(this.now == 0 || this.now == 1){
			this.needsUpdate = false;
			console.log('timeline animation done');
		} 

	};

	this.add = function(list){

		for( var i = 0 ; i < list.length ; i++ ){
			this.items.push(list[i]);
			list[i].changeTime(this.now);
		}

	};

	this.addLight = function(light, day, night){

		//save
		this.lights.push({
			'light': light,
			'scale': d3.scale.linear().domain([ 0,1 ]).range([ day, night ])
		});

		light.intensity = day;

	}

	this.addFog = function(fog, day, night){

		this.fog = {
			'fog': fog,
			'scale': d3.scale.linear().domain([ 0,1 ]).range([ day, night ])
		}

	}

}