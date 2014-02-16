var Fiber = Npm.require('fibers');
Fiber(function(){

	function keepAlive() {
	    setInterval(function() {
	        Meteor.http.get('http://city3d.herokuapp.com');
	        keepAlive();
	    }, 20 * 58 * 1000);
	}

	keepAlive();
    	
}).run();