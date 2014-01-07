geo = {
	APIurl: 'http://api.citysdk.waag.org/admr.nl.shertogenbosch/nodes',
	maxCalls: 90,
	calls: 0,

	//get city settings
	terrainSize: 3.2, //km
	// center: [51.697816,5.303675],
	center: [51.695118333515886,5.310516357421875],

	//road settings
	roadSteps: 20 //meters
};

//publish on startup
Meteor.startup(function(){

	//check if acces and log
	console.log('STARTUP, Acces: ' + acces() );

	//load buildings
	geo.buildingsDB = new Meteor.SmartCollection('buildings');
	
	Meteor.publish("all-buildings", function() {
		return geo.buildingsDB.find({});
	});

	//load streets		
	geo.streetsDB = new Meteor.SmartCollection('streets');

	Meteor.publish("all-streets", function() {
		return geo.streetsDB.find({});
	});

	//load postal codes
	geo.postalDB = new Meteor.SmartCollection('postalcodes');

	//save to cache
	cache = new buildJSON();
	//cache.build();


});

Meteor.methods({

	getData: function(){
		return cache.get();
	},

	rebuildCache: function(){
		cache.build();
	},

	getPostalCode: function(code){

		return geo.postalDB.find({ postcode: code }).fetch();
	}

});

if( acces() ){

	Meteor.methods({

		//trigger loading all api's again
		buildCity: function(clean){

			//load & resest DB
			if(clean){
				geo.buildingsDB.remove({});
				console.log('==== Building city ====');
			} else {
				console.log('==== Updating city ====');
			}

			//get & prepare BAG entries
			geo.getBAG({
				'pos': geo.center, 
				'radius': geo.terrainSize,
				'after': geo.addBAG,
				'db': geo.buildingsDB,
				'finished': function(){}
			});
		},

		updateBuilding: function(id, override){

			if(!id || id < 1){
				console.log('WRONG ID');
				return false;
			}

			var set = {};

			//check if building needs to be hidden
			if(override.url){
				set.url = override.url;
			}

			//custom height?
			if(override.height){
				set.height = override.height;
			}

			//hide
			if(override.hide){
				set.hide = true;
			}

			//clean overrides?
			if(override.clean){
				set.url = '';
				set.height = '';
				set.hide = false;
			}

			console.log('find id: ' + id);
			console.log(geo.buildingsDB.find({ 'id':id.toString() }).fetch());

			//update building/overide automatic parameters
			geo.buildingsDB.update({ 'id':id.toString() }, {
	        	$set: set
	        });

	        console.log('updated building ' + id);
	        console.log(set);

		},

		buildStreets: function(){

			//load & reset DB
			geo.streetsDB.remove({});
			console.log('==== Building streets ====');

			//get streets
			geo.getOSM({
				'pos': geo.center,
				'radius': geo.terrainSize,
				'db': geo.streetsDB
			});

		},

		buildRails: function(){

			geo.streetsDB.remove({ rail: true });
			console.log('==== Building Rails ====');

			//get streets
			geo.addRails(geo.streetsDB);

		},

		buildOSM: function(){

			//special OSM layers - highway
			geo.streetsDB.remove({ motorway: true });
			console.log('==== Building Highways ====');

			//get streets
			geo.addHighways(geo.streetsDB);

		},

		getPostalCodes: function(){

			geo.postalDB.remove({});
			console.log('==== Getting all postal codes ====');

			geo.getPostalCodes({
				'pos': geo.center,
				'radius': geo.terrainSize,
				'db': geo.postalDB
			});

		},

		getPollution: function(again){
			research.getPollution(geo.buildingsDB,again);
		},

		dedouble: function(){

			var cache = [];
			var list = geo.buildingsDB.find().fetch();
			console.log('searching for doubles');

			_.each(list, function(building){

				if(cache.indexOf(building.id) == -1){
					cache.push(building.id)
				} else {
					console.log('double in list');

					// geo.buildingsDB.update({ 'id':id.toString() }, {
			  //       	$set: {
			  //       		'double': true
			  //       	}
			  //       });
				}

			});

			console.log('finished, with ' + cache.length + ' in cache');

		}

	});

}

geo.getBAG = function(obj){
	
	var options = {
		lat: obj.pos[0],
		lon: obj.pos[1],
		radius: 1000*obj.radius,
		layer: 'bag.panden',
		geom: true,
		per_page: 1000,
		page: 0
	};

	getPage();

	function getPage(){

		//measure no calls
		geo.calls++;
		options.page += 1;
		console.log('get BAG page: ' + options.page)

		//make request
		Meteor.http.get(geo.APIurl, { params: options } , function(error, result){

			console.log(result.data.url);

			//add to data object
			_.each(result.data.results, function(value){
				obj.after(value, obj.db);
			});

			//check if finished/more pages
			if(result.data.results.length < obj.per_page || geo.calls >= geo.maxCalls){

				//finished
				console.log('finshed gettings BAG data');
				console.log('records added:' + obj.db.find().fetch().length);
				obj.finished();
			} 
			else {
				getPage();
			}
		});
	}

};

geo.addBAG = function(obj, db){
	var bagID = obj.layers['bag.panden'].data.pand_id;

	//check if already done
	var exist = db.find({ id: bagID, calculated: { $exists: true } }).count();
	if(exist > 0){
		//already in db
		return false;
	}

	//get center
	var geoCenter = geo.getCenter(obj.geom.coordinates[0]);

	//insert into database
	db.insert({
		id: bagID,
		bouwjaar: obj.layers['bag.panden'].data.bouwjaar,
		geom: obj.geom,
		height: 0,
		center: geoCenter
	}, function(error, id){
		//get & save height
		tiles.saveHeight(geoCenter, db, id);
	});
}

