var q = require('q');
var PNGReader = require('png.js');

module.exports = function(image, options){

    var values = [];
    var translate;

    this.promises = [];

    this.translate = function(fn){

        translate = fn;
        return this;

    };

    this.read = function(image, method, options){

        //prevent
        if(!translate){
            console.error('no translation function for rgba to a value');
            return false;
        }

        //options always is object (to prevent errors)
        options = options || {};

        //method to get to one value (grid | point)
        method = method || 'grid';

        //add promise
        var defer = q.defer();
        this.promises.push(defer.promise);

        //read PNG [todo add more image options]
	    var reader = new PNGReader(image);
	    reader.parse(function(err,png){

	    	//error?
	        if(err){
	        	console.log(err);
	        	return false;
	        }

            switch(method){

                case 'grid':

                    options.stepSize = options.stepSize || 20;

                    //determine stepsize
        	        var stepSizeX = Math.floor(png.getWidth()/options.stepSize);
        			var stepSizeY = Math.floor(png.getHeight()/options.stepSize);

                    var total = 0;
        	        for( var x = 0; x < png.getWidth() ; x+= stepSizeX ){
        	        	for ( var y = 0; y < png.getHeight() ; y+= stepSizeY ){
        	        		var pixel = png.getPixel(x,y);
        	        		var value = translate(pixel);
                            values.push(value);
        	        	}
        	        }

                break;

                case 'pixel':

                    var pixel = png.getPixel(options.x,options.y);
                    var value = translate(pixel);
                    values.push(value);

                break;

            }

            defer.resolve();
        })


        return this;

    };

    this.reduce = function(fn){

        var defer = q.defer();
        var reduced;

        //standard reduce
        fn = fn || function(previousValue, currentValue, index, array){
            var val = previousValue + currentValue;

            //get average
            if(index === array.length - 1){
                val = val / array.length;
            }

            return val;
        };

        q
            .all(this.promises)
            .then(function(){

                //single value?
                if(values.length === 1){
                    reduced = values[0];
                }
                //use reduce function to get value of multiple points
                else {
                    reduced = values.reduce(fn);
                }

                //done
                defer.resolve(reduced);

            });

        return defer.promise;

    };

};
