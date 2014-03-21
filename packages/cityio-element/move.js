var fs = Npm.require('fs');
var path = Npm.require('path');

IO.addElement = function(name, packageName, file){

	var exports = path.dirname(process.mainModule.filename);

	// fs
	// 	.createReadStream(exports + '/programs/client/packages/'+packageName+'/'+file+'.js')
	// 	.pipe(fs.createWriteStream(exports + '/programs/client/app/element-'+name+'.js'));

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

//todo
IO.addShader = function(){};
