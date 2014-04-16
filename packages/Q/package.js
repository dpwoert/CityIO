// Give our package a description
Package.describe({
	summary: "Q - promises library against callback horror"
});

//require npm via server
Npm.depends({
    'q': '1.0.0'
});

// Tell Meteor what to do with our package at bundle time
Package.on_use(function (api) {

	var both = ['server', 'client'];

	//add threejs
	api.add_files('q.min.js', 'client', {bare: true});

	//server via NPM
	api.add_files('add.js', 'server');
	api.export('Q', 'server');

});
