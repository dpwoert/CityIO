Meteor.methods({
	
	buildCityV2: function(city){

		var build;

		switch(city){

			//den bosch
			case 'denBosch': build = buildpack.denBosch; break;
			case 'sHertogenBosch': build = buildpack.denBosch; break;
			case 's-HertogenBosch': build = buildpack.denBosch; break;
		}

		build();

	},

	getTheData: function(){

		return mongo.Streets.find().fetch();

	}

});