Package.describe({
	summary: "cityIO - element - Live boats with AIS data"
});

Package.on_use(function (api) {

	api.use(['cityio','cityio-element'], 'server');

	//AIS data
	api.add_files('scrapers/AIS.js', 'server');
	api.add_files('webworker/API.js', 'server');

	//models
	api.add_files('3dmodels/ship2.json', 'client', { isAsset: true });

	//shaders
	api.add_files('shaders/boatFragment.glsl', 'client', { isAsset: true });
	api.add_files('shaders/boatVertex.glsl', 'client', { isAsset: true });

	// load front-end
	api.add_files('boats.js', 'client', { isAsset: true });
	api.add_files('webworker/boats-webworker.js', 'client', { isAsset: true });
	api.add_files('add.js', 'server');

});
