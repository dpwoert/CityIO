module.exports = function(req){

    switch(req){

        case 'classes.Cycle': return 'classes/cycle.js';
        case 'classes.CameraPath': return 'classes/camera-path.js';
        case 'build.areas': return 'build/areas.js';
        case 'build.buildings': return 'build/buildings.js';
        case 'build.roads': return 'build/roads.js';
        case 'FXlib.tiltShift': return 'tools/fx/tilt-shift.js';

    }

    //nothing found
    console.error('module for buildscript not found');

}
