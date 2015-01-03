var THREE = require('three');

module.exports = function(world){

	var mesh;

	//set variables
	var options = this.options;
	var data = this.data;
	var z = this.z;

	//defaults
	options.color = options.color || '#FFFFFF';
	options.color = new THREE.Color(options.color);
	options.width = options.width || 1.5;
	options.maxSegments = options.maxSegments || 50;
	//options.segments = options.segments || 5;
	options.radiusSegments = options.radiusSegments || 3;
	options.quality = options.quality || 1;
	options.opacity = options.opacity || 1;

	//create geometry
	var geometry = new THREE.Geometry();
	
	//add to scene when done
	var finalise = function(){

		//create material settings
		var materialSettings = {};
		materialSettings.color = options.color;

		//transparency?
		if(options.opacity < 1){
			materialSettings.opacity = options.opacity;
			materialSettings.transparent = true;
		}

		var buffer = new THREE.BufferGeometry();
		buffer.fromGeometry(geometry);
		geometry.dispose();

		//create mesh
		var material = new THREE.MeshLambertMaterial(materialSettings);
		mesh = new THREE.Mesh( buffer, material );
		// mesh.position.z = IO.tools.parseHeight(z);

		//add to scene
		world.group.add(mesh);

	}.bind(this);

	//add paths to 3d object
	var createTube = function(data){

		//create tubes
		var path3D = new THREE.SplineCurve3(data);
		var segments = data.length < options.maxSegments ? data.length : options.maxSegments;
		segments = Math.ceil(options.quality * segments);
		var tube = new THREE.TubeGeometry(path3D, segments, options.width, options.radiusSegments, false);

		geometry.merge(tube);
		tube.dispose();
		path3D = null;

	};

	//add all roads
	var roads = data.get();
	for( var i = 0 ; i < roads.length ; i++ ){

		this.render.push(function(){

			createTube( this.object.get3D(world.projection) );

			//end?
			if(this.current >= roads.length - 1){
				finalise();
			}

		}.bind({ object: roads[i], current: i }));
	}

	//actions - todo
	// return {};

};