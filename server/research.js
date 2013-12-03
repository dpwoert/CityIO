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

	var query = { fijnstof: { $exists:  } };
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

research.getNoise = function(pos){

}