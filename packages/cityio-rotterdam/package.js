Package.describe({
	summary: "cityIO - Rotterdam visualisation"
});

Package.on_use(function (api) {

	// use dependencies
	api.use(['cityio','cityio-loader'], "client");
	api.use(['cityio','Q'], "server");
	api.add_files('dependencies.js', 'server');

	//add ships
	api.add_files([

		'3dmodels/ship2.json'

	], 'client', {isAsset: true});

	// load front-end
	api.add_files('client/buildpack.js', 'client');

	//load server
	api.add_files([

		'server/build.js',
		'server/cache.js',
		'server/fetch.js'

	], 'server');

});
