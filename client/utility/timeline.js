window.Timeline = function(){

	//day = 0 | night = 1
	this.now = 0;
	this.day = true;

	this.items = [];
	
	//add to html
	this.init = function(){

		//animation scale
		this.scale = d3.scale.pow()
			.domain([0,1])
			.range([0,1])
			.exponent(1.1)
			.clamp(true)

	}.call(this);

	//switch between day/night
	this.switch = function(){
		this.needsUpdate = true;
		this.day = this.day ? false : true;
	};

	this.render = function(delta){

		debugger

		var to = this.day ? 0 : 1;

		//animate
		for( var i = 0 ; i < this.items.length ; i++ ){
			this.items[i].changeTime(this.now);
		}

		//end?
		if(to == this.now) this.needsUpdate = false;

	};

	this.add = function(list){

		for( var i = 0 ; i < list.length ; i++ ){
			this.items.push(list[i]);
			list[i].changeTime(this.now);
		}

	}

}