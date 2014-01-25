geo = {};

geo.splitRoad = function(points, steps){

	var split = [];

	//steps
	if(!steps) steps = 20; //m
	
	//interpolate	
	function lerp(start, dest, dist) { 
		var x = start[0] * (1 - dist) + dest[0] * dist;
		var y = start[1] * (1 - dist) + dest[1] * dist;
		return [y,x];
	}

	//split on al point except last
	var start, end;
	for (var i = 0; i < points.length-1 ; i++){

		//make line
		start = points[i];
		end = points[i+1];

		//calculate nr of points
		var distance = geo.measureDistance(start[0],start[1],end[0],end[1]);
		var parts = Math.ceil(distance/steps);

		//add interpolated points
		var point;
		for(var j=0 ; j < parts ; j++){
			point = (1 / parts) * j;
			split.push(lerp(start, end, point));
		}

		split.push(lerp(start, end, 1));

	}

	return split;
}

geo.filterRadius = function(points, center, radius){


	var clean = [];
	for(var i = 0 ; i < points.length ; i++){
		var point = points[i];
		//add if in radius
		if( geo.measureDistance(point[0], point[1], center[0], center[1]) < radius){
			clean.push(point);
		}
	}

	return clean;

};

geo.getCenter = function(arr){
    var x = arr.map(function(a){ return a[0] });
    var y = arr.map(function(a){ return a[1] });
    var minX = Math.min.apply(null, x);
    var maxX = Math.max.apply(null, x);
    var minY = Math.min.apply(null, y);
    var maxY = Math.max.apply(null, y);
    return [(minX + maxX)/2, (minY + maxY)/2];
}

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