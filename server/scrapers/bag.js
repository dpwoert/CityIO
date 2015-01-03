var WFS = require('./WFS.js');
var srs = require('../../isomorphic/tools/srs.js');

var proj4 = require('proj4');

module.exports = function(options){

    var options = options || {};

    //defaults
    options.count = options.count || 30000;
    options.type = options.type || 'pand';

    //convert to RDC for bounding box
    rdc1 = options.min.clone().convert(srs.RDC);
    rdc2 = options.max.clone().convert(srs.RDC);

    return WFS('http://geodata.nationaalgeoregister.nl/bag/wfs?',
    {
        'count': options.count,
        'typename': 'bag:' + options.type,
        'bbox': rdc1.lat + ',' + rdc1.lon + ',' + rdc2.lat + ',' + rdc2.lon
    });

};
