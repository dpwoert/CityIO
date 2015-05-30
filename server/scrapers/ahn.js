var fs = require('fs');
var q = require('q');
var request = require('request');
var PNGReader = require('png.js');

var Geo = require('../../isomorphic/classes/geo.js');
var Feature = require('../../isomorphic/classes/feature.js');
var srs = require('../../isomorphic/tools/srs.js');
var earcut = require('../tools/earcut.js');

module.exports = function(finish, data, options){

    //settings
	var minZoom = 11;
	var maxZoom = 14;
	var minHeight = -12; //m
	var maxHeight = 30; //m

    var getTile = function(pos, zoom){

		//rijksdriehoekcoordinaten (source: http://spatialreference.org/ref/epsg/28992/)
		// var RDC = '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel ' +
		// 		  '+towgs84=565.237,50.0087,465.658,-0.406857,0.350733,-1.87035,4.0812 +units=m +no_defs'
		// var RDCpos = proj4(RDC, [ pos[0],pos[1] ]);
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
		tile.x = scale * (ref.a * pos.lat + ref.b);
		tile.y = scale * (ref.c * pos.lon + ref.d);

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
				if(height < min && height > -12){
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
	        // console.log('HOOGTE: ' + height + ' m');

	        //get floor
	        var floor = getFloor(png);
	        // console.log('FLOOR: ' + floor + ' m');

	        //save
	        deferred.resolve({
	        	'calculated': height,
	        	'floor': floor
	        });

	    });

	}

    var getHeight = function(pos, zoom, deferred){

        pos = pos.convert(srs.RDC);
        // http://geodata.nationaalgeoregister.nl/ahn2/wms?

		//get tile
		var tile = getTile(pos, zoom);
		var urlProvider = 'http://geodata.nationaalgeoregister.nl/tiles/service/wmts/ahn2?service=wmts&request=getTile&version=1.0.0&layer=ahn2_05m_non&tilematrixset=EPSG:28992&tilematrix=EPSG:28992:'+tile.z+'&tilerow='+tile.x+'&tilecol='+tile.y+'&format=image/png';
		// var urlProvider = 'http://ahn.geodan.nl/ahn/viewer3/cgi-bin/tilecache/tilecache.py/1.0.0/iahn2/'+tile.z+'/'+tile.x+'/'+tile.y+'.png';
		var cachePath = 'tmp.' + tile.z + '-' + tile.x + '-' + tile.y + '.png';


		//get file from web
		var getfile = function(){

			request
				.get({
					url: urlProvider,
					encoding: null
				})
				.pipe(fs.createWriteStream('tmp/' + cachePath))
				.on('error', function(error){

					console.error("Got error: " + error.message);
					console.log('Url: ', urlProvider)
					console.log("Retry");
					getHeight(pos, zoom, deferred);

				})
				.on('finish', function(image){

					var file = fs.readFileSync('tmp/' + cachePath);
					readHeight(tile.point, file, urlProvider, deferred);

				});

	   	};

	   	//check if in cache
		fs.exists('tmp/' + cachePath, function(exists) {

	    	if(!exists) {
	    		getfile();
	    	} else {
				var file = fs.readFileSync('tmp/' + cachePath);
	    		readHeight(tile.point, file, urlProvider, deferred);
	    	}

	    });

	};

	var getAverageHeights = function(collection, defer){

		//list for promises of height
		var promises = [];

		collection.each(function(feature){

			//create promise
			var _defer = q.defer();
			promises.push(_defer.promise);

			//get height in center of triangle
			var center = feature.getCenter();
			getHeight(center, 14, _defer);

		});

		//wait for all heights to be gotten from server
		q
			.all(promises)
			.then(function(r){
				defer.resolve(r);
			});
	}

    //show log
    console.log('Load AHN scraper for ' + data.features.length + ' objects');

    //queue
    var promiseList = [];
    var done = 0;

	//create temp. dir when needed
	if(!fs.existsSync('tmp')){
		fs.mkdirSync('tmp', 0766);
	}

    //add height data to feature
    data.features.forEach(function(child, i){

        //get center
        var feature = new Feature().parse(child);
		var triangulate = earcut(feature);

		//get last promise (when available)
		var lastPromise = promiseList[promiseList.length - 1];

        //create promise
        var deferred = q.defer();
        promiseList.push(deferred.promise);

        //get height
		if(lastPromise){

			//create promise chain to not stress CPU
			lastPromise
				.then(function(){
					getAverageHeights(this.triangulate, this.deferred);
				}.bind({ 'triangulate': triangulate, 'deferred': deferred }));

		} else {

			//no promise yet
			getAverageHeights(triangulate, deferred);

		}

        //save
        deferred.promise.then(function(heights){

			//get max height found within object
			var _heights = heights.map(function(a){ return a.calculated });
	        var maxHeight = Math.max.apply(null, _heights);

            child.properties.height = maxHeight;
            child.properties.floor = heights[0].floor;
            done++;

            //log progress
            var progress = (done/data.features.length) * 100;
            if(Math.round(progress) % 1 == 0){
                console.log('AHN fetching: ' + Math.round(progress) + '% | ' + done + '/' + data.features.length);
            }

        })

    });

    //return data when all done
    q
        .all(promiseList)
        .then(function(){
            console.log('AHN fetching finished');
            finish.resolve(data);
        });

}
