window.geo = {

	//get Basis Administratie Gegevens from CitySKD
	APIurl: 'http://api.citysdk.waag.org/nodes',
	maxCalls: 50,
	calls: 0,

	//get field settings
	terrainSize: 10, //km
	center: [51.68836,5.30507],
	zoom: 22
};

geo.init = function(){

	//get the data for den bosch
	geo.get();
	
};

geo.get = function(){

	//add buildings
	geo.buildingsDB = new Meteor.Collection('buildings');
	geo.buildings = geo.buildingsDB.find();

	geo.buildings.forEach(function(building){
		console.log('add ' + building.id);
		DDD.addBAG(building);
	});

}

//make projection
geo.projection = d3.geo.mercator()
	.translate([1000 / 2, 10000 / 2])
	// .translate([geo.terrainSize / 2, geo.terrainSize / 2])
    .scale(Math.pow(2,geo.zoom))
    // .rotate([-9, 0, 0])
    .center(geo.center);

//get center in projection
geo.centerProjection = geo.projection(geo.center);