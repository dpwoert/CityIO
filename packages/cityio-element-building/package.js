Package.describe({
	summary: "cityIO - element - build 3d buildings from AHN and BAG data"
});

Package.on_use(function (api) {

	api.use(['cityio','cityio-element'], 'server');

	// load front-end
	api.add_files('buildings.js', 'client', { isAsset: true });
	api.add_files('add.js', 'server');

});