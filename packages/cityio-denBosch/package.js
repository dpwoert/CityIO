Package.describe({
	summary: "cityIO - Den Bosch visualisation"
});

Package.on_use(function (api) {

	// use dependencies
	api.use(['cityio','cityio-loader'], "client");

	// load front-end
	api.add_files('client/buildpack.js', 'client');


});