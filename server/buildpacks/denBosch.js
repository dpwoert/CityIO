buildpack = {};
var q = Meteor.require('q');

buildpack.denBosch = function(){

	console.log('start fetching Den Bosch');

	//Geo Pos to load
	var lat = 51.695118333515886;
	var lon = 5.310516357421875;
	// var radius = 3.2;
	var radius = 0.1;

	//reset
	mongo.Buildings.remove({ city: 'denBosch' });
	mongo.Streets.remove({ city: 'denBosch' });
	mongo.Regions.remove({ city: 'denBosch' });

	console.log('Resetted mongo');

	//first get all the 2d map data through CitySDK
	var sdk = new SDK('denBosch');
	sdk.setPosition(lat, lon, radius);

	//BAG / Cadadastral data
	var BAG = sdk.get({
		layer: 'bag.panden',
		filter: 'BAG',
		save: true,
		saveTo: mongo.Buildings
	});

	// Streets
	var streets = sdk.get({
		'osm::highway': 'motorway|motorway_link|trunk|trunk_link|primary|primary_link|secondary|secondary_link|tertiary|tertiary_link|residential|construction|unclassified',
		'data_op': 'or',
		filter: 'soundStreets',
		save: true,
		saveTo: mongo.Streets
	});

	//rails
	//via SDK

	//Regions
	//via SDK [to mongo.Regions]

	//Water
	//via SDK [to mongo.Regions]

	//execute
	q.all([BAG, streets])

		.then(function(){ 

			//Get AHN height data
			return BatchAHN(mongo.Buildings); 

		}).then(function(){ 

			//Get NSL polution data
			return new NSL(mongo.Buildings, "data/data-pollution.json");

		}).then(function(){

			//get sound data - streets
			return new BatchSoundData(mongo.Streets, { type:'street' }, 'car');

		}).then(function(){

			//get sound data - rails
			return new BatchSoundData(mongo.Streets, { type:'rails' }, 'train');

		});


};