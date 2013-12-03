window.data = {};

Meteor.startup(function(){

	//get data
	geo.init();

	//make 3d
	DDD.init();

	mouse.init();

	//trigger reload
	window.rebuildCity = function(add){
		DDD.pause = true;
		Meteor.call('buildCity',add);
	};
	window.rebuildStreets = function(){
		DDD.pause = true;
		Meteor.call('buildStreets');
	};
	window.getPollution = function(again){
		DDD.pause = true;
		Meteor.call('getPollution',again);
	};
	window.updateBuilding = function(id,obj){
		DDD.pause = true;
		Meteor.call('updateBuilding', id,obj);
	};
});