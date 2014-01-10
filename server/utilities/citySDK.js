citySDK = function(){
	
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
			layer: 'bag.panden',
			geom: true,
			per_page: 1000,
			page: 0
			filter: null
		});

	};

	getPages = function(options){

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
					options.after(options.filter(value));
				});

				//check if finished/more pages
				if(result.data.results.length < obj.per_page || calls >= options.maxCalls){

					//finished
					console.log('finshed gettings BAG data');
					if(_.isFunction(options.finished) options.finished();
				} 
				else {
					getPage();
				}
			});

		}
	};

};

SDK = citySDK;