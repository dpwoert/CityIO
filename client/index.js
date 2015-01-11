//read all folders
module.exports = {

    'classes': {

        //isomorphic (shared)
        'Geo': require('../isomorphic/classes/geo.js'),
        'Feature': require('../isomorphic/classes/geo.js'),
        'Collection': require('../isomorphic/classes/collection.js'),

        //client only
        'World': require('./classes/world.js'),
        'RenderManager': require('./classes/render-manager.js'),
        'Projection': require('./classes/projection.js'),
        'BoundingBox': require('./classes/boundingbox.js'),
        'Map': require('./classes/map2.js'),
        'Loader': require('./classes/loader.js'),
        'Layer3D': require('./classes/layer3d.js'),
        'FX': require('./classes/fx.js'),
        'GeoCamera': require('./classes/geo-camera.js'),
        'Animation': require('./classes/animation.js'),
        'Mouse': require('./classes/mouse.js'),
        'Compass': require('./classes/compass.js')

    },

    'tools': {

        'actionExtend': require('./tools/action-extend.js'),
        'createThree': require('./tools/create-three.js'),
        'destroyGroup': require('./tools/destroy-group.js'),
        'lerp3': require('./tools/lerp-3d.js'),
        'mergeMaps': require('./tools/merge-maps.js'),
        'parseHeight': require('./tools/parse-height.js'),

    },

    'build': {

        'roads': require('./build/roads.js'),
        'buildings': require('./build/buildings.js'),
        'areas': require('./build/areas.js')

    },

    'FXlib': {

        'copyShader': require('./tools/fx/copy-shader.js'),
        'filmGrain': require('./tools/fx/film-grain.js'),
        'FXAA': require('./tools/fx/fxaa.js'),
        'tiltShift': require('./tools/fx/tilt-shift.js')

    },

    shaders: {}

};
