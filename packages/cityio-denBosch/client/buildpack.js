IO.buildpacks.denBosch = {
	slug: 'den-bosch'
};

IO.buildpacks.denBosch.action = function(){

	console.log('start loading den bosch');
	
	var loadShaders = function(){

		console.log('load shaders');

		//load shaders
		var shaders = new IO.ShaderLoader();

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
		IO.init( [51.697816,5.303675] , 22);

		console.log('init done');

		//add camera's
		IO.cameraControl.add(9, [51.67285, 5.29323], [51.69203, 5.30217], 2500); //Overview top
	    IO.cameraControl.add(0, [51.67285, 5.29323], [51.69203, 5.30217], 500); //Overview
	    IO.cameraControl.add(1, [51.68877, 5.31707], [51.68873, 5.31170], 80); //Z-Willemsvaart. 
	    IO.cameraControl.add(2, [51.69088, 5.30097], [51.69402, 5.29868], 220); //Brugplein
	    IO.cameraControl.add(3, [51.72748, 5.30275], [51.72380, 5.30920], 150); //Maaspoort
	    IO.cameraControl.add(4, [51.67950, 5.29550], [51.68490, 5.29408], 150); //Wilhelminapleim
	    IO.cameraControl.add(5, [51.68105, 5.30482], [51.68515, 5.30353], 250); //Zuidwal

	    console.log('cameras added');

		//switch to first
	    IO.cameraControl.switchTo(9);
	    IO.cameraControl.switchTo(0);

		// load data
		var TEST = IO.loadData('denBosch');
		console.log(TEST);
		return IO.loadData('denBosch');

	}).then(function(data){

		console.log('data loaded');

		var buildingSettings = {
			colors: [0xf9f9f9, 0xe8e8e8, 0xdbdbdb, 0xdfa5a1, 0xe87364],
			scaleMin: 20.806,
			scaleMax: 45.5,
			input: function(d, scaleMin){ return d.fijnstof ? d.fijnstof : scaleMin; }
		};

		var buildings = new IO.elements.Buildings(IO.scene, buildingSettings);
		buildings.source(data.buildings);
		buildings.addTo(IO.group);

		var streets = new IO.elements.Streets(IO.scene);
		streets.source(data.streets);
		streets.addTo(IO.group);

		var surfaces = new IO.elements.Surfaces(IO.scene);
		surfaces.source('water', data.water);
		surfaces.source('floor', data.region);
		surfaces.addTo(IO.group);

		//preloader
		IO.preloader.load([buildings, surfaces, streets]);
		IO.preloader.start();	

		//timeline
		IO.timeline.add([ surfaces, streets ]);

		return IO.preloader.promise;

	}).then(function(){

		//done
		console.log('done :-)');

	});

}