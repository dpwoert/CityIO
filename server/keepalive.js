function keepAlive() {
	
    setInterval(function() {

    	//open in fiber
		var Fiber = Npm.require('fibers');
		Fiber(function(){

			//request and re-do
        	Meteor.http.get('http://city3d.herokuapp.com');
        	keepAlive();

		}).run();

    }, 20 * 58 * 1000);
}

keepAlive();
	