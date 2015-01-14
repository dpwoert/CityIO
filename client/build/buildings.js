var THREE = require('three');

module.exports = function(world){

	var mesh;

	//set variables
	var options = this.options;
	var data = this.data;
	var colors = options.colors || [0xffffff];
	var groups = [];

	//group detection
	var baseGroupDetect = function(groups, input){
		return groups[0];
	};

	//base or custom?
	var groupDetect = options.groups || baseGroupDetect;

	//base
	var base = options.material || new THREE.MeshLambertMaterial({
    	color: 0xffffff,
    	shading: THREE.FlatShading
	});

	//groups
	for( var i = 0 ; i < colors.length ; i++ ){

		var material;

		if(!options.createMaterial){

			//create material for group
			material = base.clone();
			material.color = new THREE.Color(colors[i]);

		} else {
			material = options.createMaterial(colors[i], i);
		}

		//create geometry for group
		var geometry = new THREE.Geometry();

		groups.push({
			'nr': i,
			'material': material,
			'geometry': geometry
		});

	}

	//finalise
	var finalise = function(){

		groups.forEach(function(group){

			var buffer = new THREE.BufferGeometry();
			// buffer.fromGeometry(group.geometry);
			// geometry.dispose();

			//create mesh
			// group.mesh = new THREE.Mesh( buffer, group.material );
			group.mesh = new THREE.Mesh( group.geometry, group.material );
			world.group.add( group.mesh );

		});

	};

	//create building
	var createBuilding = function(pos, properties){

		try{

			var group = groupDetect(groups, properties);
			var height = options.height(properties, group);
			// height = IO.tools.parseHeight(height);

			//prevent
			if(isNaN(height)) height = 1;

			//create shape
			var shape = new THREE.Shape(pos);
			var extrusionSettings = {
				amount: height,
				//bevelSize: 15,
				bevelEnabled: false,
				//steps: 0,
				bevelThickness: 0,
				steps: 1
			};

			//extrude & make mesh
			var geometry = new THREE.ExtrudeGeometry( shape, extrusionSettings );
			group.geometry.merge( geometry );
			geometry.dispose();

		} catch(e){
			console.warn(e);
		}

	};

	//add all buildings from list
	var buildings = data.get();
	for( var i = 0 ; i < buildings.length ; i++ ){

		this.render.push(function(){

			createBuilding( this.object.get3D(world.projection), this.object.properties );

			//end?
			if(this.current >= buildings.length - 1){
				finalise();
			}

		}.bind({ object: buildings[i], current: i }));
	}

};
