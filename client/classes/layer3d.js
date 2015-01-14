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

		//save or merge
		options = IO.tools.extend(options, _options, true);

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
	this.build = function(build, _options){

		loaded.promise.done(function(){

			//convert data to 3D when not already converted
			if(!data){

				data = map.getData();

			}

			//merge options with global options
			_options = IO.tools.extend(options, _options, true);

			var meta = {
				'data': data,
				'render': render,
				'boundingbox': bbox,
				'options': _options,
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

	this.clearCache = function(){
		data.destroy();
		map.destroy();
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
