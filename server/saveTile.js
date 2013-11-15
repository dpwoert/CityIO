Meteor.methods({
    saveTile: function(urlProvider,x,y,z,point){

    	//npm thingies
    	var fs = Npm.require('fs');
    	var http = Npm.require('http');
    	var url = Npm.require('url');
    	var exec = Npm.require('child_process').exec;
    	// var pngparse = Meteor.require('pngparse');

    	//get url
    	urlProvider = urlProvider.replace('{z}', z);
    	urlProvider = urlProvider.replace('{x}', x);
    	urlProvider = urlProvider.replace('{y}', y);
    	// urlProvider = 'http://ahn.geodan.nl/ahn/viewer3/cgi-bin/tilecache/tilecache.py/1.0.0/iahn2/11/1013/906.png';
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
	    var path = z + '-' + x + '-' + y + '.png';
	    // var path = x + '' + y + '.png';


	    //cache
	   	// if (fs.existsSync(path)){
	   	// 	console.log('already exists');
	   	// 	readfile(path);
	   	// }

	   	//readfile
	   	var readfile = function(path){
	   		fs.readFile(path, function (err, data) {
				if (err) throw err;
		  		// readpng(data);
		  		console.log('file:');
		  		console.log(readpng);
			});
	   	}

		// var file = fs.createWriteStream(path);

		// http.get(options, function(res) {
		//     res.on('data', function(data) {
		//     		console.log(data);
		//             file.write(data);
		//     }).on('end', function() {
	 //            file.end();
	 //            console.log(file);
	 //            console.log(urlProvider + ' downloaded to ' + path);
	 //            readfile(path);
	 //        });
	 //    });

		var curl = "curl '"+urlProvider+"' -H 'Accept-Encoding: gzip,deflate,sdch' -H 'Host: ahn.geodan.nl' -H 'Accept-Language: nl,en;q=0.8,en-US;q=0.6' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.101 Safari/537.36' -H 'Accept: image/webp,*/*;q=0.8' -H 'Referer: http://ahn.geodan.nl/ahn/' -H 'Cookie: __utma=112066962.7361123.1383253682.1383253682.1383253682.1; __utmz=112066962.1383253682.1.1.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided)' -H 'X-CookiesOK: I explicitly accept all cookies' -H 'Connection: keep-alive' --compressed";

		// var done = function(err, headers, response){
		// 	console.log('done:');
		// 	console.log(err);
		// 	console.log(headers);
		// 	console.log(response);
		// 	readpng(response);
		// };

		// var request = Npm.require('request');
		var headers = {
		    "connection": "keep-alive",
		    "Referer": "http://ahn.geodan.nl/ahn/"
		};

		options.headers = headers;


		// var options = {
		// 	url: urlProvider,
		// 	headers: headers
		// }
		// request(options, done).pipe(fs.createWriteStream(path));

		// var http = require('http')
		//   , fs = require('fs')
		//   , options

		var request = http.get(options, function(res){
		    var imagedata = '';
		    res.setEncoding('binary');
		    console.log('get url ' + urlProvider);
		    console.log(res);

		    res.on('data', function(chunk){
		        imagedata += chunk;
		    })

		    res.on('end', function(){

		    	console.log(imagedata);

		    	if(imagedata.indexOf('error')>0){
		    		console.log('error at their host, bitches');
		    	}

		        fs.writeFile(path, imagedata, 'binary', function(err){
		            if (err) throw err;
		            console.log('File saved.');
			        readpng(imagedata);
		        });
		    })

		})

	    var readpng = function(data){
	    	console.log('reading png');

			var PNGReader = Meteor.require('png.js');
		    var reader = new PNGReader(data);
		    reader.parse(function(err,png){
		    	// console.log('data:');
		        console.log(err);

		        console.log('pixel for point ['+point[0]+','+point[1]+']:');
		        console.log( png.getPixel(point[0], point[1]) );

		        for(var x = 0 ; x < 256 ; x++){
		        	for(var y = 0 ; y < 256 ; y++){
		        		//console.log('pixel for point ['+x+','+y+']:');
		        		//console.log( png.getPixel(x, y) );
		        	}	
		        }
		    });

	    };

    }
});

// http://www.maptiler.org/google-maps-coordinates-tile-bounds-projection/

