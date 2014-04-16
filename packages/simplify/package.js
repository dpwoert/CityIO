// https://github.com/mourner/suncalc
Package.describe({
	summary: "Simplify - a high-performance JS polyline simplification library"
});

// Tell Meteor what to do with our package at bundle time
Package.on_use(function (api) {

	//server via NPM
	api.add_files('simplify.js', 'server');

	api.export('simplify', 'server');

});
