IO.buildpacks.rotterdam.cache = function(){

	var data = {};

	//add buildings
	data.buildings = mongo.Buildings.find({ city: 'rotterdam' }).fetch();
	data.buildings = data.buildings.slice(0,35000);
	data.buildings = IO.cacheStrip(data.buildings, ['id','bouwjaar','tileUrl','tilePoint']);
	data.buildings = IO.roundGPS(data.buildings);

	//add streets
	data.streets = mongo.Streets.find({ city: 'rotterdam' }).fetch();
	data.streets = IO.cacheStrip(data.streets, ['_id', 'id','name','maxspeed','highway','city']);
	data.streets = IO.roundGPS(data.streets);

	//add water
	data.water = mongo.Regions.find({ city: 'rotterdam', type: 'water' }).fetch();
	data.water = IO.cacheStrip(data.water, ['id','name','type']);
	data.water = IO.roundGPS(data.water);

	//add region
	data.region = mongo.Regions.find({ city: 'rotterdam', type: 'admr' }).fetch();
	data.region = IO.cacheStrip(data.region, ['id','name','type']);
	data.region = IO.roundGPS(data.region);

	//add grass
	data.grass = mongo.Regions.find({ city: 'rotterdam', type: 'grass' }).fetch();
	data.grass = IO.cacheStrip(data.grass, ['id','name','type']);
	data.grass = IO.roundGPS(data.grass);

	return data;

};
