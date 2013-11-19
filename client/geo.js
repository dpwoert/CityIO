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

	//set collections
	Meteor.subscribe("all-buildings");
	geo.buildingsDB = new Meteor.Collection('buildings');

	//get the data for den bosch
	geo.get();
	
};

geo.get = function(){

	//add buildings
	Meteor.autorun(function(){

		//check for performance
		if(DDD.pause) return false;

		geo.buildings = geo.buildingsDB.find();
		geo.buildings.forEach(function(building){
			//console.log(building)
			DDD.addBuilding(building.geom.coordinates,building);
		});

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