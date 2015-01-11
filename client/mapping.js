module.exports = function(req){

    switch(req){

        case 'build.areas': return 'build/areas.js';
        case 'build.buildings': return 'build/buildings.js';
        case 'build.roads': return 'build/roads.js';
        case 'FXlib.tiltShift': return 'tools/fx/tilt-shift.js';

    }

}
