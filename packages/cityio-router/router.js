if(!IO || !IO.buildpacks){
	console.error('IO-router dependency loaded before buildpacks or missing IO object');
	return false;
}

var loaded = false;

Router.map(function () {

    this.route('loadCity', {

        path: '/city/:city',
        action: function () {

            var city = this.params.city;
            var found = false;

            //search
            _.each(IO.buildpacks, function(val){

            	if( val.slug == city && !loaded ){

            		//found and load
					IO.loaded = true;
            		val.action();
            		found = true;

            	}

				if(loaded){
					console.warn('already loaded something');
				}

			});

			//not found
			if(!found) console.warn('city not found: ' + city);

        }

    });

	this.route('home', {
    	path: '/',
    	onBeforeAction: function(){
    		//do this until layout fix
    		Router.go('/city/den-bosch');
    	}
	});

});
