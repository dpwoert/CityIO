Package.describe({
	summary: "cityIO - load external data"
});

Package.on_use(function (api) {

	// use dependencies
	api.use(['underscore','Q','cityio'], "client");

	// load front-end
	api.add_files([

		'lib/loadScript.js',
		'lib/loadData.js',
		'lib/ShaderLoader.js',

	], 'client');


});