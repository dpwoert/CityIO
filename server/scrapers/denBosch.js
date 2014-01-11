scrapers = {};
var q = Meteor.require('q');

scrapers.denBosch = function(){

	console.log('start fetching Den Bosch');

	//Geo Pos to load
	var lat = 51.695118333515886;
	var lon = 5.310516357421875;
	// var radius = 3.2;
	var radius = 0.3;

	//reset
	mongo.Buildings.remove({ city: 'denBosch' });
	mongo.Streets.remove({ city: 'denBosch' });

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
		filter: 'streets',
		save: true,
		saveTo: mongo.Streets
	});

	//execute
	q.all([BAG, streets]).then(function(){

		console.log('GOT SDK DATA');

	});

};