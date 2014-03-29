Meteor.methods({

	buildCity: function(city){

		if(IO.buildpacks[city]){
			//found buildpack
			IO.buildpacks[city].fetch();
		} else {
			//didn't found it
			console.error('Buildpack "'+city+'" isnt found...');
		}

	},

	getData: function(city){

		return IO.cache.get(city);

	}

});
