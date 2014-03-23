Meteor.methods({

	buildCityV2: function(city){

		//disable temp
		return false;

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

		return IO.cache.get(city);

	}

});
