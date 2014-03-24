// Give our package a description
Package.describe({
	summary: "proj4 - transform point coordinates from one coordinate system to another, including datum transformations."
});

//require npm via server
Npm.depends({
    'proj4': '2.1.0'
});

// Tell Meteor what to do with our package at bundle time
Package.on_use(function (api) {

	//server via NPM
	api.add_files('add.js', 'server');
	api.export('proj4', 'server');

});
