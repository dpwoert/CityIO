var IO = require('../../../index.js');
var fs = require('fs');

module.exports = function(finish, data, options){

    //list of NSL points
    var list = [];

    //check if file exist
    if(!options || !options.file || !fs.existsSync(options.file)){
        console.error('NSL scraper: source file not found');
    }

    //read file
    var source = fs.readFileSync(options.file);
    source = JSON.parse(source);

    //convert list
    source.forEach(function(feature){

        //convert
        var pos = feature.geomet_wkt.replace('POINT(','').replace(')','');
        pos = pos.split(' ');

        //create Geo point
        var geo = new IO.classes.Geo(pos[0], pos[1], IO.srs.RDC);
        geo.convert('EPSG:4326');

        //add data
        geo.data = feature;

        //add to list
        list.push(geo);

    });

    var checkFeature = function(feature){

        //get center
        var _feature = new IO.classes.Feature().parse(feature);
        var closest = _feature.getClosest(list);

        //save data
        feature.properties.no2 = closest.data.conc_no2;
        feature.properties.pm10 = closest.data.conc_pm10;
        feature.properties.pm25 = closest.data.conc_pm25;

    };

    //get NSL data
    data.features.forEach(checkFeature);

    //done
    console.log('added NSL polution data');
    finish.resolve(data);

};
