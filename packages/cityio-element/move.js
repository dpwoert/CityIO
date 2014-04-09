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
		      	var text = fs.readFileSync(exports + '/programs/client/packages/'+packageName+'/shaders/'+file+'.glsl','utf8')

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
	    	path: '/3dmodels/'+file+'.json',

		    action: function () {
		      	var filename = this.params.filename;
		      	var text = fs.readFileSync(exports + '/programs/client/packages/'+packageName+'/3dmodels/'+file+'.json','utf8')

		    	this.response.writeHead(200, {'Content-Type': 'application/javascript'});
		    	this.response.end(text);
		    }
	  	});
	});

};

//add webworkers
IO.add = function(type, packageName, file){

	var slug, extension;
	switch(type){

		case 'element':
			slug = 'elements';
			extension = 'js';
		break;

		case 'webworker':
			slug = 'webworker';
			extension = 'js';
		break;

		case '3dmodel':
			slug = '3dmodel';
			extension = 'json';
		break;

		case 'shader':
			slug = 'shader';
			extension = 'glsl';
		break;

	}

	var filePart = file.split('/');
	filePart = filePart[filePart.length - 1];

	Router.map(function () {

		this.route('serve-'+type+'-'+filePart, {
			where: 'server',
			path: '/'+slug+'/'+filePart+'.'+extension,

		    action: function () {

		    	var filename = this.params.filename;
		    	var text = fs.readFileSync(exports + '/programs/client/packages/'+packageName+'/'+file+'.'+extension,'utf8');

		    	this.response.writeHead(200, {'Content-Type': 'application/javascript'});
		    	this.response.end(text);
		    }
		});

	});

};
