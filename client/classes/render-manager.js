var THREE = require('three');

module.exports = function(){

	var list = [];
	var end = false;
	var clock = new THREE.Clock();

	this.add = function(fn){

		var id = THREE.Math.generateUUID();

		list.push({
			'task': fn,
			'id': id
		});

		return id;
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
