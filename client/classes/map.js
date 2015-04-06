var THREE = require('three');
var q = require('q-xhr')(window.XMLHttpRequest, require('q'))
var topojson = require('topojson');

module.exports = function(url, params){

    var rawData, type;
    var isLoaded = false;

    var convertTopo = function(data, key){
        if (data.type && data.type === 'Topology') {
            return topojson.feature(data, data.objects[key]);
        }
    };

    this.load = function(){

        //create promise
        var self = this;
        var defer = q.defer();

        //get file extention
        var splitted = url.split('.');
        var ext = splitted[splitted.length-1];

        //get file name
        splitted = splitted[splitted.length-2].split('/');
        var filename = splitted[splitted.length-1];

        //serve from cache
        if(isLoaded){
            defer.resolve(self);
        }

        else if(ext === 'png' || ext === 'jpg'){

            //get texture
            rawData = THREE.ImageUtils.loadTexture(url);
            type = 'image';

            //resolve (chainable)
            defer.resolve(self);

        }

        //request data from server
        else {

            q.xhr
                .get(url)
                .then(function(data){

                    //convert to JSON
                    data = JSON.parse(data.data);

                    console.log('ext', ext);

                    //get type and possibly convert
                    switch(ext.toLowerCase()){

                        case 'topojson':

                            var key = params || filename;
                            data = convertTopo(data, key);
                            console.log('converted to topo');

                        case 'geojson':
                            type = 'geoJSON';
                        break;

                        default:
                            type = 'json';
                        break;

                    }

                    console.log(type);

                    //save in object
                    rawData = data;

                    //resolve (chainable)
                    defer.resolve(self);

                    //load change
                    isLoaded = true;

                },function(){
                    console.error('error retrieving map data');
                });

            return defer.promise;

        }

        return defer.promise;

    };

    this.data = function(){
        return rawData;
    };

    var getHeight = function(z, feature){

        if(z instanceof Function){
            return z(feature);
        } else {
            return IO.tools.parseHeight(z);
        }

    };

    var loadFeature = function(projection, coordinates, z, polygon){

        var path = [];

        //polygon fix
        if(polygon){
            coordinates = coordinates[0];
        }

        //loop through coordinates
        coordinates.forEach(function(coordinate){

            //check for junk
            if(coordinate[0] !== 0 && coordinate[1] !== 0){

                var point = new Geo(coordinate[0], coordinate[1]).setAltitude(z);
                var v3 = projection.translate3D(point);

                // Push positions
                path.push(v3);

            }

        });

        return path;

    };

    this.getData = function(){

        //determine what to return
        switch(type){

            case 'geoJSON':

                var collection = new IO.classes.Collection();
                collection.parse(rawData);
                return collection;

            break;

            case 'geoGrid':
            case 'image':

                return data;

        }

    };

    this.destroy = function(){
        rawData = undefined;
    };

}
