module.exports = function(world, time){

    var currentProcess;
    var list = [];
    var lights = [];

    //animation properties
    this.duration = 1000;
    time = time || 0;
    var start;

    //shortcut to fog
    var fog = world.scene.fog;

    //add to world
    world.cycle = this;

    //update fn
    var update = function(delta){

        //calculate time [TODO]
        time = +Date.now() - start;
        time = time / this.duration;

        //prevent over reaching & finish
        if(time > 1){
            time = 1;
            world.render.remove(currentProcess);
        }

        //update fog
        var fogColor = fog.day.lerp(fog.night, time);
        fog.color.copy(fogColor);

        //animate BG color
		if(IO.FX){
			world.FX.setBackground(fogColor);
		} else {
			world.renderer.setClearColor(fogColor, 1);
		}

        //update functions in list
        for( var i = 0 ; i < list.length ; i++ ){
            list[i](time, fogColor);
        }

        //lights
        //todo

    }.bind(this);

    this.setTime = function(time){
        currentProcess = world.render.add(update);
        start = +Date.now();
    };

    this.addLight = function(light, day, night){
        lights.push({ 'light': light, 'day': day, 'night': night });
    };

    this.addFunction = function(fn){
        list.push(fn);
    };

    this.addObject = function(object, key){

        this.addFunction(function(time){
            object[key] = time;
        });

    };

};
