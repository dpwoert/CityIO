geo = {
	APIurl: 'http://api.citysdk.waag.org/nodes',
	maxCalls: 30,
	calls: 0,

	//get city settings
	// terrainSize: 1.5, //km
	// center: [51.68836,5.30507],

	terrainSize: 4, //km
	center: [51.697816,5.303675],

	//road settings
	roadSteps: 20 //meters
};

//publish on startup
Meteor.startup(function(){

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

});

Meteor.methods({

	buildingCount: function(){
		return geo.buildingsDB.find().count();
	},

	getData: function(){
		return {
			buildings: geo.buildingsDB.find().fetch(),
			streets: geo.streetsDB.find().fetch()
		}
	},

	//trigger loading all api's again
	buildCity: function(add){

		//load & resest DB
		if(!add){
			geo.buildingsDB.remove({});
			console.log('==== Building city ====');
		} else {
			console.log('==== Updating city ====');
		}

		//get & prepare BAG entries
		geo.getBAG({
			'add': add,
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

	buildOSM: function(){

	},

	getPollution: function(again){
		research.getPollution(geo.buildingsDB,again);
	}

});

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
				obj.after(value, obj.db, obj.add);
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

}

geo.addBAG = function(obj, db, add){
	var bagID = obj.layers['bag.panden'].data.pand_id;
	//console.log('add bag, id: ' + bagID);

	if(add){
		var exist = db.find({ id: bagID, calculated: { $exists: true } }).count();
		if(exist > 0){
			//already in db
			return false;
		}
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
		'osm::highway': '',
		per_page: 5000,
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
						research.getNoise(points, id, obj.db);
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

geo.splitRoad = function(points){

	var split = [];
	
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