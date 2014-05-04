Package.describe({
	summary: "cityIO - add abbility to add elements for lazy loading"
});

Package.on_use(function (api) {

	api.use(['cityio','iron-router'], 'server');

	// load front-end
	api.add_files('move.js', 'server');

	//add global shaders
	api.add_files([

		'shaders/soundTubeFragment.glsl',
		'shaders/soundTubeVertex.glsl',
		'shaders/surfaceFragment.glsl',
		'shaders/surfaceVertex.glsl',

	], 'client', {isAsset: true});
	api.add_files('addGlobalShaders.js', 'server');

	//make API live handle
	api.add_files('live.js', 'server');

});
