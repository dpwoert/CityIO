var IO = require('../../../index.js');

module.exports = function(){

    var build = new IO.classes.Build();
    build
    .add('classes.Cycle')
    .add('build.buildings')
    .add('build.areas')
    .add('build.roads')
    .add('FXlib.tiltShift')
    .export('demos/eindhoven/cityio.js')
    .then(function(){
        console.log('done');
    });

}
