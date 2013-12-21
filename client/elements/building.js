window.Buildings = function(scene){

	//colors for buildings
	this.colors = [ 0xf9f9f9, 0xe8e8e8, 0xdbdbdb, 0xdfa5a1, 0xe87364];
	this.groups = [];

	//scale
	scaleMin = 20.806;
	scaleMax = 45.5;

	this.init = function(){

		//nro steps
		this.steps = this.colors.length;

		//scale
		this.scale = d3.scale.linear()
			.domain([scaleMin, scaleMax])
			.range([0,this.steps-1]);

		//loop
		for(var i = 0; i < this.steps; i++){

			var group = this.groups[i] = {};

			group.material = new THREE.MeshLambertMaterial({
		    	color: this.colors[i],
		    	shading: THREE.FlatShading,
	    	}); 


			group.geometry = new THREE.Geometry();
			group.mesh = new THREE.Mesh(group.geometry, group.material);

		}

	}.call(this);

	this.add = function(data){

		var building = data.geom.coordinates[0];

		//group on pollution
		var no2 = data.fijnstof ? data.fijnstof.no2 : scaleMin;
		var groupKey = Math.round(this.scale(no2));

		//generate points in 2d space
		var points = [];
		for(var i = 0 ; i < building.length ; i++){
			points.push( scene.points.translate2D([ building[i][0],building[i][1] ]) );
		}

		var shape = new THREE.Shape(points);

		//get height
		var height;
		if(data.height) { height = data.height; }
		else { height = data.calculated }
		height *= scene.points.pixelScale; //TODO

		if(isNaN(height)) height = 1;

		//settings
		var extrusionSettings = {
			amount: height,
			//bevelSize: 15,
			bevelEnabled: false,
			//steps: 0,
			bevelThickness: 0,
			steps: 1
		};

		if(!data.url){

			//extrude & make mesh
			var geometry = new THREE.ExtrudeGeometry( shape, extrusionSettings );
			THREE.GeometryUtils.merge(this.groups[groupKey].geometry,geometry);	

		} else {
			this.addModel(data.url,this.groups[groupKey].geometry);
		}


	};

	//load a custom 3d model
	this.addModel = function(url, merge){

		//load and merge
		var loader = new THREE.JSONLoader();
		loader.load( 'models/' + url , function( geometry ) {

			THREE.GeometryUtils.merge(merge,geometry);				

		} );

	}

	//use a source
	this.source = function(source){

		this.data = source;

	};

	this.startLoading = function(){
		
		//load all
		var item;
		for( var i = 0 ; i < this.data.length ; i ++ ){
			item = this.data[i];
			this.add(item);
			scene.preloader.step();
		}

	}

	//add to the 3d world
	this.addTo = function(obj3d){

		_.each(this.groups, function(group){

           	obj3d.add(group.mesh);

        });

	};
	
};