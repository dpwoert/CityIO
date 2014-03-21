// Give our package a description
Package.describe({
	summary: "THREE.js - First Person Controls"
});

// Tell Meteor what to do with our package at bundle time
Package.on_use(function (api) {

	api.use('three', 'client');

	//add threejs
	api.add_files('FirstPersonControlsCustom.js', 'client', {bare: true});

});