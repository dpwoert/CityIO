var IO = require('../../index.js');

module.exports = function(){

    console.log('start fetching data for Den Bosch demo');

    var min = new IO.classes.Geo(5.246658, 51.679408);
    var max = new IO.classes.Geo(5.351028, 51.727281);

    //map for buildings (panden)
    var buildings = new IO.classes.Map();

    //map for streets
    var streets = new IO.classes.Map();

    //map for areas
    var areas = new IO.classes.Map();

    //fetch buildings
    var fetch = function(){

        buildings

            //get data from Kadaster (Basis Administratie Gemeentes)
            .scraper(IO.scrapers.BAG, { 'min': min, 'max': max })

            //get height data from AHN (Algemeen Hoogtebestand Nederland)
            //.action(IO.scrapers.AHN)

            //get polution data from NSL (Nationaal Samenwerkingsverband Luchtkwaliteit)
            .action(IO.scrapers.NSL, { file: 'demos/denBosch/data/NSL-2011-denBosch.json' })

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
            //.save('demos/denBosch/maps/buildings.topojson');

        return buildings.end();

    }()

    //fetch streets
    .then(function(){

        streets

            //get data from Open Street Maps
            .scraper(IO.scrapers.OSM, {
                query: '[out:json][timeout:25];('+
                'way["railway"="rail"]({{bbox}});'+
                'node["highway"]({{bbox}});'+
                'way["highway"]({{bbox}});'+
                'relation["highway"]({{bbox}});'+
                ');out body;>;out skel qt;',
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
                query: '[out:json][timeout:25];(' +
                'way["natural"="water"]({{bbox}});' +
                'relation["natural"="water"]({{bbox}});' +
                'node["landuse"="grass"]({{bbox}});' +
                'way["landuse"="grass"]({{bbox}});' +
                'relation["landuse"="grass"]({{bbox}});' +
                'way["admin_level"="11"]({{bbox}});'+
                ');out body;>;out skel qt;',
                bbox: [min, max]
            })

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

        return streets.end();

    })

    //done
    .then(function(){

        console.log('data for Den Bosch demo fetched');

    });

};