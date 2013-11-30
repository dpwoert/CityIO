geo = {
	APIurl: 'http://api.citysdk.waag.org/nodes',
	maxCalls: 10,
	calls: 0,

	//get field settings
	terrainSize: 1.5, //km
	center: [51.68836,5.30507]
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

});

Meteor.methods({

	buildingCount: function(){
		return geo.buildingsDB.find().count();
	},

	//trigger loading all api's again
	buildCity: function(){

		//load & resest DB
		geo.buildingsDB.remove({});
		console.log('==== Building city ====');

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

	getPollution: function(){
		research.getPollution(geo.buildingsDB);
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

}

geo.addBAG = function(obj, db){
	var bagID = obj.layers['bag.panden'].data.pand_id;
	//console.log('add bag, id: ' + bagID);

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
				if(value.name  && value.layers.osm.data.maxspeed){

					//make object
					var street = {
						'id': value.cdk_id,
						'name': value.name,
						'maxspeed': value.layers.osm.data.maxspeed,
						'highway': value.layers.osm.data.highway,
					}

					//save object
					obj.db.insert(street);

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

geo.getCenter = function(arr){
    var x = arr.map(function(a){ return a[0] });
    var y = arr.map(function(a){ return a[1] });
    var minX = Math.min.apply(null, x);
    var maxX = Math.max.apply(null, x);
    var minY = Math.min.apply(null, y);
    var maxY = Math.max.apply(null, y);
    return [(minX + maxX)/2, (minY + maxY)/2];
}