geo.getOSM = function(obj){
	var options = {
		lat: obj.pos[0],
		lon: obj.pos[1],
		radius: 1000*obj.radius,
		geom: true,
		'osm::highway': 'motorway|motorway_link|trunk|trunk_link|primary|primary_link|secondary|secondary_link|tertiary|tertiary_link|residential|construction|unclassified',
		'data_op': 'or',
		per_page: 1000,
		page: 0
	};

	getPage();

	function getPage(){

		//measure no calls
		geo.calls++;
		options.page += 1;
		console.log('get OSM page: ' + options.page)

		//make request
		Meteor.http.get(geo.APIurl, { params: options } , function(error, result){

			console.log(result.data.url);

			//add to data object
			_.each(result.data.results, function(value){
				if( (value.name  && value.layers.osm.data.maxspeed) || (value.name  && value.layers.osm.data.ref) ){

					//make points
					var points = geo.splitRoad(value.geom.coordinates);

					//make object
					var street = {
						'id': value.cdk_id,
						'name': value.name,
						'maxspeed': value.layers.osm.data.maxspeed,
						'highway': value.layers.osm.data.highway,
						'points': points,
						'soundDay': [],
						'soundNight': []
					}

					//save object
					obj.db.insert(street, function(error, id){
						research.getNoise(points, id, obj.db, 'car');
					});

				}
			});

			//check if finished/more pages
			if(result.data.results.length < obj.per_page || geo.calls >= geo.maxCalls){

				//finished
				console.log('finshed gettings OSM data');
				console.log('records added:' + obj.db.find().fetch().length);

			} 
			else {
				getPage();
			}
		});
	}
}

geo.addRails = function(db){

	var data = JSON.parse( Assets.getText("data/rail.json") );

	//add rails
	_.each(data, function(value){

		console.log(value);

		//make points
		var points = geo.splitRoad(value.geom.coordinates);

		//make object
		var street = {
			'id': value.cdk_id,
			'rail': true,
			'points': points,
			'soundDay': [],
			'soundNight': []
		}

		//save object
		db.insert(street, function(error, id){
			research.getNoise(points, id, db, 'train');
		});

	});

};

geo.addHighways = function(db){

	var data =JSON.parse( Assets.getText("data/highway.json") );

	//add rails
	_.each(data, function(value){

		console.log(value);

		//make points
		var points = geo.splitRoad(value.geom.coordinates);

		//make object
		var street = {
			'id': value.cdk_id,
			'motorway': true,
			'points': points,
			'soundDay': [],
			'soundNight': []
		}

		//save object
		db.insert(street, function(error, id){
			research.getNoise(points, id, db, 'car');
		});

	});

}

geo.getPostalCodes = function(obj){
	
	var options = {
		lat: obj.pos[0],
		lon: obj.pos[1],
		radius: 1000*obj.radius,
		layer: 'pc.nlp6',
		geom: true,
		per_page: 1000,
		page: 0
	};

	getPage();

	function getPage(){

		//measure no calls
		geo.calls++;
		options.page += 1;
		console.log('get postal codes page: ' + options.page)

		//make request
		Meteor.http.get(geo.APIurl, { params: options } , function(error, result){

			console.log(result.data.url);

			//add to data object
			_.each(result.data.results, function(value){
				obj.db.insert({
					'postcode': value.name,
					'geo': value.geom.coordinates
				});
			});

			//check if finished/more pages
			if(result.data.results.length < obj.per_page || geo.calls >= geo.maxCalls){

				//finished
				console.log('finshed gettings postal codes data');
				console.log('records added:' + obj.db.find().fetch().length);
				obj.finished();
			} 
			else {
				getPage();
			}
		});
	}

};

geo.splitRoad = function(points, steps){

	var split = [];

	//steps
	if(!steps) steps = geo.roadSteps;
	
	//interpolate	
	function lerp(start, dest, dist) { 
		var x = start[0] * (1 - dist) + dest[0] * dist;
		var y = start[1] * (1 - dist) + dest[1] * dist;
		return [y,x];
	}

	//split on al point except last
	var start, end;
	for (var i = 0; i < points.length-1 ; i++){

		//make line
		start = points[i];
		end = points[i+1];

		//calculate nr of points
		var distance = geo.measureDistance(start[0],start[1],end[0],end[1]);
		var parts = Math.ceil(distance/geo.roadSteps);

		//add interpolated points
		var point;
		for(var j=0 ; j < parts ; j++){
			point = (1 / parts) * j;
			console.log(point);
			split.push(lerp(start, end, point));
		}

		split.push(lerp(start, end, 1));

	}

	return split;
}

geo.getCenter = function(arr){
    var x = arr.map(function(a){ return a[0] });
    var y = arr.map(function(a){ return a[1] });
    var minX = Math.min.apply(null, x);
    var maxX = Math.max.apply(null, x);
    var minY = Math.min.apply(null, y);
    var maxY = Math.max.apply(null, y);
    return [(minX + maxX)/2, (minY + maxY)/2];
}

geo.measureDistance = function(lat1, lon1, lat2, lon2){
	//http://stackoverflow.com/questions/639695/how-to-convert-latitude-or-longitude-to-meters
    var R = 6378.137; // Radius of earth in KM
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d * 1000; // meters
}