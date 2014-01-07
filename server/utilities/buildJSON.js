buildJSON = function(){
	
	var fs = Npm.require('fs');
	this.data = '';

	this.build = function(){

		var data = {};
		console.log('building JSON file');

		//add buildings
		data.buildings = geo.buildingsDB.find().fetch();
		data.buildings = data.buildings.slice(0,35000);
		data.buildings = this.strip([ 'id','bouwjaar','tileUrl','tilePoint' ], data.buildings);

		//add streets
		data.streets = geo.streetsDB.find().fetch();
		data.streets = this.strip([ 'id','name','maxspeed','highway' ], data.streets);

		//add water
		data.water = JSON.parse( Assets.getText("data/water.json") );
		data.water = this.strip([ 'cdk_id','name','node_type','layer','layers' ], data.water);

		//add grass/nature
		// data.grass = JSON.parse( Assets.getText("data/grass.json") );
		// data.grass = this.strip([ 'cdk_id','name','node_type','layer','layers' ], data.grass);

		//add region
		data.region = JSON.parse( Assets.getText("data/region.json") );

		this.save(data);

	};

	this.save = function(data){

		this.data = data;
		console.log('save JSON to cache');
		fs.writeFile("data.json", EJSON.stringify(data), function(err) {
		    if(err) throw err;
		    console.log('JSON saved to cache');
		});

	};

	this.get = function(){
		return this.data;
	};

	this.read = function(){

	}

	this.strip = function(keys, data){

		var item;
		var key;

		//read the data
		for ( var i = 0 ; i < data.length ; i++ ){
			item = data[i];

			//delete all keys in row
			for( var j = 0 ; j < keys.length ; j++){
				key = keys[j];
				data[i][key] = null;
				delete data[i][key];
			}	
			
		}

		return data;

	};

	this.init = function(){


		//read JSON data
		var data;
		try {
		  	data = fs.readFileSync('data.json')
		} catch (err) {
			//error
		  	if (err.code !== 'ENOENT') throw e;
		  	data = '';
		}

	  	// build if empty
	  	if(data == ''){

	  		console.log('no data json file');
	  		this.build();

	  	} else {

			//save to cache
		  	this.data = JSON.parse(data);

	  	}


	}.call(this);

}