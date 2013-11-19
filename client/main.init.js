window.data = {};

Meteor.startup(function(){

	//get data
	geo.init();

	//make 3d
	DDD.init();

	mouse.init();

	//trigger reload
	window.rebuildCity = function(){
		DDD.pause = true;
		Meteor.call('buildCity');
	}
});