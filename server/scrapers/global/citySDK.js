CitySDK = function(city){

	//get region
	var region;
	switch(city){
		case 'denBosch': region = 'admr.nl.shertogenbosch';
	}
	
	//settings
	var apiUrl = 'http://api.citysdk.waag.org/'+region+'/nodes';
	var filters = {};

	//promisses
	var q = Meteor.require('q');

	this.setPosition = function(lat, lon, radius){
		this.lat = lat;
		this.lon = lon;
		this.radius = radius * 1000;
	};

	this.addFilter = function(name, filter){
		filters[name] = filter;
	}

	this.get = function(obj){

		//merge - set defaults
		_.defaults(obj, {

			lat: this.lat,
			lon: this.lon,
			radius: this.radius,

			geom: true,
			per_page: 1000,
			page: 0,

			filter: 'none',
			after: null,
			finished: null,
			maxCalls: 100,

			save: false,
			saveTo: null

		});

		var deferred = q.defer();
		getPages(obj, deferred);
		return deferred.promise;

	};

	//add to mongoDB
	var saveTo = function(db, obj){
		db.insert(obj);
	}

	//get filter
	var getFilter = function(name){
		return filters[name];
	};

	//do the magic stuff
	var getPages = function(options, deferred){

		var calls = 0;

		//filter url
		var urlOptions = _.omit(options, 'after', 'filter','finished', 'maxCalls', 'save', 'saveTo');

		var getPage = function(){

			//measure no calls
			calls++;
			urlOptions.page += 1;
			console.log('get page: ' + urlOptions.page)

			//make request
			Meteor.http.get(apiUrl, { params: urlOptions } , function(error, result){

				console.log(result.data.url);

				//check if error - if so reject with promises
				if(error){
					console.log('error');
					deferred.reject(error);
				}

				//add to data object
				_.each(result.data.results, function(value){

					//filter
					var filter = getFilter(options.filter);
					value = filter(value);

					//add city key
					value.city = city;

					//after
					if(_.isFunction(options.after)) options.after(value);

					//save
					if(options.save) saveTo(options.saveTo, value);

				});

				//check if finished/more pages
				if(result.data.results.length < options.per_page || calls >= options.maxCalls){

					//finished
					console.log('finshed getting CitySDK data');
					if(_.isFunction(options.finished)) options.finished();

					//promise finished
					deferred.resolve();

				} 
				else {
					//proceed
					getPage();
				}
			});

		}

		//start getting data
		getPage();

	};

	//add standard filters
	this.addFilters = function(){

		//no filter
		this.addFilter('none', function(d){
			return d;
		});

		//multi to normal polygon
		this.addFilter('multipolygon', function(d){
			//TODO
			return d;
		});

		//BAG records
		this.addFilter('BAG', function(d){
			return {
				id: d.layers['bag.panden'].data.pand_id,
				bouwjaar: d.layers['bag.panden'].data.bouwjaar,
				geom: d.geom,
				height: 0,
				center: geo.getCenter(d.geom.coordinates[0])
			};
		});

		//streets
		this.addFilter('soundStreets', function(d){
			return {
				'id': d.cdk_id,
				'name': d.name,
				'maxspeed': d.layers.osm.data.maxspeed,
				'highway': d.layers.osm.data.highway,
				'points': geo.splitRoad(d.geom.coordinates),
				'soundDay': [],
				'soundNight': [],
				'type': 'street'
			};
		});

		//rails
		this.addFilter('soundRails', function(d){
			return {
				'id': d.cdk_id,
				'name': d.name,
				'maxspeed': d.layers.osm.data.maxspeed,
				'highway': d.layers.osm.data.highway,
				'points': geo.splitRoad(d.geom.coordinates),
				'soundDay': [],
				'soundNight': [],
				'type': 'rails'
			};
		});

	}.call(this);

};

//shortcut
SDK = CitySDK;