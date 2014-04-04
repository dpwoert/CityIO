Package.describe({
	summary: "cityIO global package"
});

Package.on_use(function (api) {

	var both = ['client','server'];

	// use dependencies
	api.use(['underscore','three','Q'], 'client');
	api.use(['underscore'], 'server');

	// load front-end
	api.add_files([

		'client/global.js',

		'client/methods/measureDistance.js',
		'client/methods/easing.js',
		'client/methods/removeDoubles.js',

		'client/classes/Points.js',
		'client/classes/Preloader.js',
		'client/classes/Timeline.js',
		'client/classes/CameraPosition.js',

		'client/init.js',
		'client/render.js'

	], 'client');

	//load server
	api.add_files([

		'server/global.js',
		'server/mongo.js',
		'server/methods.js',

		'server/methods/proj4.min.js',
		'server/methods/acces.js',
		'server/methods/cachestrip.js',
		'server/methods/roundGPS.js',

		'server/classes/geo.js',

		'server/startup.js',

	], 'server');

	//make globals
	api.export('IO', both);
	api.export(['mongo','geo'], 'server');

});
