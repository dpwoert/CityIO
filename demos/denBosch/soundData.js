var IO = require('../../index.js');
var q = require('q');
var http = require('http');

module.exports = function(finish, data, options){

    var promises = [];

    //mapping of colors
    var colorMapping = [
        { color: [51,0,51], value: 75},
        { color: [192,49,199], value: 75},
        { color: [255,0,0], value: 65},
        { color: [248,128,23], value: 60},
        { color: [255,240,0], value: 55},

        { color: [94,118,126], value: 70},
        { color: [196,135,147], value: 65},
        { color: [193,27,23], value: 60},
        { color: [229,103,23], value: 55},
        { color: [237,218,116], value: 50},

        { color: [255,255,255], value: 50},
        { color: [253,253,253], value: 50}
    ];

    console.log('start geting sound data for den Bosch');

    var request = function(url, options){

        //create promise
        var defer = q.defer();

        //do request
        http.get(url, function(res){

            res.setEncoding('binary');
            var data = '';

            //received more data
            res.on('data', function(chunk){
                data += chunk;
            });

            //completed
            res.on('end', function(){

                defer.resolve(data);

            }).on('error', function(e) {
              console.log("Error: " + e.message);
            });

        });

        return defer.promise;

    };

    var translate = function(rgb){

        //color mapping
        for( var i = 0 ; i < colorMapping.length ; i++ ){

            if(
                colorMapping[i].color[0] === rgb[0] &&
                colorMapping[i].color[1] === rgb[1] &&
                colorMapping[i].color[2] === rgb[2]
            ){
                return colorMapping[i].value;
            }

        };

        //not found
        return 50;

    };

    //get value for map
    var getValue = function(map, geo1, geo2){

        var defer = q.defer();

        request('http://geoproxy.s-hertogenbosch.nl/pwarcgis1/rest/services/externvrij/Geluidbelasting/MapServer/export?dpi=96&transparent=true&format=png8&bbox='+geo1.lat+','+geo1.lon+','+geo2.lat+','+geo2.lon+'&bboxSR=28992&imageSR=28992&size=943%2C512&layers=show%3A'+map+'%2C2&f=image')
        .then(function(data){

            //read multiple point in image
            var imgReader = new IO.classes.ImageReader();
            imgReader
                .translate(translate)
                .read(data, 'grid')
                .reduce()
                .then(function(value){
                    defer.resolve(value);
                });

        });

        return defer.promise;

    };

    var done = 0;
    var logProcess = function(){
        done++;
        var progress = Math.round((done/promises.length) * 100);
        if(progress % 5 === 0){
            console.log('fetching sound data: ' + progress + '% | ' + done + ' / ' + promises.length);
        }
    };

    //get for all points of all features
    data.features.forEach(function(child){

        //create feature
        var feature = new IO.classes.Feature().parse(child);

        //create filled array for values
        var nr = feature.getArray().length;
        child.properties.day = Array.apply(null, {length: nr}).map(Number.call, Number);
        child.properties.night = Array.apply(null, {length: nr}).map(Number.call, Number);

        //loop through all points
        feature.each(function(pos, index){

            //initial value (lowest is 50)
            child.properties.day.push(50);
            child.properties.night.push(50);

            //get geo pos
            var geo1 = pos.clone().convert(IO.srs.RDC);
            var geo2 = geo1.clone();

            //create bounding box
            geo1.lat -= 10;
            geo1.lon -= 10;
            geo2.lat += 10;
            geo2.lon += 10;

            //round to prevent errors
            geo1.round();
            geo2.round();

            //get values for day & night, these are different for train and cars
            var day, night;
            if(child.properties.highway){
                day = getValue(1, geo1, geo2);
                night = getValue(2, geo1, geo2);
            }
            else{
                day = getValue(4, geo1, geo2);
                night = getValue(5, geo1, geo2);
            }

            //save values
            day.then(function(value){
                child.properties.day[index] = value;
                logProcess();
            });
            night.then(function(value){
                child.properties.night[index] = value;
                logProcess();
            });

            //wait for these values
            promises.push(day, night);

        });

    });

    //finish
    q
        .all(promises)
        .then(function(){
            finish.resolve(data);
        });

};
