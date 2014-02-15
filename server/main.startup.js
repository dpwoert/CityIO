cache = null;

Meteor.startup(function(){

	//log
	console.log('Server startup 2');

	//get mongo collections
	mongo.init();

	//make cache
	cache = new buildJSON();

});