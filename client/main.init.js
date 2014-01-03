Meteor.startup(function(){

	//make 3d
	DDD.init();

	//get data
	//data.init();

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