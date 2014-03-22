Package.describe({
	summary: "cityIO - add abbility to add elements for lazy loading"
});

Package.on_use(function (api) {

	api.use(['cityio','iron-router'], 'server');

	// load front-end
	api.add_files('move.js', 'server');
	api.add_files('addGlobalShaders.js', 'server');

});