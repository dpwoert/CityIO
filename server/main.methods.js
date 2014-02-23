Meteor.methods({
	
	buildCityV2: function(city){

		switch(city){

			//den bosch
			case 'denBosch':
			case 'sHertogenBosch':
			case 's-HertogenBosch': 
				buildpack.denBosch(); 
			break;

			//amsterdam
			case 'amsterdam': 
				buildpack.amsterdam(); 
			break;

			//rotterdam
			case 'rotterdam':
				buildpack.rotterdam();
			break;

		}

	},

	getData: function(city){

		return cache.get(city);

	},

	TEST: function(){
		return mongo.Buildings.find({city: 'denBosch'}).fetch();
	}

});