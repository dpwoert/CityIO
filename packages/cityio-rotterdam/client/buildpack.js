IO.buildpacks.rotterdam = {
	slug: 'rotterdam'
};

IO.buildpacks.rotterdam.action = function(){

	console.log('start loading Rotterdam');
	
	var loadShaders = function(){

		console.log('load shaders');

		//load shaders
		var shaders = new IO.ShaderLoader();

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
		IO.init( [51.91144966468436,4.478473663330078] , 22);

		//add camera's
		IO.cameraControl.add(9, [51.900496, 4.505809], [51.926122, 4.475253], 2500); //Overview top
	    IO.cameraControl.add(0, [51.900496, 4.505809], [51.926122, 4.475253], 500); //Overview

		//switch to first
	    IO.cameraControl.switchTo(9);
	    IO.cameraControl.switchTo(0);

		// load data
		return IO.loadData('rotterdam');

	}).then(function(data){

		console.log('data loaded');

		var buildingSettings = {
			colors: [0xe8e8e8],
			scaleMin: 0,
			scaleMax: 1,
			input: function(d, scaleMin){ return 0; }
		};

		var buildings = new IO.elements.Buildings(IO.scene, buildingSettings);
		buildings.source(data.buildings);
		buildings.addTo(IO.group);

		var surfaces = new IO.elements.Surfaces(IO.scene);
		surfaces.source('water', data.water);
		surfaces.source('floor', data.region);
		surfaces.addTo(IO.group);

		//preloader
		IO.preloader.load([buildings, surfaces]);
		IO.preloader.start();	

		//timeline
		IO.timeline.add([ surfaces ]);

		return preloader.promise;

	}).then(function(){

		//load boat 3d models
		var deferred = Q.defer();

		loader = new THREE.JSONLoader();

	    loader.load( "/3dmodels/ship.json", function( geometry ) {

	        var mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial({
	        	color: 0xFF0000
	        }) );

	        //rotate
	        IO.group.add(mesh);
	        mesh.scale.set(10,10,10);
	        mesh.rotateX(Math.PI/2);

	        //set initial position as test
	        var points = IO.points.translate2D([ 4.475384, 51.901984 ]); 
	        mesh.position.x = points.x;
	        mesh.position.y = points.y;
			
			deferred.resolve();

			window.boat = mesh;

	    });

		return deferred.promise;

	}).then(function(){

		//done
		console.log('done :-)');

	});

}