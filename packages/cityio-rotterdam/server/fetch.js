// var q = Meteor.require('q');

IO.buildpacks.rotterdam.fetch = function(){

	console.log('start fetching Rotterdam');

	//Geo Pos to load
	var lat = 51.91144966468436;
	var lon = 4.478473663330078;
	var radius = 2;

	//reset
	mongo.Buildings.remove({ city: 'rotterdam' });
	mongo.Streets.remove({ city: 'rotterdam' });
	mongo.Regions.remove({ city: 'rotterdam' });

	console.log('Resetted mongo');

	//first get all the 2d map data through CitySDK
	var sdk = new IO.scrapers.SDK('rotterdam');
	sdk.setPosition(lat, lon, radius);

	//BAG / Cadadastral data
	var BAG = sdk.get({
		layer: 'bag.panden',
		filter: 'BAG',
		save: true,
		saveTo: mongo.Buildings
	});

	//regions
	var districts = sdk.get({
		url: 'http://api.citysdk.waag.org/regions',
		'admr::admn_level': 4,
		filter: 'surface',
		filterOptions: { type: 'admr' },
		save: true,
		saveTo: mongo.Regions
	});

	//Water
	var water = sdk.get({
		'osm::natural': 'water',
		filter: 'surface',
		filterOptions: { type: 'water' },
		//whitelist: ["w79861749", "w79861722", "w79857309", "w79855122", "w79849735", "w79855160", "w79855542", "w79861763", "w79857655", "w79861769", "w79854990", "w79855272", "w79855310", "w80759490", "w79855147", "w102959190", "w80754344", "w80760148", "w80755652", "w80763492", "w80763489", "w80756598", "w80763494", "w80755200", "w80763500", "w80754094", "w80763503", "w80744173", "w80747740", "w80740870", "w80739778", "w80741599", "w80739872", "w80742148", "w80744706", "w80744493", "w80739646", "w80744765", "w80739548", "w80743920", "w80747724", "w80745384", "w80740151", "w80739293", "w80742729", "w80758126", "w80763501", "w80758388", "w80760285", "w80753982", "w80755328", "w80756383", "w80741929", "w80744062", "w80744425", "w80743968", "w80740933", "w80740993", "w80739629", "w79855867", "w79849236", "w79849735", "w80740009", "w80763496", "w80760003", "w80760006", "w80755914", "w80757683", "w80759542", "w80758682", "w80760697", "w80760424", "w80763504", "w80757889", "w80759928", "w80763502", "w80763491", "w80757253", "w80759826", "w80759292", "w80760445", "w80763493", "w80758950", "w80759526", "w80757909", "w80759772", "w80754214", "w80755142", "w80743834", "w80760926", "r1211968", "w163788279", "w96322190", "w80755602", "w137214113", "w80756956", "w137214113", "w137214116", "w137214115", "w80758474", "w80758742", "w80757123", "w80758600", "w80757841", "w80755187", "w80756340", "w80758410", "w80758531", "w80756229", "w80758299", "w80759454", "w80760685", "w80753632", "w80758616", "w80759009", "w80753867", "w80753838", "w80758469", "w80760309", "w80755826", "w80760592", "w80757326", "w80760336", "w60697107"],
		save: true,
		saveTo: mongo.Regions
	});

	//grass
	var grass = sdk.get({
		'osm::landuse': 'grass',
		filter: 'surface',
		filterOptions: { type: 'grass' },
		save: true,
		saveTo: mongo.Regions
	});

	//execute
	q.all([BAG, districts, water, grass])

		.then(function(){

			//Get AHN height data
			return IO.batch.AHN(mongo.Buildings);

		}).then(function(){

			//cache.build();

			console.log('\033[31m ========================= \033[91m');
			console.log('\033[31m COMPLETED \033[91m');

		});


};
