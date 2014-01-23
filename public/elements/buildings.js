window.Buildings = function(scene, settings){

	//colors for buildings
	this.colors = settings.colors;
	this.groups = [];

	//scale
	this.scaleMin = settings.scaleMin;
	this.scaleMax = settings.scaleMax;

	var pointer = 0;

	this.init = function(){

		//nro steps
		this.steps = this.colors.length;

		//scale
		this.scale = d3.scale.linear()
			.domain([this.scaleMin, this.scaleMax])
			.range([0,this.steps-1])
			.clamp(true);

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
		// var no2 = data.fijnstof ? data.fijnstof.no2 : this.scaleMin;
		var no2 = settings.input(data, this.scaleMin);
		var groupKey = Math.round(this.scale(no2));

		//generate points in 2d space
		var points = [];
		for(var i = 0 ; i < building.length ; i++){
			points.push( scene.points.translate2D([ building[i][0],building[i][1] ]) );
		}

		var shape = new THREE.Shape(points);

		//get height
		var height = 0;
		if(data.height) { height = data.height; }
		else { height = data.calculated }
		// height -= data.floor;
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

		if(!data.url && !data.hide){

			//extrude & make mesh
			var geometry = new THREE.ExtrudeGeometry( shape, extrusionSettings );
			THREE.GeometryUtils.merge(this.groups[groupKey].geometry,geometry);	
			geometry.dispose();

		} 
		else if (data.url){
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

	this.loadNext = function(){

		//add
		this.add(this.data[pointer]);

		//delete
		this.data[pointer] = null;
		pointer++;

	}

	//add to the 3d world
	this.addTo = function(obj3d){

		this.parent = obj3d;

	};

	this.finished = function(){
	
		for( var i = 0 ; i < this.groups.length ; i++ ){
			
           	this.parent.add(this.groups[i].mesh);

		}

	}
	
};