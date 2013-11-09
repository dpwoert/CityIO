window.geo = {

	//get Basis Administratie Gegevens from CitySKD
	APIurl: 'http://api.citysdk.waag.org/nodes',
	maxCalls: 5,
	calls: 0,

	//get field settings
	terrainSize: 5, //km
	center: [51.68836,5.30507],
	zoom: 23
};

geo.init = function(){

	//get the data for den bosch
	geo.getBAG(geo.center);

	geo.getHeight(geo.center);
	
};

geo.getBAG = function(pos){

	var options = {
		lat: pos[0],
		lon: pos[1],
		radius: 100*geo.terrainSize,
		layer: 'bag.panden',
		geom: true,
		per_page: 1000,
		page: 1
	};

	geo.getPages(options, 1, 'BAG', DDD.loadData);
};

geo.getPages = function(obj, page, save, finished, finishedAll){

	//get call settings
	obj.page = page;
	var call = { params: obj };
	geo.calls ++;

	//check if save variable exist
	if(data[save] == undefined){
		data[save] = [];
	}

	console.log('call to citySDK')

	//get json by ajax
	Meteor.http.get(geo.APIurl, call, function(error, result){
		console.log(result);
		data[save] = data[save].concat(result.data.results);
		console.log(save);
		console.log('got ' + result.data.results.length + ' objects');

		//check if finished/more pages
		if(result.data.results.length < obj.per_page){
			console.log('finished');
			//console.log(data.BAG);
		} else if(geo.calls <= geo.maxCalls) {
			finished(result.data.results);
			geo.getPages(obj, result.next_page, save, finished);
		} else {
			console.log('aborted by maxcalls');
			//geo.finished();
		}
	});
};

geo.getHeight = function(pos){
	//http://geodata.nationaalgeoregister.nl/tms/1.0.0/brtachtergrondkaart@EPSG:28992@png8/{z}/{x}/{y}.png
	var url = 'http://ahn.geodan.nl/tilecache/tilecache.py/1.0.0/iahn2/{z}/{x}/{y}.png';
	// var maxZoom = 18; // leaflet
	var maxZoom = 18; // AHN?

	//get url params
	var tile = url;
	var x = Math.round(geo.tile.x(pos[1],maxZoom));
	var y = Math.round(geo.tile.y(pos[0],maxZoom));

	//make url
	tile = tile.replace('{z}',maxZoom);
	tile = tile.replace('{x}',x);
	tile = tile.replace('{y}',y);

	console.log(tile);
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

//get tiles
geo.tile = {};

geo.tile.x = function(lon, zoom){
	return ( (lon+180)/360 * Math.pow(2,zoom) );
};

geo.tile.y = function(lat, zoom){
	var lata = lat*Math.PI/180;
	var sec = function(aValue) { return 1/Math.cos(aValue); }
	return ( (1 - Math.log(Math.tan(lata) + sec(lata))/Math.PI)/2 * Math.pow(2,zoom) );
};