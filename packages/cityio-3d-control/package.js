// Give our package a description
Package.describe({
	summary: "CityIO - 3d map controls for THREE.js"
});

// Tell Meteor what to do with our package at bundle time
Package.on_use(function (api) {

	api.use('three', 'client');

	//add map controls
	api.add_files('controls.js', 'client');

});
