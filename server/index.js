//read all folders
module.exports = {

    'classes': {

        'Map': require('./classes/map.js'),
        'Geo': require('../isomorphic/classes/geo.js'),
        'Feature': require('../isomorphic/classes/feature.js'),
        'BoundingBox': require('../isomorphic/classes/bounding-box.js'),
        'Projection': require('./isomorphic/classes/projection.js'),
        'ImageReader': require('./classes/image-reader.js'),
        'Build': require('./classes/build.js')

    },

    'scrapers': {

        //Open Street Maps
        'OSM': require('./scrapers/osm/osm.js'),
        //Twitter
        'twitter': require('./scrapers/twitter.js'),
        //Web Feature Service
        'WFS': require('./scrapers/wfs.js'),
        //Basis administratie Gemeente from Kadaster (NL)
        'BAG': require('./scrapers/bag.js'),
        //Algemeent Hoogtebestand Nederland (height data for NL)
        'AHN': require('./scrapers/ahn.js')

    },

    'tools': {

        'filter': require('./tools/filter.js'),
        'map': require('./tools/map.js'),
        'removeDoubles': require('./tools/remove-doubles.js'),
        'splitPath': require('./tools/split-path.js'),
        'mergeGeoJSON': require('./tools/merge-geojson.js'),
        'topoJSON': require('./tools/topojson.js')

    },

    'srs': require('../isomorphic/tools/srs.js')

};
