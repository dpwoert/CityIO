Package.describe({
	summary: "cityIO - element - build surfaces based on OSM data"
});

Package.on_use(function (api) {

	api.use(['cityio','cityio-element'], 'server');

	// load front-end
	api.add_files('surfaces.js', 'client', { isAsset: true });
	api.add_files('add.js', 'server');

});