//make global
window.Shaders = {};

IO.ShaderLoader = function(){

	//promise
	var deferred = Q.defer();
	this.promise = deferred.promise;
	var promisses = [];
	var data = [];

	this.add = function(name, source){
		var deferred = Q.defer();
		promisses.push(deferred);
		data.push({ 'name': name, 'source': source, 'deferred': deferred });
	};

	this.load = function(){

		_.each(data, function(value){

			//get shaders
			Meteor.http.get(value.source, function(error, result){
				Shaders[value.name] = result.content;
				value.deferred.resolve();
			});

		});

		//all shaders loaded
		Q.all(promisses).then(function(){
			deferred.resolve();
		});

	};

};