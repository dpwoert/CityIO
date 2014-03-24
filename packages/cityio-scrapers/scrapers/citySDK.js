IO.scrapers.CitySDK = function(city){

	//get region
	var region;
	switch(city){
		case 'denBosch': region = 'admr.nl.shertogenbosch';
		case 'amsterdam': region = 'admr.nl.amsterdam';
	}

	//settings
	// var apiUrl = 'http://api.citysdk.waag.org/'+region+'/nodes';
	var apiUrl = 'http://api.citysdk.waag.org/nodes';
	var filters = {};

	//promisses
	var that = this;

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
			per_page: 500,
			page: 0,

			filter: 'none',
			filterOptions: {},
			after: null,
			finished: null,
			maxCalls: 100,

			save: false,
			saveTo: null,

			url: apiUrl

		});

		var deferred = q.defer();
		getPages(obj, deferred);
		return deferred.promise;

	};

	//add to mongoDB
	var saveTo = function(db, obj){
		if(obj) db.insert(obj);
	}

	//get filter
	var getFilter = function(name){
		return filters[name];
	};

	//whitelist
	var whitelist = function(item, list){
		return (list.indexOf(item) > -1) ? true : false;
	}

	//do the magic stuff
	var getPages = function(options, deferred){

		var calls = 0;

		//filter url
		var urlOptions = _.omit(options, 'after', 'filter','finished', 'maxCalls', 'save', 'saveTo', 'filterOptions', 'url', 'whitelist');

		var getPage = function(){

			//measure no calls
			calls++;
			urlOptions.page += 1;
			console.log('get page: ' + urlOptions.page)

			//make request
			Meteor.http.get(options.url, { params: urlOptions } , function(error, result){

				console.log(result.data.url);
				console.log(options.url);
				console.log(urlOptions);

				//check if error - if so reject with promises
				if(error){
					console.log('error');
					console.log(error);
					deferred.reject(error);
				}

				//add to data object
				_.each(result.data.results, function(value){

					//whitelist
					if(options.whitelist){
						if(!whitelist(value.cdk_id, options.whitelist)) return false;
					}

					//filter
					var filter = getFilter(options.filter);
					value = filter(value, options.filterOptions);

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
		this.addFilter('surface', function(d, options){
			return {
				'id': d.cdk_id,
				'name': d.name,
				geom: d.geom,
				'type': options.type
			};
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
			var split = geo.splitRoad(d.geom.coordinates);
			if(split.length < 2) return false;
			return {
				'id': d.cdk_id,
				'name': d.name,
				'maxspeed': d.layers.osm.data.maxspeed,
				'highway': d.layers.osm.data.highway,
				'points': split,
				'soundDay': [],
				'soundNight': [],
				'type': 'street'
			};
		});

		//rails
		this.addFilter('soundRails', function(d){
			var split = geo.splitRoad(d.geom.coordinates);
			return {
				'id': d.cdk_id,
				'name': d.name,
				'points': geo.filterRadius(split, [that.lat, that.lon], that.radius ),
				'soundDay': [],
				'soundNight': [],
				'type': 'rails'
			};
		});

	}.call(this);

};
