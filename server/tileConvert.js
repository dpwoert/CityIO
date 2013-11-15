//get tiles
tileConvert = function(lat,lon,zoom){

	// (c) http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#ECMAScript_.28JavaScript.2FActionScript.2C_etc..29
	function long2tile(lon,zoom) { 
		return (Math.floor((lon+180)/360*Math.pow(2,zoom))); 
	}
	function lat2tile(lat,zoom)  { 
	 	return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); 
	}

	function tile2long(x,z) {
  		return (x/Math.pow(2,z)*360-180);
	}
	function tile2lat(y,z) {
		var n=Math.PI-2*Math.PI*y/Math.pow(2,z);
  		return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
 	}

 	// transform matrix
 	//grid_col = int(scale * (a * proj_x + b))
	//grid_row = int(scale * (c * proj_y + d))

	//inverse (gMaps)
	// var ymax = 1 << zoom;
	// var yTile = ymax - long2tile(lon,zoom) - 1;

	//get tile
	var xTile = lat2tile(lat,zoom);
	var yTile = long2tile(lon,zoom);

	//get bounds
	var ne = { lat: tile2lat(xTile,zoom), lon: tile2lat(yTile,zoom)*-1 };
	var sw = { lat: tile2lat(xTile+1,zoom), lon: tile2lat(yTile+1,zoom)*-1 };

	//get point
	var latScale = d3.scale.linear().domain([ ne.lat, sw.lat  ]).range([ 0, 256 ]);
	var lonScale = d3.scale.linear().domain([ ne.lon, sw.lon  ]).range([ 0, 256 ]);

	return {
		'x': xTile,
		'y': yTile,
		'z': zoom,
		'ne': ne,
		'sw': sw,
		'orig': [lat,lon],
		'point': [Math.round(latScale(lat)),Math.round(lonScale(lon))]
	}

};