Meteor.methods({
    saveTile: function(urlProvider, x,y,z){

    	//npm thingies
    	var fs = Npm.require('fs');
    	var http = Npm.require('http');
    	var url = Npm.require('url');

    	//get url
    	urlProvider = urlProvider.replace('{z}', z);
    	urlProvider = urlProvider.replace('{x}', x);
    	urlProvider = urlProvider.replace('{y}', y);
    	var port    = 80,
        url     = url.parse(urlProvider);

        //url options
	    var options = {
	      	host: url.hostname,
	      	port: port,
	      	path: url.pathname
	    };

	    //path to save
	    chroot = Meteor.chroot || 'public';
	    //var path = '../' + chroot + '/depth/' + x + '' + y + '.png';
	    var path = x + '' + y + '.png';
	    path = path.replace(/\.\./g,'').replace(/\/+/g,'').replace(/^\/+/,'').replace(/\/+$/,'');


	   if (fs.existsSync(path)){
	   		return path;
	   }

	    //finished
	    var cb = function(error){
	    	console.log(path);
	    	console.log(error);
	    	return path;
	    };

	    //request
	    http.get(options, function(res) {
	        console.log("load: " + urlProvider);
	        console.log("Got response: " + res.statusCode);
	        res.setEncoding('binary');
	        var imagedata = '';
	        res.on('data', function(chunk){
	        	console.log('got data')
	            imagedata+= chunk; 
	        });
	        res.on('end', function(){
	        	console.log(imagedata);
	            fs.writeFile(path, imagedata, 'binary', cb);
	        });
	    }).on('error', function(e) {
	        console.log("Got error: " + e.message);
	    });
    }
})