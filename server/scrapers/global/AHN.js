AHN = function(){

	//load nodejs
	var fs = Npm.require('fs');
	var http = Npm.require('http');
	var url = Npm.require('url');
	var PNGReader = Meteor.require('png.js');
	var q = Meteor.require('q');

	//settings
	this.minZoom = 11;
	this.maxZoom = 14;
	this.minHeight = -12; //m
	this.maxHeight = 30; //m

	var getTile = function(pos, zoom){

		//rijksdriehoekcoordinaten (source: http://spatialreference.org/ref/epsg/28992/)
		var RDC = '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel ' +
				  '+towgs84=565.237,50.0087,465.658,-0.406857,0.350733,-1.87035,4.0812 +units=m +no_defs'
		var RDCpos = proj4(RDC, [ pos[0],pos[1] ]);
		var ref = {
			a: 1, 
			b: 285401.92, 
			c: -1,
			d: 903401.92
		};

		//scale
		var res = [3440.64, 1720.32, 860.16, 430.08, 215.04, 107.52, 53.76, 26.88, 13.44, 6.72, 3.36, 1.68, 0.84, 0.42, 0.21];
		var scale = (1 / res[zoom]);
		// var scale = res[zoom];

		//convert to tiles
		var tile = {};
		tile.x = scale * (ref.a * RDCpos[0] + ref.b);
		tile.y = scale * (ref.c * RDCpos[1] + ref.d);

		//flip
		tile.yMax = 1 << zoom;
		tile._y = tile.yMax - (tile.y/256) - 1;

		//convert to pixels
		tile.x = tile.x/256;
		tile.y = tile._y;

		//round
		tile._x = Math.floor(tile.x);
		tile._y = Math.ceil(tile.y);

		//get point
		tile.dx = tile.x - tile._x;
		tile.dy = tile._y - tile.y;

		return {
			x: tile._x,
			y: tile._y,
			z: zoom,
			point: [tile.dx, tile.dy]
		};
	}

	var getPixelHeight = function(pixel){
		return ((pixel[1]*256)+pixel[2])/100 - 12;
	}

	var getFloor = function(png){
		var step = 5;
		var min = 100;
		for( var x = 0 ; x < 256 ; x+=step ){
			for( var y = 0 ; y < 256 ; y+=step ){
				var pixel = png.getPixel(x,y);
				var height = getPixelHeight(pixel);
				if(height < min){
					min = height;
				}
			}
		}

		return min;
	}

	var readHeight = function(point, img, url, deferred){

	    var reader = new PNGReader(img);
	    reader.parse(function(err,png){

	        if(err) console.log(err);
	        if(png == undefined) {
	        	console.log('unexpected error');
	        	return false;
	        }

	        var x = Math.floor(point[0]*256);
	        var y = Math.floor(point[1]*256);
	        var pixel = png.getPixel(x,y);

	        //get height
	        var height = getPixelHeight(pixel);
	        console.log('HOOGTE: ' + height + ' m');

	        //get floor
	        var floor = getFloor(png);
	        console.log('FLOOR: ' + floor + ' m');

	        //save
	        deferred.resolve({
	        	'calculated': height,
	        	'floor': floor
	        });

	    });

	}

	var getHeight = function(pos, zoom, deferred){

		//get tile
		var tile = getTile(pos, zoom);
		//console.log(tile);
		var urlProvider = 'http://ahn.geodan.nl/ahn/viewer3/cgi-bin/tilecache/tilecache.py/1.0.0/iahn2/'+tile.z+'/'+tile.x+'/'+tile.y+'.png';
		var cachePath = tile.z + '-' + tile.x + '-' + tile.y + '.png';
		console.log(urlProvider);

		//get file from web
	   	var getfile = function(){

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
			    		console.log('FAILED - error at their host | trying again');
			    		getHeight(pos, zoom - 1, deferred);
			    	} 
			    	else {

				    	//save to cache file
				        fs.writeFile(cachePath, imagedata, 'binary', function(err){
				            if (err) console.log('err');
				            console.log('load from url');
					        readHeight(tile.point, imagedata, urlProvider, deferred);
				        });

			    	}

			    })

			});

	   	};

	   	//check if in cache
	   	fs.readFile(cachePath, "binary", function(err, file) {  
	    	if(err) {
	    		getfile();
	    	} else {
	    		readHeight(tile.point, file, urlProvider, deferred);
	    	}
	    });

	};
	
	this.get = function(lat, lon){

		//make promise
		var deferred = q.defer();
		getHeight([lat, lon],this.maxZoom, deferred);
		return deferred.promise;

	};

}