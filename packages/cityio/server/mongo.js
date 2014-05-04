mongo = {};

mongo.init = function(){

	//make mongo collections
	mongo.Buildings = new Meteor.Collection('buildings2');
	mongo.Streets = new Meteor.Collection('streets2');
	mongo.Regions = new Meteor.Collection('regions');
	mongo.Traffic = new Meteor.Collection('traffic');

};
