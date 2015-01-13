var init = function(){

    //get element
    var element = document.getElementById('canvas');

    //create projection
    var projection = new IO.classes.Projection([5.246658, 51.679408], 22);

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
    console.log(IO.classes.Cycle);
    var cycle = new IO.classes.Cycle(world);

    //buildings viz
    buildings
        .data(buildingsMap)
        .options({
            colors: ['#f9f9f9', '#e8e8e8', '#dbdbdb', '#dfa5a1', '#e87364'],
            height: function(properties){
                return properties.height;
            },
            groups: function(groups, properties){
                if(properties.no2 < 35){
                    return groups[0];
                }
                else if(properties.no2 > 35 && properties.no2 < 38.5){
                    return groups[1];
                }
                else if(properties.no2 > 38.5 && properties.no2 < 40.5){
                    return groups[2];
                }
                else if(properties.no2 > 40.5 && properties.no2 < 42.5){
                    return groups[3];
                }
                else if(properties.no2 > 42.5){
                    return groups[4];
                }
                else {
                    return groups[0];
                }
            }
        })
        .build(IO.build.buildings);

    //roads viz - day
    roads
        .data(roadsMap)
        .options({
            color: '#ff0000',
            height: function(properties, index){
                return Math.pow( (properties.day[index] - 50), 1.3);
            }
        })
        .build(IO.build.soundRoads);

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
                // else if(properties.tags.landuse === "grass"){
                else if(properties.tags.leasure === "park"){
                    return groups[2];
                } else {
                    return groups[0];
                }
            }
        })
        .build(IO.build.areas)

    //load & start
    world
        // .load([areas])
        .load([buildings, areas, roads])
        .then(function(){

            world.start();

            //rotate camera
        	world.camera
        		.gotoGeo(5.246658, 51.679408, 300)
        		.lookAtGeo(5.246658, 51.89408, 100);

        	//start with flying around
        	world.camera.flyAround({
                lat: 5.30299,
                lon: 51.68965
        	}, 250, 100);

        })
        .catch(function(e){
            console.stack(e);
        });


};

//when DOM is ready load CityIO
document.addEventListener("DOMContentLoaded", init);
