var init = function(){

    //get element
    var element = document.getElementById('canvas');

    //create projection
    var center = new IO.classes.Geo(5.482683, 51.437763);
    var projection = new IO.classes.Projection(center, 22);

    //create 3d world
    var world = new IO.classes.World(element, projection, ['tiltShift']);
    // var world = new IO.classes.World(element, projection);
    window.world = world;

    //tilt shift
    world.FX.setBlur(5, 0.55, 1.4);

    //get map data
    var buildingsMap = new IO.classes.Map('maps/buildings.topojson','collection');
    var roadsMap = new IO.classes.Map('maps/streets.topojson','collection');
    var areasMap = new IO.classes.Map('maps/areas.topojson','collection');

    //create layers
    var buildings = new IO.classes.Layer3D(world);
    var roads = new IO.classes.Layer3D(world);
    var areas = new IO.classes.Layer3D(world);

    //cycle between day & night
    var cycle = new IO.classes.Cycle(world);
    cycle.addLight(world.hemisphere, 0.8, 0.2);

    //buildings viz
    buildings
    .data(buildingsMap)
    .options({
        colors: ['#f9f9f9', '#e8e8e8', '#dbdbdb', '#dfa5a1', '#e87364'],
        height: function(properties){
            return properties.height;
        }
    })
    .build(IO.build.buildings);

    //roads viz - day
    roads
    .data(roadsMap)
    .options({
        color: '#9395a7',
        maxSegments: 10,
        height: 0.1
    })
    .build(IO.build.roads)

    //areas (grass, water, neighborhoods)
    areas
    .data(areasMap)
    .options({
        colors: ['#DDDDDD', '#81c6f6', '#80c146'],
        night: ['#333333', '#11485f', '#254F0B'],
        groups: function(groups, properties){
            if(properties.tags.natural === "water"){
                return groups[1];
            }
            else if(properties.tags.landuse === "grass"){
            // else if(properties.tags.leasure === "park"){
                return groups[2];
            } else {
                return groups[0];
            }
        }
    })
    .build(IO.build.areas)

    //load & start
    world
    .load([buildings, areas, roads])
    .then(function(){

        world.start();

        var goTo = new IO.classes.Geo(5.49410, 51.43201).setAltitude(200);
        var lookAt = new IO.classes.Geo(5.47496, 50).setAltitude(100);
        var flyPoint = new IO.classes.Geo(5.480644, 51.443066).setAltitude(300);

        //rotate camera
        world.camera
            .gotoGeo(goTo)
            .lookAtGeo(lookAt);

        //start with flying around
        world.camera.flyAround(flyPoint, 700);

    })
    .catch(function(e){
        console.stack(e);
    });

    document.addEventListener('keydown', function(e){

        if(e.keyCode === 13){

            var points = [
                [new IO.classes.Geo(5.46406, 51.43169).setAltitude(800), new IO.classes.Geo(5.48878, 51.44795).setAltitude(100)],
                [new IO.classes.Geo(5.49839, 51.43854).setAltitude(100), new IO.classes.Geo(5.48878, 51.44795).setAltitude(100)],
                [new IO.classes.Geo(5.47161, 51.45651).setAltitude(400), new IO.classes.Geo(5.48517, 51.42784).setAltitude(200)]
            ];

            world.camera.animateTo(points, 20000);

        }

    });

};

//when DOM is ready load CityIO
document.addEventListener("DOMContentLoaded", init);
