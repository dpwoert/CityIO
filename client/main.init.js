window.data = {};

Meteor.startup(function(){

	//get data
	geo.init();

	//make 3d
	DDD.init();
	
});