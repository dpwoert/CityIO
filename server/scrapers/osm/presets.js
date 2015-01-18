module.exports = function(input){

    function getQuery(preset){

        switch(preset){

            case 'buildings':
                return 'way["building"]({{bbox}});' +
                 'relation["building"]({{bbox}});';

            case 'roads':
                return 'way["highway"]({{bbox}});' +
                'relation["highway"]({{bbox}});';

            case 'rails':
                return 'way["railway"="rail"]({{bbox}});';

            case 'neighbourhoods':
                return 'way["admin_level"="11"]({{bbox}});';

            case 'grass':
                return 'node["landuse"="grass"]({{bbox}});' +
                'way["landuse"="grass"]({{bbox}});' +
                'relation["landuse"="grass"]({{bbox}});';

            case 'water':
                return 'way["natural"="water"]({{bbox}});' +
                'relation["natural"="water"]({{bbox}});';

            default:
                console.error('preset for OSM not found: ' + preset);
                return '';
            break;

        }

    };

    var start = '[out:json][timeout:25];(';
    var end = ');out body;>;out skel qt;';
    var query = '';

    //create query
    if(input instanceof Array){

        input.forEach(function(row){
            query += getQuery(row);
        });

    } else {
        query = getQuery(input);
    }

    return start + query + end;

};
