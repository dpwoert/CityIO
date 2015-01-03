var topojson = require('topojson');

module.exports = function(finish, data, options){

    console.log('converting geojson to topojson');
    console.warn('\033[31mgeojson actions will not be possible after this action \033[0m');

    //only pass a key as a string
    if(options instanceof String){
        options = { key: options };
    }

    //defaults
    options.quantization = options.quantization || 30000;
    options.key = options.key || 'cityio';
    options.key = function(){ return options.key; };

    //keep all geojson properties
    var transform = function(feature) {
        return feature.properties;
    };

    //convert
    var converted = topojson.topology({collection: data}, {
        // 'quantization': options.quantization,
        // 'id': options.key,
        'property-transform': transform
    });

    //resolve
    finish.resolve(converted);

};
