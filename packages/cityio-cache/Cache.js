IO.Cache = function(){

	var fs = Npm.require('fs');

	this.build = function(){

		console.log('building cache');
		var self = this;

		_.each(IO.buildpacks, function(get, city){
			var data = get.cache();
			self.save(data, city);
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
