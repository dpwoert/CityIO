mongo = {};

mongo.init = function(){

	//make mongo collections
	mongo.Buildings = new Meteor.SmartCollection('buildings2');
	mongo.Streets = new Meteor.SmartCollection('streets2');
	
};