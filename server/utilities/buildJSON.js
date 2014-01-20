buildJSON = function(){
	
	var fs = Npm.require('fs');

	this.build = function(){

		console.log('building cache');
		var that = this;
		_.each(cacheBuild, function(get, city){
			var data = get();
			that.save(data, city);
		});

	};

	this.save = function(data, city){

		console.log('save JSON to cache');
		fs.writeFile('cache-'+city+'.json', EJSON.stringify(data), function(err) {
		    if(err) throw err;
		    console.log('JSON '+city+' saved to cache');
		});

	};

	this.get = function(city){
		city = city || 'denBosch';
		return JSON.parse( fs.readFileSync('cache-'+city+'.json') );
	};

	this.init = function(){

	  	this.build();

	}.call(this);

}