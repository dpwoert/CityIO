var Collection = require('../../isomorphic/classes/collection.js');
var Feature = require('../../isomorphic/classes/feature.js');
var Geo = require('../../isomorphic/classes/geo.js');

var request = require('request');
var querystring = require('querystring');
var q = require('q');

module.exports = function(options){

    //get credentials overhere:
    // https://apps.twitter.com/
    // https://dev.twitter.com/rest/reference/get/search/tweets

    var defer = q.defer();

    //max request
    var maxRequest = options.maxRequest || 100;
    var nrRequest = 0;
    delete options.maxRequest;

    //check if oauth is given to prevent errors
    if(!options.oauth){
        throw new Error('oauth not provided, this is needed to connect to API. See: https://apps.twitter.com/');
    }

    //oauth key
    var oauth = options.oauth;
    delete options.oauth;

    //defaults
    options.count = options.count || 100;

    //geocode?
    if(options.geocode){

        //get center and radius
        var geo = options.geocode.getRadius();
        options.geocode = geo.center.lat + ',' + geo.center.lon + ',' + geo.radius / 1000 + 'km';

    }

    //create url
    var urlPart = querystring.stringify(options);
    var API = 'https://api.twitter.com/1.1/search/tweets.json';

    //create collection for geojson
    var collection = new Collection();

    //do request
    var get = function(url){

        //do request
        request.get({ url: url, oauth:oauth, json:true }, function (err, r, data) {

            //error?
            if(err || data.errors){


                //wait due to rate limit?
                if(parseInt(r.headers['x-rate-limit-remaining']) === 0){

                    //wait 15 minutes
                    console.log('15 minute timeout');
                    setTimeout(function(){
                        get(url);
                    }, 15 * 1000 * 60);

                } else {

                    console.log('twitter data could not be scraped');
                    console.error(err, data.errors)

                }

            } else {

                //only count succesfull request
                nrRequest++;

                //create geojson data from request
                data.statuses.forEach(function(status){

                    //only add when coordinates are provided
                    if(status.coordinates){

                        //create feature and add to collection
                        var point = new Geo().fromArray(status.coordinates.coordinates);
                        var feature = new Feature();
                        feature.createPoint(point, status);
                        collection.add(feature);

                    }


                });

                console.log('request ' + nrRequest + ' of ' + maxRequest + ' made');

                //next request?
                if(data.search_metadata.next_results && nrRequest < maxRequest ){

                    get(API + data.search_metadata.next_results);


                } else {

                    //finished
                    console.log('twitter data scraped with ' + collection.count() + ' tweets');
                    defer.resolve(collection.toJSON());

                }

            }

        });

    };

    //initial request
    get(API + '?' + urlPart);

    //return promise to chain actions
    return defer.promise;

};
