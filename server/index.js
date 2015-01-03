//read all folders
module.exports = {

    'classes': {

        'Map': require('./classes/map.js'),
        'Geo': require('../isomorphic/classes/geo.js'),
        'Feature': require('../isomorphic/classes/feature.js')

    },

    'scrapers': {

        'OSM': require('./scrapers/osm.js'),
        'WFS': require('./scrapers/wfs.js'),
        'BAG': require('./scrapers/bag.js'),
        'AHN': require('./scrapers/ahn.js'),
        'NSL': require('./scrapers/nsl.js')

    },

    'tools': {

        'filter': require('./tools/filter.js'),
        'mergeGeoJSON': require('./tools/merge-geojson.js'),
        'topoJSON': require('./tools/topojson.js')

    },

    'srs': require('../isomorphic/tools/srs.js')

};