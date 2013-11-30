window.geo = {

	//get Basis Administratie Gegevens from CitySKD
	APIurl: 'http://api.citysdk.waag.org/nodes',
	maxCalls: 50,
	calls: 0,

	//get field settings
	terrainSize: 10, //km
	center: [51.68836,5.30507],
	zoom: 22,

	buildingCount: 0,
	buildingIDs: []
};


geo.init = function(){

	//get scale
	geo.setScales();

	//set collections
	Meteor.subscribe("all-buildings");
	geo.buildingsDB = new Meteor.SmartCollection('buildings');

	Meteor.call('buildingCount', function(err, res){
		geo.buildingCount = res;
		//get the data for den bosch now we know how much data we have...
		geo.get();
	});

	
};

geo.get = function(){

	//add buildings
	Meteor.autorun(function(c){

		//check for performance
		if(DDD.pause) return false;

		geo.buildings = geo.buildingsDB.find();
		geo.buildings.forEach(function(building){
			
			//to prevent doubles
			if(geo.buildingIDs.indexOf(building.id) > -1){
				return false;
			}

			geo.buildingIDs.push(building.id);
			DDD.addBuilding(building.geom.coordinates,building);
		});

		//check if completed
		if( geo.buildingIDs.length >= geo.buildingCount ){
			console.log('loaded');

			//add to garbage
			geo.buildingIDs == null;
			delete geo.buildingIDs;

			//unscribe [todo]

			//merge buildings
		}

	});

};

geo.setScales = function(){

	//make points
	var p1 = geo.center;
	var p2 = [geo.center[0]+0.00001 , geo.center[1]+0.00001];

	//distance in m
	var meters = Math.abs( geo.measureDistance(p1[0],p1[1] , p2[0],p2[1]) );

	//pixel points
	var pixels1 = geo.projection(p1);
	pixels1[0] = pixels1[0] - geo.center[0];
	pixels1[1] = pixels1[1] - geo.center[1];
	var pixels2 = geo.projection(p2);
	pixels2[0] = pixels2[0] - geo.center[0];
	pixels2[1] = pixels2[1] - geo.center[1];

	//pixel distance
	var pixelDistance = Math.sqrt( Math.pow(pixels2[0]-pixels1[0],2) + Math.pow(pixels2[1]-pixels1[1],2) );

	geo.pixelScale = meters / pixelDistance;
	geo.meterScale = pixelDistance / meters;

};

geo.measureDistance = function(lat1, lon1, lat2, lon2){
	//http://stackoverflow.com/questions/639695/how-to-convert-latitude-or-longitude-to-meters
    var R = 6378.137; // Radius of earth in KM
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d * 1000; // meters
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