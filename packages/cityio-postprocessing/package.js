// Give our package a description
Package.describe({
	summary: "cityIO - post processing shaders"
});

// Tell Meteor what to do with our package at bundle time
Package.on_use(function (api) {

	api.use(['three', 'cityio'], 'client');

	//add threejs
	api.add_files([

		'three/CopyShader.js',
		'three/EffectComposer.js',
		'three/FilmPass.js',
		'three/FilmShader.js',
		'three/FXAAShader.js',
		'three/HorizontalTiltShiftShader.js',
		'three/VerticalTiltShiftShader.js',
		'three/RenderPass.js',
		'three/ShaderPass.js',

		'fx.js'

	], 'client');

});