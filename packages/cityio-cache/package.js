Package.describe({
	summary: "cityIO - Caching city data"
});

Package.on_use(function (api) {

	api.use(['meteor','cityio','underscore'], 'server');

	// load front-end
	api.add_files([

		'Cache.js',
		'startup.js',

	], 'server');

});
