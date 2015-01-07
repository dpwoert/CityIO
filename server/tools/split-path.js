var Feature = require('../../isomorphic/classes/feature.js');

module.exports = function(finish, data, options){

    console.log('start with splitting paths');

    data.features.forEach(function(child){

        //length of splitted parts
        options = options || 20;

        //get center
        var feature = new Feature().parse(child)
        feature.splitPath(options);
        child = feature.export();

    });

    //done
    finish.resolve(data);

};
