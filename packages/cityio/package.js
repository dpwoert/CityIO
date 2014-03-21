Package.describe({
	summary: "cityIO global package"
});

Package.on_use(function (api) {

	var both = ['client','server'];

	// use dependencies
	api.use(['underscore','three','Q'], "client");

	// load front-end
	api.add_files([

		'client/global.js',

		'client/methods/measureDistance.js',

		'client/classes/Points.js',
		'client/classes/Preloader.js',
		'client/classes/Timeline.js',
		'client/classes/CameraPosition.js',

		'client/init.js',
		'client/render.js'

	], 'client');

	//load server
	api.add_files([

		'server/global.js'

	], 'server');

	//make globals
	api.export('IO', both);

});