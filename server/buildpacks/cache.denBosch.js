cacheBuild = {};

cacheBuild.denBosch = function(){
	
	var data = {};

	//add buildings
	data.buildings = geo.buildingsDB.find().fetch();
	data.buildings = data.buildings.slice(0,35000);
	data.buildings = _.omit(data.buildings, 'id','bouwjaar','tileUrl','tilePoint');

	//add streets
	data.streets = geo.streetsDB.find().fetch();
	data.streets = _.omit(data.streets, 'id','name','maxspeed','highway');

	//add water
	data.water = JSON.parse( Assets.getText("data/water.json") );
	data.water = _.omit(data.water, 'cdk_id','name','node_type','layer','layers' );

	//add grass/nature
	// data.grass = JSON.parse( Assets.getText("data/grass.json") );
	// data.grass = this.strip([ 'cdk_id','name','node_type','layer','layers' ], data.grass);

	//add region
	data.region = JSON.parse( Assets.getText("data/region.json") );

	return data;

};