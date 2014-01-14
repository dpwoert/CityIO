SoundData = function(points, type){

	var http = Npm.require('http');
	var q = Meteor.require('q');
	var PNGReader = Meteor.require('png.js');
	
	//promise
	var deferred = q.defer();
	this.promise = deferred.promise;

	//data
	var updates = [];

	//settings
	var tileWidth = 20, tileSize = 10;
	
	//get the correct url
	var getTileUrls = function(pos){

		//get RDC
		var RDC = '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel ' +
				  '+towgs84=565.237,50.0087,465.658,-0.406857,0.350733,-1.87035,4.0812 +units=m +no_defs';
		var RDCpos = proj4(RDC, [ pos[1],pos[0] ]);
		console.log(RDCpos);

		//make url
		var makeUrl = function(map){

			var left = [], right = [];
			left[0] = Math.round(RDCpos[0])-(tileWidth/2);
			left[1] = Math.round(RDCpos[1])-(tileWidth/2);

			right[0] = Math.round(RDCpos[0])+(tileWidth/2);
			right[1] = Math.round(RDCpos[1])+(tileWidth/2);


			//convert to url
			return 'http://geoproxy.s-hertogenbosch.nl/pwarcgis1/rest/services/externvrij/Geluidbelasting/MapServer/export?dpi=96&transparent=true&format=png8&bbox='+left[0]+','+left[1]+','+right[0]+','+right[1]+'&bboxSR=28992&imageSR=28992&size=943%2C512&layers=show%3A'+map+'%2C2&f=image';
		}

		//return urls
		return {

			day: {
				car: makeUrl(1),
				train: makeUrl(4),
			},

			night: {
				car: makeUrl(2),
				train: makeUrl(5)
			}
		};

	}

	var readNoise = function(data, type, key){

		//determine nr of steps
		var steps = 25; //on one axis

		//translate color values to values
		function translateColor(c){

	        // http://geoproxy.s-hertogenbosch.nl/PWArcGIS1/rest/services/externvrij/Geluidbelasting/MapServer/1?f=json&pretty=true

			//day
			if(c.r == 51 && c.g == 0 && c.b == 51){ return 75; }
			if(c.r == 192 && c.g == 49 && c.b == 199){ return 70; }
			if(c.r == 255 && c.g == 0 && c.b == 0){ return 65; }
			if(c.r == 248 && c.g == 128 && c.b == 23){ return 60; }
			if(c.r == 255 && c.g == 240 && c.b == 0){ return 55; }

			//night
			if(c.r == 94 && c.g == 118 && c.b == 126){ return 70; }
			if(c.r == 196 && c.g == 135 && c.b == 147){ return 65; }
			if(c.r == 193 && c.g == 27 && c.b == 23){ return 60; }
			if(c.r == 229 && c.g == 103 && c.b == 23){ return 55; }
			if(c.r == 237 && c.g == 218 && c.b == 116){ return 50; }

			//empty
			if(c.r == 255 && c.g == 255 && c.b == 255){ return 50; }		
			if(c.r == 253 && c.g == 253 && c.b == 253){ return 50; }		
			if(c.r == undefined){ return 50; }		

			//no value found?
			console.log('no color value found');
			console.log(c);
			return 50;
		}

		//read png
	    var reader = new PNGReader(data);
	    reader.parse(function(err,png){

	    	//error?
	        if(err){
	        	console.log(err);
	        	return false;
	        } 

	        //determine stepsize
	        var stepSizeX = Math.floor(png.getWidth()/steps);
			var stepSizeY = Math.floor(png.getHeight()/steps);

	        //read average
	        var total = 0;
	        for( var x = 0; x < png.getWidth() ; x+= stepSizeX ){
	        	for ( var y = 0; y < png.getHeight() ; y+= stepSizeY ){
	        		var pixel = png.getPixel(x,y);
	        		total = total+translateColor({
	        			r: pixel[0],
	        			g: pixel[1],
	        			b: pixel[2],
	        			a: pixel[3]
	        		});
	        	}
	        }

	        //get avg
	        var avg = total / (steps*steps);

	        //save object
	        var toUpdate = { $push : {} };
	        var add = { 'key': key, 'db': avg };

	        console.log('street point: ' + avg + 'dB');

	        //day/night?
	        if(type == 'carNight'){
	        	toUpdate.$push = {
	        		'soundNight': {
		        		$each: [add],
		        		// $sort: { key: 1 }
	        		}
	        	};
	        } else if (type == 'carDay'){
	        	toUpdate.$push = {
	        		'soundDay': {
		        		$each: [add],
		        		// $sort: { key: 1 }
	        		}
	        	};
	        }

	        //train
	        if(type == 'trainNight'){
	        	toUpdate.$push = {
	        		'soundNight': {
		        		$each: [add],
		        		// $sort: { key: 1 }
	        		}
	        	};
	        } else if (type == 'trainDay'){
	        	toUpdate.$push = {
	        		'soundDay': {
		        		$each: [add],
		        		// $sort: { key: 1 }
	        		}
	        	};
	        }


	        //try to save
	        updates.push(toUpdate);
	        console.log('done ' + updates.length + '/' + points.length * 2);

	        //finished?
	        if(updates.length >= (2 * points.length ) ){
	        	console.log('done a street');
				deferred.resolve(updates);
	        }

	    });

	};

	//fetch the data
	var fetch = function(points, type){

		//request function
		var getPNG = function(tileUrl, type, key){

			console.log('fetch tile: ' + tileUrl);

		    // get from the interwebz. No caching because of tailormade tiles :-)
		    var request = http.get(tileUrl, function(res){
			    var imagedata = '';
			    res.setEncoding('binary');
			    console.log('get png url ' + tileUrl);

			    //received more data
			    res.on('data', function(chunk){
			        imagedata += chunk;
			    });

			    //image completed
			    res.on('end', function(){

			    	console.log('received png');
			    	if(imagedata.indexOf('html') > -1){
			    		console.log('ERROR received html instead of png');
			    		console.log(imagedata);
			    	} else {
			    		readNoise(imagedata, type, key);
			    	}

			    }).on('error', function(e) {
				  console.log("Got error: " + e.message);
				});

			});

	   	};

		//loop through points
		_.each(points, function(val, key){

			//get urls
			urls = getTileUrls(val);

			//get the data
			if(type == 'car'){
				getPNG(urls.day.car, 'carDay', key);
				getPNG(urls.night.car, 'carNight', key);
			} else if(type =='train'){
				getPNG(urls.day.train, 'trainDay', key);
				getPNG(urls.night.train, 'trainNight', key);
			}

		});

	}

	//start
	fetch(points, type);
	return this.promise;

};