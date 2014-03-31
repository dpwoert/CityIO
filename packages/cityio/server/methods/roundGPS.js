IO.roundGPS = function(input, digits){

	//standard digits (rounding on 11 cm)
	//see: http://gis.stackexchange.com/questions/8650/how-to-measure-the-accuracy-of-latitude-and-longitude/8674#8674
	if(!digits) digits = 6;

	//parse gps
	var parseGPS = function(item){

		item[0] = parseFloat(item[0]).toFixed(digits);
		item[1] = parseFloat(item[1]).toFixed(digits);

	};

	//recursive search for gps inputs
	var check = function(input){

		if( _.isArray(input) && _.isNumber(input[0]) && _.isNumber(input[1]) ){
				parseGPS(input);
		}
		else if( _.isArray(input) || _.isObject(input) ) {
			_.each(input, function(list){
				check(list);
			});
		}

	};

	//run
	check(input);

	//return
	return input;

};
