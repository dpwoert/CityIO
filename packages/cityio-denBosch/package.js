Package.describe({
	summary: "cityIO - Den Bosch visualisation"
});

Package.on_use(function (api) {

	// use dependencies
	api.use(['cityio','cityio-loader'], 'client');
	api.use(['cityio','Q'], 'server');

	// load front-end
	api.add_files('client/buildpack.js', 'client');

	//load server
	api.add_files([

		'server/build.js',
		'server/cache.js',
		'server/fetch.js'

	], 'server');

});
