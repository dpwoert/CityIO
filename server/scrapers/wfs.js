var _ = require('underscore');
var q = require('q');
var querystring = require('querystring');
var http = require('http');

module.exports = function(url, options){

    var defaults = {
        'service': 'WFS',
        'version': '1.0.0',
        'request': 'GetFeature',
        'outputformat': 'json',
        'srsName': 'EPSG:4326',
        // 'startindex': 100,
    }

    var paging = function(){

    };

    var request = function(options){

        //create promise
        var defer = q.defer();

        //mix with defaults
        _.defaults(options, defaults);

        //create final url
        var _url = url + querystring.stringify(options);

        //do request
        http.get(_url, function(res){

            var data = '';

            //received more data
            res.on('data', function(chunk){
                data += chunk;
            });

            //completed
            res.on('end', function(){

                console.log('Got WFS data');

                //convert to JSON
                if(data instanceof Object === false){

                    //catch WFS errors
                    try{
                        data = JSON.parse(data);
                    }
                    catch(e){
                        console.error(e);
                        console.error('Response:', data);
                    }

                }

                defer.resolve(data);

            }).on('error', function(e) {
              console.log("Error: " + e.message);
            });

        });

        return defer.promise;

    }

    //for now without paging
    return request(options);

}
