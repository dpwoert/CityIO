var IO = require('../../index.js');

module.exports = function(){

    console.log('start fetching data for Eindhoven demo.');

    //bbox
    var min = new IO.classes.Geo(5.451107, 51.423698);
    var max = new IO.classes.Geo(5.500889, 51.456440);

    //map for buildings (panden)
    var buildings = new IO.classes.Map();

    //map for streets
    var streets = new IO.classes.Map();

    //map for areas
    var areas = new IO.classes.Map();

    //tools not part of standard cityIO library
    //todo twitter to canvas

    //fetch buildings
    var fetch = function(){

        buildings

        //get data from Kadaster (Basis Administratie Gemeentes)
        // .scraper(IO.scrapers.BAG, { 'min': min, 'max': max })
        .scraper(IO.scrapers.OSM, {
            preset: 'buildings',
            bbox: [min,max]
        })

        //get height data from AHN (Algemeen Hoogtebestand Nederland)
        .action(IO.scrapers.AHN)

        //make whitelist of data to keep
        .action(IO.tools.filter, {
            geometry: true,
            properties: {
                height: true,
                floor: true,
                no2: true,
                pm10: true,
                pm25: true
            }
        })

        //convert to topojson to save bits & bytes
        .action(IO.tools.topoJSON, 'buildings')

        //save
        .save('demos/eindhoven/maps/buildings.topojson');

        return buildings.end();

    }()

    //fetch streets
    .then(function(){

        streets

        //get data from Open Street Maps
        .scraper(IO.scrapers.OSM, {
            preset: ['rails','roads'],
            bbox: [min,max]
        })

        //make whitelist of data to keep
        .action(IO.tools.filter, {
            geometry: true,
            properties: {
                type: true,
                highway: true,
                railway: true
            }
        })

        //convert to topojson to save bits & bytes
        .action(IO.tools.topoJSON, 'streets')

        //save
        .save('demos/eindhoven/maps/streets.topojson');

        return streets.end();

    })

    //fetch areas
    .then(function(){

        areas

        //get data from Open Street Maps
        .scraper(IO.scrapers.OSM, {
            preset: ['grass','water','neighbourhoods'],
            bbox: [min, max]
        })

        //remove double values from geoJSON
        .action(IO.tools.removeDoubles)

        //make whitelist of data to keep
        .action(IO.tools.filter, {
            geometry: true,
            // properties: {
            //     tags: {
            //         landuse: true,
            //         boundary: true
            //     }
            // }
            properties: {
                tags: true
            }
        })

        //convert to topojson to save bits & bytes
        .action(IO.tools.topoJSON, 'areas')

        //save
        .save('demos/eindhoven/maps/areas.topojson');

        return areas.end();

    })

    //build script
    .then(function(){

        //create cityio script file
        var createScript = require('./build/create-script.js');
        createScript();

    })

    //done
    .then(function(){

        console.log('data for Eindhoven demo fetched');

    });

};
