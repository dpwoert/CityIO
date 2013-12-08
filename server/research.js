//import research data
research = {};

//load pollution data to database
research.getPollution = function(db, again){

	console.log('====== GET POLLUTION DATA ======');
	var count = 0;

	//load & loop through the data
	var data = JSON.parse(Assets.getText("data/data-pollution.json"));
	_.each(data, function(val,key){

		//convert Rijksdriehoekcoordinaten(RDC) to Lat/Lon
		var pos = val.geomet_wkt.replace('POINT(','').replace(')','');
		pos = pos.split(' ');
		var RDC = '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel ' +
			  '+towgs84=565.237,50.0087,465.658,-0.406857,0.350733,-1.87035,4.0812 +units=m +no_defs'
		var pos2 = proj4(RDC, 'EPSG:4326', [ pos[0],pos[1] ]);

		//save
		val.RDC = pos;
		val.pos = [pos2[1],pos2[0]];

	});

	var query = { fijnstof: { $exists: false } };
	if(again) query = {};
	db.find(query).forEach(function(building){

		var closest = null;
		var distMin = null;
		_.each(data, function(val,key){

			//get distance like a caveman
			var dist = measureDistance(building.center[1],building.center[0] , val.pos[0], val.pos[1]);

			//check if distance is shorter then previous distances
			if(dist < distMin || distMin == null){
				closest = val;
				distMin = dist;
			}

		});

		//save to db
		db.update(building._id, {
        	$set: {
	        	fijnstof: {
	        		no2: closest.conc_no2,
					pm10: closest.conc_pm10,
					pm25: closest.conc_pm25
	        	}
        	}
        });

		count++;
        console.log('saved ' + building.id + ' | ' + count);
        console.log('no2: ' + closest.conc_no2);
        console.log('dist:' + distMin);

	});
	
};

//todo for multiple points
research.getNoise = function(points, id, db){

	// var getIMG = function(tileUrl, type, key){
	// 	console.log('convert tile to img url: ' + tileUrl);
	// 	Meteor.http.get(tileUrl, {} , function(error, result){
	// 		//if(error) console.log(error);
	// 		var obj = JSON.parse(result.content);
	// 		getPNG(obj.href, type, key);
	// 	});
	// }

	//request function
	var getPNG = function(tileUrl, type, key){

		console.log('fetch tile: ' + tileUrl);

	    // get from the interwebz. No caching because of tailormade tiles :-)
		var http = Npm.require('http');
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
		    		research.readNoise(imagedata, type, key, id, db);
		    	}

		    }).on('error', function(e) {
			  console.log("Got error: " + e.message);
			});

		});

   	};

	//loop through points
	_.each(points, function(val, key){

		//get urls
		urls = tiles.getSoundTile(val);

		//get the data
		getPNG(urls.day.car, 'carDay', key);
		getPNG(urls.night.car, 'carNight', key);
		// getIMG(urls.day.train, 'trainDay');
		// getIMG(urls.night.train, 'trainDay');

	});


}

research.readNoise = function(data, type, key, id, db){

	//determine nr of steps
	var steps = 25; //on one axis

	console.log('reading noise for ' + id);

	//translate color values to values
	function translateColor(c){

		// car/train day
        // HEX / RGB | dB
        // #330033 / rgb(51, 0, 51) = 75+
        // #C031C7 / rgb(192, 49, 199) = 70-74
        // #FF0000 / rgb(255, 0, 0) = 65-69
        // #F88017 / rgb(248, 128, 23) = 60-64
        // #FFFF00 / rgb(255, 255, 0) = 55-59


        // car/train night
        // HEX / RGB | dB
        // #5E767E / rgb(94, 118, 126) = 70+
        // #C48793 / rgb(196, 135, 147) = 65-69
        // #C11B17 / rgb(193, 27, 23) = 60-64
        // #E56717 / rgb(229, 103, 23) = 55-59
        // #EDDA74 / rgb(237, 218, 116) = 50-54

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
	var PNGReader = Meteor.require('png.js');
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


        //try to save
        var Fiber = Npm.require('fibers');
        Fiber(function(){

	        console.log('saved | ' + key + ' | ' + type + '| id: ' + id + ' | avg: ' + avg + '| total: ' + total);
        	db.update(id, toUpdate);

        }).run();

    });

}