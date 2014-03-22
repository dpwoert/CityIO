var fs = Npm.require('fs');
var path = Npm.require('path');
var exports = path.dirname(process.mainModule.filename);

IO.addElement = function(name, packageName, file){


	Router.map(function () {
		this.route('serve-element-' + name, {
	    	where: 'server',
	    	path: '/elements/'+file+'.js',

		    action: function () {
		      	var filename = this.params.filename;
		      	var text = fs.readFileSync(exports + '/programs/client/packages/'+packageName+'/'+file+'.js','utf8')

		    	this.response.writeHead(200, {'Content-Type': 'application/javascript'});
		    	this.response.end(text);
		    }
	  	});
	});
	
};

//add shaders
IO.addShaders = function(packageName, file){

	Router.map(function () {
		this.route('serve-shader-' + file, {
	    	where: 'server',
	    	path: '/shaders/'+file+'.glsl',

		    action: function () {
		      	var filename = this.params.filename;
		      	var text = fs.readFileSync(exports + '/programs/client/packages/'+packageName+'/'+file+'.glsl','utf8')

		    	this.response.writeHead(200, {'Content-Type': 'application/javascript'});
		    	this.response.end(text);
		    }
	  	});
	});
	
};

//add 3d models
IO.add3dModel = function(packageName, file){

	Router.map(function () {
		this.route('serve-3dmodel-' + file, {
	    	where: 'server',
	    	path: '/shaders/'+file+'.json',

		    action: function () {
		      	var filename = this.params.filename;
		      	var text = fs.readFileSync(exports + '/programs/client/packages/'+packageName+'/'+file+'.json','utf8')

		    	this.response.writeHead(200, {'Content-Type': 'application/javascript'});
		    	this.response.end(text);
		    }
	  	});
	});
	
};