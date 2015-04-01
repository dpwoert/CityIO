// see for creating OSM query http://overpass-turbo.eu/

var osmtogeojson = require('osmtogeojson');
var request = require('request');
var q = require('q');

var presets = require('./presets.js');

module.exports = function(options){

    var defer = q.defer();

    //presets
    if(options.preset){
        options.query = presets(options.preset);
    }

    //need query
    if(!options.query){
        console.error('no query given for OSM scraper');
    }

    //BBOX?
    if(options.bbox){
        var min = options.bbox[0];
        var max = options.bbox[1];
        var box = min.lon+','+min.lat+','+max.lon+','+max.lat;
        options.query = options.query.replace(new RegExp('{{bbox}}', 'g'), box);
    }

    //get query
    //based on implementation: https://github.com/perliedman/query-overpass/
    request.post(options.overpassUrl || 'http://overpass-api.de/api/interpreter', function (error, response, body) {
        var geojson;

        if (!error && response.statusCode === 200) {
            geojson = osmtogeojson(JSON.parse(body));
            defer.resolve(geojson);
        } else {
            console.error('Error during request to OSM server', error, response)
            defer.reject(error, response);
        }

    }).form({
        data: options.query
    });

    return defer.promise;

};
