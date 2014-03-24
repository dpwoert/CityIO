// Give our package a description
Package.describe({
	summary: "Google Analytics"
});

// Tell Meteor what to do with our package at bundle time
Package.on_use(function (api) {

	//add threejs
	api.add_files('analytics.js', 'client', {bare: true});
	//api.export('ga', 'client');

});