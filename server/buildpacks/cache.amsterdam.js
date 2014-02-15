cacheBuild = {};

cacheBuild.amsterdam = function(){
	
	var data = {};

	//add buildings
	data.buildings = mongo.Buildings.find({ city: 'amsterdam' }).fetch();
	data.buildings = data.buildings.slice(0,35000);
	data.buildings = cacheStrip(data.buildings, ['id','bouwjaar','tileUrl','tilePoint']);

	//add water
	data.water = mongo.Regions.find({ city: 'amsterdam', type: 'water' }).fetch();
	data.water = cacheStrip(data.water, ['id','name','type']);

	//add region
	data.region = mongo.Regions.find({ city: 'amsterdam', type: 'admr' }).fetch();
	data.region = cacheStrip(data.region, ['id','name','type']);;

	return data;

};