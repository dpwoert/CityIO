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

		//load boat 3d models
		var deferred = Q.defer();

		loader = new THREE.JSONLoader();

	    loader.load( "/models/ship.js", function( geometry ) {

	        var mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial({
	        	color: 0xFF0000
	        }) );

	        //rotate
	        DDD.group.add(mesh);
	        mesh.scale.set(10,10,10);
	        mesh.rotateX(Math.PI/2);

	        //set initial position as test
	        var points = DDD.scene.points.translate2D([ 4.475384, 51.901984 ]); 
	        mesh.position.x = points.x;
	        mesh.position.y = points.y;
			
			deferred.resolve();

			DDD.boat = mesh;

	    });

		return deferred.promise;

	}).then(function(){

		//done
		console.log('done :-)');

	});

}