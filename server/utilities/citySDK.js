CitySDK = function(city){
	
	//settings
	this.url = 'http://api.citysdk.waag.org/admr.nl.shertogenbosch/nodes';
	this.filters = {};

	this.setPosition = function(lat, lon, radius){
		this.lat = lat;
		this.lon = lon;
		this.radius = radius * 1000;
	};

	this.addFilter = function(name, filter){
		this.filters[name] = filter;
	}

	this.get = function(obj){

		//merge - set defaults
		_.defaults(obj, {

			lat: this.lat,
			lon: this.lon,
			radius: this.radius,

			geom: true,
			per_page: 1000,
			page: 0

			filter: 'none',
			after: null,
			finished: null,
			maxCalls: 100

			save: false,
			saveTo: null

		});

	};

	//add to mongoDB
	var saveTo = function(db, obj){
		db.insert(obj);
	}

	//get filter
	var getFilter = function(name){
		return this.filters[name];
	};

	//do the magic stuff
	var getPages = function(options){

		var calls = 0;

		//filter url
		var urlOptions = _.omit(options, 'after', 'filter','finished', 'maxCalls');

		function getPage(){

			//measure no calls
			calls++;
			options.page += 1;
			console.log('get page: ' + options.page)

			//make request
			Meteor.http.get(this.url, { params: urlOptions } , function(error, result){

				console.log(result.data.url);

				//add to data object
				_.each(result.data.results, function(value){

					//filter
					var filter = getFilter(options.filter);
					value = filter(value);

					//add city key
					value.city = city;

					//after
					if(_.isFunction(options.after) options.after(value);

					//save
					if(options.save) saveTo(options.saveTo, value);

				});

				//check if finished/more pages
				if(result.data.results.length < options.per_page || calls >= options.maxCalls){

					//finished
					console.log('finshed gettings CitySDK data');
					if(_.isFunction(options.finished) options.finished();

				} 
				else {
					//proceed
					getPage();
				}
			});

		}
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
		})

	}.call(this);

};

//shortcut
SDK = citySDK;