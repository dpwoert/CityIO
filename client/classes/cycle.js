module.exports = function(world, time){

    var currentProcess;
    var list = [];
    var lights = [];

    //animation properties
    this.duration = 1000;
    time = time || 0;
    var start, from;

    //shortcut to fog
    var fog = world.scene.fog;

    //add to world
    world.cycle = this;

    //update fn
    var update = function(delta){

        //calculate time [TODO]
        progress = +Date.now() - start;
        progress = progress / this.duration;

        console.log(progress);

        //prevent over reaching & finish
        if(progress > 1){
            progress = 1;
            world.render.remove(currentProcess);
        }

        //destination
        var delta = time - from;
        var _time = from + (delta*progress);
        // console.log('time', _time);

        //prevent
        if(_time > 1) time = 1;
        if(_time < 0) time = 0;

        //update fog
        var fogColor = fog.day.lerp(fog.night, _time);
        fog.color.copy(fogColor);

        //animate BG color
		if(world.FX.active){
			world.FX.setBackground(fogColor);
		} else {
			world.renderer.setClearColor(fogColor, 1);
		}

        //update functions in list
        for( var i = 0 ; i < list.length ; i++ ){
            list[i](_time, fogColor);
        }

        //lights
        for( var i = 0 ; i < lights.length ; i++ ){

            var light = lights[i];
            var intensity = (light.day - light.night) * _time;
            intensity = light.day - intensity;
            light.object.intensity = intensity;

        }

    }.bind(this);

    this.setTime = function(_time){

        //don't animate when time doesn't change
        if(_time === time){
            return false;
        }

        currentProcess = world.render.add(update);
        start = +Date.now();

        from = time;
        time = _time;
    };

    this.addLight = function(light, day, night){
        lights.push({ 'object': light, 'day': day, 'night': night });
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
