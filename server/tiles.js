tiles = {
	minZoom: 11,
	maxZoom: 14
};

tiles.getTile = function(pos, zoom){
	//rijksdriehoekcoordinaten (bron: http://spatialreference.org/ref/epsg/28992/)
	var RDC = '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel ' +
			  '+towgs84=565.237,50.0087,465.658,-0.406857,0.350733,-1.87035,4.0812 +units=m +no_defs'
	var RDCpos = proj4(RDC, [ pos[0],pos[1] ]);
	var ref = {
		a: 1, 
		b: 285401.92, 
		c: -1,
		d: 903401.92
	};

	console.log('zoom: ' + zoom);
	console.log('RDC:')
	console.log(RDCpos);

	//scale
	var res = [3440.64, 1720.32, 860.16, 430.08, 215.04, 107.52, 53.76, 26.88, 13.44, 6.72, 3.36, 1.68, 0.84, 0.42, 0.21];
	var scale = (1 / res[zoom]);
	// var scale = res[zoom];

	//omzetten naar tiles
	var tile = {};
	tile.x = scale * (ref.a * RDCpos[0] + ref.b);
	tile.y = scale * (ref.c * RDCpos[1] + ref.d);

	//flip
	tile.yMax = 1 << zoom;
	tile._y = tile.yMax - (tile.y/256) - 1;

	//omzetten naar pixels
	tile.x = tile.x/256;
	tile.y = tile._y;

	//round
	tile._x = Math.floor(tile.x);
	tile._y = Math.floor(tile.y);

	//get point
	tile.dx = tile.x - tile._x;
	tile.dy = tile.y - tile._y;

	return {
		x: tile._x,
		y: tile._y,
		z: zoom,
		point: [tile.dx, tile.dy]
	};
}

//read height data
tiles.readHeight = function(point, img, db, id){
	console.log('reading png');

	var PNGReader = Meteor.require('png.js');
    var reader = new PNGReader(img);
    reader.parse(function(err,png){
        if(err) console.log(err);

        var x = Math.floor(point[0]*256);
        var y = Math.floor(point[1]*256);
        console.log('x: ' + x + ' y: ' + y);
        console.log( png.getPixel(x,y) );

        //get height

        //save

        //check if all records saved...

    });
}


tiles.getHeight = function(pos, zoom, db, id){

	//load nodejs
	var fs = Npm.require('fs');
	var http = Npm.require('http');
	var url = Npm.require('url');

	//get tile
	var tile = tiles.getTile(pos, zoom);
	console.log(tile);
	var urlProvider = 'http://ahn.geodan.nl/ahn/viewer3/cgi-bin/tilecache/tilecache.py/1.0.0/iahn2/'+tile.z+'/'+tile.x+'/'+tile.y+'.png';
	var cachePath = tile.z + '-' + tile.x + '-' + tile.y + '.png';
	console.log(urlProvider);

	//check if file is already cached
	var readfile = function(path){
   	}

 	if (fs.existsSync(cachePath)){
   		console.log('already exists');
   		fs.readFile(cachePath, function (err, data) {
			if (err) throw err;
	  		tiles.readHeight(tile.point, data, db, id);
		});
   	}

	//get from web so prepare connection
	url = url.parse(urlProvider);
    var options = { 
    	host: url.hostname, port: 80, path: url.pathname,
    	headers: { "connection": "keep-alive", "Referer": "http://ahn.geodan.nl/ahn/"}
    };

    //get from the interwebz
    var request = http.get(options, function(res){
	    var imagedata = '';
	    res.setEncoding('binary');
	    console.log('get url ' + urlProvider);

	    //received more data
	    res.on('data', function(chunk){
	        imagedata += chunk;
	    })

	    //image completed
	    res.on('end', function(){

	    	if(imagedata.indexOf('error')>0){
	    		console.log('error at their host, bitches');
	    		tiles.getHeight(pos, zoom - 1, db, id);
	    	} 
	    	else {

		    	//save to cache file
		        fs.writeFile(cachePath, imagedata, 'binary', function(err){
		            if (err) throw err;
		            console.log('File saved, now read png.');
			        tiles.readHeight(tile.point, imagedata, db, id);
		        });

	    	}

	    })

	});

};

tiles.saveHeight = function(pos, db, id){

	tiles.getHeight(pos, tiles.maxZoom, db, id)

}