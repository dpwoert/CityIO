window.tile = {
	url: 'http://ahn.geodan.nl/ahn/viewer3/cgi-bin/tilecache/tilecache.py/1.0.0/iahn2/{z}/{y}/{x}.png',
	// url: 'depth/{y}/{x}.png',
	maxZoom: 14, //AHN
	minZoom: 10,
	cache: {}
};

//get tiles
tile.convert = function(lat,lon,zoom){

	// (c) http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#ECMAScript_.28JavaScript.2FActionScript.2C_etc..29
	// http://wiki.openstreetmap.org/wiki/Converting_to_WGS84
	// https://npmjs.org/package/proj4leaflet
	// https://github.com/proj4js/proj4js [!!] http://blog.kartena.se/local-projections-in-a-world-of-spherical-mercator/
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

tile.checkCache = function(x,y){

	//get and save to cache
	if(tile.cache[x + '-' + y] == undefined){
		return false;
	} else {
		return tile.cache[x + '-' + y];
	}

};

tile.getUrl = function(x,y,z){
	//make url
	var url = tile.url.replace('{z}',z);
		url = url.replace('{x}',x);
		url = url.replace('{y}',y);

	return url;
};

tile.getHeight = function(pos){

	var lat = pos[0];
	var lon = pos[1];
	var zoom = tile.maxZoom;

	//var cache = tile.checkCache(obj.x,obj.y);

	//Meteor.call('getHeight', pos, zoom, function (error, result) {});

	for(var i = tile.maxZoom ; i >= tile.minZoom ; i--){

		console.log('getZoom ' + i);
		var obj = tile.convert(lat,lon,i);
		var url = tile.getUrl(obj.x,obj.y,obj.z);
		// Meteor.call('saveTile', tile.url, obj.x, obj.y, obj.z, obj.point, function (error, result) {});

	}

}