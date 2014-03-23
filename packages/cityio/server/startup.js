cache = null;

Meteor.startup(function(){

	//log
	console.log('Server startup');

	//get mongo collections
	mongo.init();

	//make cache
	IO.cache = new IO.Cache();

});
