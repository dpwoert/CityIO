var Collection = require('../../isomorphic/classes/collection.js');
var Feature = require('../../isomorphic/classes/feature.js');
var earcut = require('earcut');

module.exports = function(feature){

    var triangulate = earcut( feature.exportArray() );
    var collection = new Collection();

    //earcut returns set of arrays, each set of 3 points is a polygon
    for( var i = 0 ; i < triangulate.length ; i += 3 ){

        var _feature = new Feature();
        _feature.createPolygon([ triangulate[i], triangulate[i+1], triangulate[i+2] ]);
        collection.add(_feature);

    }

    return collection;

};
