module.exports = function(source, props) {

	var res = source;

	//create original object
	// for (var prop in source) {
	// 	res[prop] = source[prop];
	// }

	//overwrite
	for (var prop in props) {

		//new
		if(!res[prop]){
			res[prop] = props[prop];
		}

		//overwrite
		else {

			//first time
			if(res[prop] instanceof Function){
				res[prop] = [ res[prop], props[prop] ];
			}

			//add to existing list
			else {
				res[prop].push( props[prop] );
			}

		}
	}

	return res;

};
