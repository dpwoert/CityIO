Package.describe({
	summary: "cityIO - Routing for loading cities"
});

Package.on_use(function (api) {

	api.use(['cityio','iron-router','underscore'], 'client');

	// load front-end
	api.add_files('router.js', 'client');

});