mongo = {};

mongo.init = function(){

	//make mongo collections
	mongo.Buildings = new Meteor.SmartCollection('buildings');
	mongo.Streets = new Meteor.SmartCollection('streets');
	
};