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
	geo.getBAG(geo.center);

	tile.getHeight(geo.center);
	
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

	//get json by ajax
	Meteor.http.get(geo.APIurl, call, function(error, result){
		data[save] = data[save].concat(result.data.results);

		//check if finished/more pages
		if(result.data.results.length < obj.per_page){
		} else if(geo.calls <= geo.maxCalls) {
			finished(result.data.results); //add to threejs
			geo.getPages(obj, page+1, save, finished);
		} else {
			//console.log('aborted by maxcalls');
		}
	});
};

geo.getHeight = function(pos){

	//get url params
	tile.getHeight(pos);

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