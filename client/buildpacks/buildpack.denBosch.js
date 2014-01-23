window.buildpacks = window.buildpacks || {};

buildpacks.denBosch = function(){

	console.log('start loading den bosch');
	
	var loadShaders = function(){

		console.log('load shaders');

		//load shaders
		var shaders = new ShaderLoader();

		//tubes
		shaders.add('soundTubeVertex', '/shaders/soundTubeVertex.glsl');
		shaders.add('soundTubeFragment', '/shaders/soundTubeFragment.glsl');

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

			'/elements/soundStreets.js',
			'/elements/buildings.js',
			'/elements/surfaces.js'

		]);

	}).then(function(){

		console.log('scripts loaded');

		//init 3D
		DDD.init( [51.697816,5.303675] , 22);

		//add camera's
		DDD.scene.camera.add(9, [51.67285, 5.29323], [51.69203, 5.30217], 2500); //Overview top
	    DDD.scene.camera.add(0, [51.67285, 5.29323], [51.69203, 5.30217], 500); //Overview
	    DDD.scene.camera.add(1, [51.68877, 5.31707], [51.68873, 5.31170], 80); //Z-Willemsvaart. 
	    DDD.scene.camera.add(2, [51.69088, 5.30097], [51.69402, 5.29868], 220); //Brugplein
	    DDD.scene.camera.add(3, [51.72748, 5.30275], [51.72380, 5.30920], 150); //Maaspoort
	    DDD.scene.camera.add(4, [51.67950, 5.29550], [51.68490, 5.29408], 150); //Wilhelminapleim
	    DDD.scene.camera.add(5, [51.68105, 5.30482], [51.68515, 5.30353], 250); //Zuidwal

		//switch to first
	    DDD.scene.camera.switchTo(9);
	    DDD.scene.camera.switchTo(0);

		// load data
		return loadData('denBosch');

	}).then(function(data){

		console.log('data loaded');

		var buildingSettings = {
			colors: [0xf9f9f9, 0xe8e8e8, 0xdbdbdb, 0xdfa5a1, 0xe87364],
			scaleMin: 20.806,
			scaleMax: 45.5,
			input: function(d, scaleMin){ return d.fijnstof ? d.fijnstof.no2 : scaleMin; }
		};

		var buildings = new Buildings(DDD.scene, buildingSettings);
		buildings.source(data.buildings);
		buildings.addTo(DDD.group);

		var streets = new Streets(DDD.scene);
		streets.source(data.streets);
		streets.addTo(DDD.group);

		var surfaces = new Surfaces(DDD.scene);
		surfaces.source('water', data.water);
		surfaces.source('floor', data.region);
		surfaces.addTo(DDD.group);

		//preloader
		DDD.preloader.load([buildings, surfaces, streets]);
		// DDD.preloader.load([buildings, streets]);
		DDD.preloader.start();	

		//timeline
		DDD.timeline.add([ surfaces, streets ]);

		return preloader.promise;

	}).then(function(){

		//done
		console.log('done :-)');

	});

}