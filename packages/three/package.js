// Give our package a description
Package.describe({
	summary: "THREE.js - 3d via WebGL"
});

// Tell Meteor what to do with our package at bundle time
Package.on_use(function (api) {

	//add threejs
	// api.add_files('three.min.rev60.js', 'client', {bare: true});
	// api.add_files('three.min.rev66.js', 'client', {bare: true});
	api.add_files('three.min.rev67dev.js', 'client', {bare: true});
	api.export('THREE', 'client');

});
