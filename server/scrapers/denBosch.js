scrapers = scrapers || {};

scrapers.denBosch = function(){

	//Geo Pos to load
	var lat = 51.695118333515886;
	var lon = 5.310516357421875;
	var radius = 3.2;

	//first get all the 2d map data through CitySDK
	var sdk = new SDK('denBosch');
	sdk.setPosition(lat, lon, radius);

	//BAG / Cadadastral data
	sdk.get({
		layer: 'bag.panden',
		filter: 'BAG',
		save: true,
		saveTo: mongo.Buildings
	});

	//Streets
	sdk.get({
		'osm::highway': 'motorway|motorway_link|trunk|trunk_link|primary|primary_link|secondary|secondary_link|tertiary|tertiary_link|residential|construction|unclassified',
		'data_op': 'or',
		filter: 'streets',
		save: true,
		saveTo: Mongo.Streets
	});

}