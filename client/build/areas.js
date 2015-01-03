var THREE = require('three');

module.exports = function(world){

    //fixed height
    this.options.height = function(){
        return 2;
    }

    //colors

    //cycle [todo]

    console.log('AREA',this);

    //defer to buildings
    return IO.build.buildings.call(this, world);

};
