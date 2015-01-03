// see for creating OSM query http://overpass-turbo.eu/

var overpass = require('query-overpass');
var q = require('q');

module.exports = function(options){

    if(!options || !options.query){
        console.error('no query given for OSM scraper');
    }

    var defer = q.defer();

    //BBOX?
    if(options.bbox){
        var min = options.bbox[0];
        var max = options.bbox[1];
        var box = min.lon+','+min.lat+','+max.lon+','+max.lat;
        options.query = options.query.replace(new RegExp('{{bbox}}', 'g'), box);
    }

    //get query
    overpass(options.query, function(error, data){

        //check for errors
        if(error){
            console.error('error with OSM request:', error);
        }

        //done
        console.log('got OSM data');
        defer.resolve(data);

    });

    return defer.promise;

};
