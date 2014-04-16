IO.scrapers.NSL = function(db, src){

	var data, polution;
	console.log('Get NSL data');

	//promise
	var deferred = Q.defer();
	this.promise = deferred.promise;

	var convertToRDC = function(list){

		console.log('RDC list: ' + list.length);

		_.each(list, function(val,key){

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

		return list;
	};

	var compareList = function(list){

		console.log('comparing list');

		//compare all
		_.each(list, function(building){

			var closest = null;
			var distMin = null;
			_.each(polution, function(val,key){

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

		});

		//done
		console.log('finished NSL data');
		deferred.resolve();

	}

	//get the data - NSL
	console.log('start preparing NSL data');

	//read the data
	var Fiber = Npm.require('fibers');
    Fiber(function(){

    	//get pollution data
		polution = JSON.parse( Assets.getText(src) );
		console.log('read: ' + polution.length);
		polution = convertToRDC(polution);

		//get mongo data
		data = db.find({}).fetch();
		compareList(data);

    }).run();

    //return promise
	return this.promise;

}
