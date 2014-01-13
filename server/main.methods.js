Meteor.methods({
	
	buildCityV2: function(city){

		var scrape;

		switch(city){

			//den bosch
			case 'denBosch': scrape = scrapers.denBosch; break;
			case 'sHertogenBosch': scrape = scrapers.denBosch; break;
			case 's-HertogenBosch': scrape = scrapers.denBosch; break;
		}

		scrape();

	},

	getTheData: function(){

		return mongo.Buildings.find().fetch();

	},

	getNSL: function(){
		console.log('NSL');
		return JSON.parse( Assets.getText("data/data-pollution.json") );
	}

});