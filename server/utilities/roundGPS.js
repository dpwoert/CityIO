roundGPS = function(input, digits){

	//standard digits (rounding on 11 cm)
	//see: http://gis.stackexchange.com/questions/8650/how-to-measure-the-accuracy-of-latitude-and-longitude/8674#8674
	if(!digits) digits = 6;

	//parse gps
	var parseGPS = function(list){

		//loop throught array with GPS
		_.each(list, function(item, key){

			item[0] = parseFloat(item[0]).toFixed(digits);
			item[1] = parseFloat(item[1]).toFixed(digits);

		});

		//return list;

	};

	if(input[0].geom){

		//city SDK gps list
		_.each(input, function(item){
			parseGPS(item.geom.coordinates[0]);
		});

	} else if(input[0].points){

		//street list
		_.each(input, function(item){
				parseGPS(item.points);
		});

	} else {
		//normal list
		parseGPS(input);
	}
	

	return input;

};