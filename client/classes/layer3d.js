var q = require('q');

module.exports = function(world){

	//defer object for use within promises
	var self = this;

	var map, data, z, bbox;
	var options = {};
	var actions = [];
	var render = [];
	var loaded = q.defer();
	this.needsRendering = false;

	this.data = function(mapData, _z){

		//save data
		map = mapData;
		z = _z;

		//chainable
		return this;

	};

	//set options
	this.options = function(_options){

		//save
		options = _options;

		//chainable
		return this;
	};

	//load data
	this.fetch = function(){

		var _load = map.load();

		//promise for layer
		_load.then(function(){
			loaded.resolve();
		});

		//promise for loader
		return _load;

	};

	//build mesh with correct buildscript
	this.build = function(build, customZ){

		loaded.promise.done(function(){

			var _z = customZ || z;

			//convert data to 3D when not already converted
			if(!data){

				console.log('converting');

				// //when an array load multiple maps
				// if(map instanceof Array){
				//
				// 	data = [];
				//
				// 	//merge multiple road maps into one
				// 	for( var i = 0 ; i < mapData.length ; i++ ){
				//
				// 		data = _data.concat( map[i].getData() );
				//
				// 	}
				//
				// 	//get bounding box of first map
				// 	//bbox = mapData[0].getBoundingBox();
				//
				// } else {
				//
				// 	//single map
				// 	data = map.convert3D(world.projection, _z);
				// 	// bbox = mapData.getBoundingBox();
				//
				// }

				data = map.getData();

			}

			var meta = {
				'data': data,
				'render': render,
				'boundingbox': bbox,
				'options': options,
				'z': _z
			};

			//start build script
			var action = build.call(meta, world);

			//add actions
			actions = IO.tools.actionExtend(actions, action);

			//needs rendering?
			if(render.length > 0){
				self.needsRendering = render.length;
			} else {
				self.needsRendering = false;
			}

		})

		//chainable
		return this;

	};

	//add abbility to render data in multiple cycles to prevent CPU overloading
	this.render = function(start, end){

		for(var i = start ; i < end ; i++){
			render[i]();
		}

	};

	this.action = function(name, properties){

		var response;

		if(actions[name] instanceof Array){

			response = [];

			for( var i = 0 ; i < actions[name].length ; i++ ){
				response.push( actions[name][i].call(world, properties) );
			}

		} else {
			response = actions[name].call(world, properties);
		}

		//make it possible to call back
		return response;

	};

	this.destroy = function(){
		data = undefined;
		options = undefined;
		z = undefined;
		bbox = undefined;
		actions = undefined;
	};

};
