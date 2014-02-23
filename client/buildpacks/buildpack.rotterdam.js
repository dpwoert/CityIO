window.buildpacks = window.buildpacks || {};

buildpacks.rotterdam = function(){

	console.log('start loading Rotterdam');
	
	var loadShaders = function(){

		console.log('load shaders');

		//load shaders
		var shaders = new ShaderLoader();

		//surfaces
		shaders.add('surfaceVertex', '/shaders/surfaceVertex.glsl');
		shaders.add('surfaceFragment', '/shaders/surfaceFragment.glsl');

		//start loading
		shaders.load();
		return shaders.promise;

	}().then(function(){

		console.log('shader loaded');

		//load js files
		return Meteor.loadScripts([

			'/elements/buildings.js',
			'/elements/surfaces.js'

		]);

	}).then(function(){

		console.log('scripts loaded');

		//init 3D
		DDD.init( [51.91144966468436,4.478473663330078] , 22);

		//add camera's
		DDD.scene.camera.add(9, [51.900496, 4.505809], [51.926122, 4.475253], 2500); //Overview top
	    DDD.scene.camera.add(0, [51.900496, 4.505809], [51.926122, 4.475253], 500); //Overview

		//switch to first
	    DDD.scene.camera.switchTo(9);
	    DDD.scene.camera.switchTo(0);

		// load data
		return loadData('rotterdam');

	}).then(function(data){

		console.log('data loaded');

		var buildingSettings = {
			colors: [0xe8e8e8],
			scaleMin: 0,
			scaleMax: 1,
			input: function(d, scaleMin){ return 0; }
		};

		var buildings = new Buildings(DDD.scene, buildingSettings);
		buildings.source(data.buildings);
		buildings.addTo(DDD.group);

		var surfaces = new Surfaces(DDD.scene);
		surfaces.source('water', data.water);
		surfaces.source('floor', data.region);
		surfaces.addTo(DDD.group);

		//preloader
		DDD.preloader.load([buildings, surfaces]);
		DDD.preloader.start();	

		//timeline
		DDD.timeline.add([ surfaces ]);

		return preloader.promise;

	}).then(function(){

		//done
		console.log('done :-)');

	});

}