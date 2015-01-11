module.exports = function(req){

    switch(req){

        case 'build.areas': return {
            file: 'build/areas.js',
            shaders: [],
            type: 'build'
        };

        case 'build.buildings': return {
            file: 'build/buildings.js',
            type: 'build'
        };

        case 'build.roads': return {
            file: 'build/roads.js',
            type: 'build'
        };

        case 'FXlib.tiltShift': return {
            file: 'tools/fx/tilt-shift.js',
            type: 'FXlib'
        };

    }

}
