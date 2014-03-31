IO.buildpacks.denBosch.cache = function(){

	var data = {};

	//add buildings
	data.buildings = mongo.Buildings.find({ city: 'denBosch' }).fetch();
	data.buildings = data.buildings.slice(0,40000);
	data.buildings = IO.cacheStrip(data.buildings, ['_id','id','bouwjaar','tileUrl','tilePoint','city']);
	data.buildings = IO.roundGPS(data.buildings);

	//strip buildings even more
	_.each(data.buildings, function(item){
		item.fijnstof = item.fijnstof.no2;
		item.floor = parseFloat(item.floor).toFixed(1);
		item.calculated = parseFloat(item.calculated).toFixed(1);
	});

	//add streets
	data.streets = mongo.Streets.find({ city: 'denBosch' }).fetch();
	data.streets = IO.cacheStrip(data.streets, ['_id', 'id','name','maxspeed','highway','city']);
	data.streets = IO.roundGPS(data.streets);

	//add water
	data.water = mongo.Regions.find({ city: 'denBosch', type: 'water' }).fetch();
	data.water = IO.cacheStrip(data.water, ['_id', 'id','name','type','city']);
	data.water = IO.roundGPS(data.water);

	//add region
	data.region = mongo.Regions.find({ city: 'denBosch', type: 'admr' }).fetch();
	data.region = IO.cacheStrip(data.region, ['_id','id','name','type','city']);;
	data.region = IO.roundGPS(data.region);

	return data;

};
