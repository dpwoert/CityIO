Package.describe({
	summary: "cityIO - element - build street based on sound data"
});

Package.on_use(function (api) {

	api.use(['cityio','cityio-element'], 'server');

	// load front-end
	api.add_files('soundStreets.js', 'client', { isAsset: true });
	api.add_files('add.js', 'server');

});