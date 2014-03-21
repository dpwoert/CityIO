// Give our package a description
Package.describe({
	summary: "Q - promises library against callback horror"
});

// Tell Meteor what to do with our package at bundle time
Package.on_use(function (api) {

	var both = ['server', 'client'];

	//add threejs
	api.add_files('q.min.js', 'client', {bare: true});
	//api.add_files('q.min.js', 'server');
	//api.export('Q', 'client');

	//todo server

});