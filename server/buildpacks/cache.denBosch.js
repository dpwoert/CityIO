cacheBuild = {};

cacheBuild.denBosch = function(){
	
	var data = {};

	//add buildings
	data.buildings = mongo.Buildings.find({ city: 'denBosch' }).fetch();
	data.buildings = data.buildings.slice(0,35000);
	data.buildings = cacheStrip(data.buildings, ['id','bouwjaar','tileUrl','tilePoint']);

	//add streets
	data.streets = mongo.Streets.find({ city: 'denBosch' }).fetch();
	data.streets = cacheStrip(data.streets, ['id','name','maxspeed','highway']);

	//add water
	data.water = mongo.Regions.find({ city: 'denBosch', type: 'water' }).fetch();
	data.water = cacheStrip(data.water, ['id','name','type']);

	//add region
	data.region = mongo.Regions.find({ city: 'denBosch', type: 'water' }).fetch();
	data.region = cacheStrip(data.water, ['id','name','type']);;

	return data;

};