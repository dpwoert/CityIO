var THREE = require('three');

module.exports = function(){

	var list = [];
	var end = false;
	var clock = new THREE.Clock();

	var createProcess = function(a1, a2){

		var id, fn;

		if(a1 instanceof Function){
			id = THREE.Math.generateUUID();
			fn = a1;
		} else{
			id = a1;
			fn = a2;

			//prevent double id's
			this.remove(id);
		}

		return {
			'task': fn,
			'id': id
		};

	}.bind(this);

	this.add = function(a1, a2){

		var _process = createProcess(a1, a2);
		list.push(_process);
		return _process.id;

	};

	this.addBefore = function(before, a1, a2){

		var _process = createProcess(a1, a2);

		//add to correct place
		var index = list.indexOf(before);
		list.splice(index, 0, _process);

		return _process.id;

	};

	this.addAfter = function(a1, a2, before){

		before = before || a2;
		var _process = createProcess(a1, a2);

		//add to correct place
		var index = list.indexOf(before) + 1;
		list.splice(index, 0, _process);

		return _process.id;

	};

	this.remove = function(id){

        for( var i = 0 ; i < list.length ; i++ ){

            if( list[i].id === id){
                list.splice(i, 1);
            }

        }

    };

    this.clear = function(){
        list = [];
		clock.stop();
    };

	var render = function(){

		//stop when needed
        if(end) {
            end = false;
            return false;
        }

        //shedule next frame [TODO add shim]
        requestAnimationFrame( render );

        //delta
        var delta = clock.getDelta();

        for( var i = 0 ; i < list.length ; i++ ){

            list[i].task(delta);

        }

	};

	this.start = function(){
		end = false;
        render();
    };

    this.stop = function(clear){
        end = true;

		if(clear){
			this.clear();
		}
    };

};
