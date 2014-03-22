if(!IO || !IO.buildpacks){
	console.error('IO-router dependency loaded before buildpacks or missing IO object');
	return false;
}

Router.map(function () {

    this.route('loadCity', {

        path: '/city/:city',
        action: function () {

            var city = this.params.city;
            var found = false;

            //search
            _.each(IO.buildpacks, function(val){

            	if(val.slug == city){

            		//found and load
            		val.action();
            		found = true;

            	}

			});

			//not found
			if(!found) console.warn('city not found: ' + city);

        }

    });

    this.route('home', {
    	path: '/',
    	action: function(){
    		//do this until layout fix
    		Router.go('/city/den-bosch');
    	}
  	});

});