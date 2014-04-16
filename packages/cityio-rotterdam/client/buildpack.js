IO.buildpacks.rotterdam = {
	slug: 'rotterdam'
};

IO.buildpacks.rotterdam.action = function(){

	console.log('start loading Rotterdam');

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

			'/elements/buildings.js',
			'/elements/surfaces.js',
			'/elements/soundStreets.js',
			'/elements/boats.js',

		]);

	}).then(function(){

		console.log('scripts loaded');

		//init 3D
		IO.init( [51.91144966468436,4.478473663330078] , 22);

		//add camera's
		IO.cameraControl.add(9, [51.900496, 4.505809], [51.926122, 4.475253], 2500, 'Overview top').hide(); //Overview top
	    IO.cameraControl.add(0, [51.900496, 4.505809], [51.926122, 4.475253], 500, 'Overview'); //Overview
	    IO.cameraControl.add(1, [51.903778, 4.459612], [51.911144, 4.47783], 150, 'Euromast');
	    IO.cameraControl.add(2, [51.905499, 4.494202], [51.911144, 4.47783], 100, 'Kop van Zuid');
	    IO.cameraControl.add(3, [51.919212, 4.490898], [51.919318, 4.479954], 50, 'Blaak');
		IO.cameraControl.updateTemplate();

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

		//determine height of bridges
		var bridgeScale = d3.scale.linear().domain([0, 360]).range([0,40]);
		var streetHeights = function(i, type, data){
			var height = 5;

			if(data.bridge && i > 0 && i != data.points.length-1){

				if(!data.bridgeHeight){
					data.bridgeHeight = bridgeScale(IO.measureDistance(
						data.points[0][0],
						data.points[0][1],
						data.points[data.points.length-1][0],
						data.points[data.points.length-1][1]
					));
				}

				height = data.bridgeHeight;
			}

			return height;
		};

		var streets = new IO.elements.Streets(IO.scene, { height: streetHeights });
		streets.source(data.streets);
		streets.addTo(IO.group);

		var surfaces = new IO.elements.Surfaces(IO.scene);
		surfaces.source('water', data.water);
		surfaces.source('floor', data.region);
		surfaces.source('nature', data.grass);
		surfaces.addTo(IO.group);

		//preloader
		var preloader = new IO.classes.Preloader();
		preloader.load([buildings, surfaces, streets]);
		preloader.start();

		//timeline
		IO.timeline.add([ surfaces ]);
		IO.timeline.live();

		return preloader.promise;

	}).then(function(){

		var boats = new IO.elements.Boats();
		return boats.load();

	}).then(function(){

		//done
		console.log('done :-)');

	}).catch(function(e){

		console.error('error loading rotterdam');
		console.error(e);

	});

}
