var IO = require('../../index.js');

module.exports = function(){

    console.log('start fetching data for Den Bosch demo. warning!: can take hours...');

    //grande
    var min = new IO.classes.Geo(5.246658, 51.679408);
    var max = new IO.classes.Geo(5.351028, 51.727281);

    //petit
    // var min = new IO.classes.Geo(5.30000, 51.69000);
    // var max = new IO.classes.Geo(5.31157, 51.69401);

    //map for buildings (panden)
    var buildings = new IO.classes.Map();

    //map for streets
    var streets = new IO.classes.Map();

    //map for areas
    var areas = new IO.classes.Map();

    //scrapers not part of standard cityIO library
    var soundData = require('./build/soundData.js');
    var polutionData = require('./build/polutionData.js');

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

            //remove double values from geoJSON
            // .action(IO.tools.removeDoubles)

            //get polution data from NSL (Nationaal Samenwerkingsverband Luchtkwaliteit)
            .action(polutionData, { file: 'demos/denBosch/assets/data/NSL-2011-denBosch.json' })

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
            .save('demos/denBosch/maps/buildings.topojson');

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
                    railway: true,
                    soundDay: true,
                    soundNight: true
                }
            })

            //split paths to ensure points are at an interval
            .action(IO.tools.splitPath, 20)

            //day value of sound
            .action(soundData)

            //convert to topojson to save bits & bytes
            .action(IO.tools.topoJSON, 'streets')

            //save
            .save('demos/denBosch/maps/streets.topojson');

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
            .save('demos/denBosch/maps/areas.topojson');

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

        console.log('data for Den Bosch demo fetched');

    });

};
