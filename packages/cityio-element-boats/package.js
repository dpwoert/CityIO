Package.describe({
	summary: "cityIO - element - Live boats with AIS data"
});

Package.on_use(function (api) {

	api.use(['cityio','cityio-element'], 'server');

	//models
	api.add_files('3dmodels/ship2.json', 'client', { isAsset: true });

	// load front-end
	api.add_files('boats.js', 'client', { isAsset: true });
	api.add_files('boats-webworker.js', 'client', { isAsset: true });
	api.add_files('add.js', 'server');

});
