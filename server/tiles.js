var tiles = {
	minZoom: 11,
	maxZoom: 14
};

tiles.getTile = function(pos, zoom){
	//rijksdriehoekcoordinaten (bron: http://spatialreference.org/ref/epsg/28992/)
	var RDC = '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel ' +
			  '+towgs84=565.237,50.0087,465.658,-0.406857,0.350733,-1.87035,4.0812 +units=m +no_defs'
	var RDCpos = proj4(RDC, [ pos[1],pos[0] ]);
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
	tile.sx = Math.round(tile.x/256);
	tile.sy = Math.round(tile._y);

	return {
		x: tile.sx,
		y: tile.sy,
		z: zoom
	};
}

//read height data
tiles.readHeight = function(pos, img){
	console.log('reading png');

	var PNGReader = Meteor.require('png.js');
    var reader = new PNGReader(img);
    reader.parse(function(err,png){
        if(err) console.log(err);
        console.log( png.getPixel(0,0) );

        return png.getPixel(0,0);

    });
}


tiles.getHeight = function(pos, zoom){

	zoom = 12;

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
	// var readfile = function(path){
 //   		fs.readFile(path, function (err, data) {
	// 		if (err) throw err;
	//   		// readpng(data);
	//   		console.log('file:');
	//   		console.log(readpng);
	// 	});
 //   	}

 	// if (fs.existsSync(path)){
   	// 	console.log('already exists');
   	// 	readfile(path);
   	// }

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
	    	} 
	    	else {

		    	//save to cache file
		        fs.writeFile(cachePath, imagedata, 'binary', function(err){
		            if (err) throw err;
		            console.log('File saved, now read png.');
			        tiles.readHeight({}, imagedata);
		        });

	    	}

	    })

	});


}