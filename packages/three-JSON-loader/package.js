// Give our package a description
Package.describe({
	summary: "THREE.js - JSON model loader"
});

// Tell Meteor what to do with our package at bundle time
Package.on_use(function (api) {

	api.use(['meteor','three'], 'client');

	//add threejs
	api.add_files('JSONLoader.js', 'client', {bare: true});

});