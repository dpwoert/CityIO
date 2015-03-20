//install depencensies
// curl https://raw.githubusercontent.com/LearnBoost/node-canvas/master/install | sh
// see also: https://github.com/Homebrew/homebrew/issues/14123

var IO = require('../../../index.js');

var fs = require('fs');
var q = require('q');
var Canvas = require('canvas');

module.exports = function(finish, data, options){

    var promises = [];
    var map = new IO.classes.Collection();
    map.parse(data);

    console.log('node canvas starting');

    //defaults
    options.width = options.width || 1024;
    options.height = options.height || 1024;
    options.zoom = options.zoom || 22;
    options.delta = options.delta || 60 //seconds
    options.filename = options.filename || 'canvas';
    options.clearData = options.clearData || true;
    options.color = options.color || '#ff0000';
    options.opacity = options.opacity || 0.2;
    options.radius = options.radius || 10;

    //get data between two dates
    var filterTime = function(from, to){

        var filtered = [];

        //loop through all data
        map.each(function(feature){
            //TODO check for data
            filtered.push(feature);
        });

        return filtered;

    };

    //interpolate color scale with a scale
    var interpolateColor = function(scale, progress){
        //todo
    };

    //create and save image with node canvas
    var createImage = function(data, filename, projection){

        var defer = q.defer();

        //create canvas
        var canvas = new Canvas(options.width,options.height);
        var ctx = canvas.getContext('2d');
        ctx.patternQuality = 'best';

        //add points
        for( var i = 0 ; i < data.length ; i++ ){

            //get position
            var pos = projection.translate( data[i].getCenter() );
            var x = pos[0];
            var y = pos[1];

            //clear circle
            ctx.beginPath();
            ctx.arc( x, y, options.radius, 0, 2*Math.PI );

            //fill it
            var c = options.color;
            ctx.fillStyle = 'rgba(' + c[0] + ','+ c[1] + ','+ c[2] + ','+options.opacity+')';
            ctx.fill();

        }

        //save
        var buffer = canvas.toBuffer();
        fs.writeFileSync(filename + '.png', buffer);
        // fs.writeFile(filename + '.png', buffer, function(err){
        //
        //     console.log('saved image:', filename);
        //     defer.resolve();
        //
        // });

        defer.resolve();

        return defer;

    };

    //create video with FFPMPEG
    var createVideo = function(){

        //https://github.com/fluent-ffmpeg/node-fluent-ffmpeg
        //todo

    };

    //create projection
    var center = options.boundingBox.getCenter();
    var projection = new IO.classes.Projection(options.boundingBox.nw, options.zoom);

    //trigger image saving
    var delta = options.delta * 1000 * 60 * 60 * 60;
    var totalTime = +options.to - +options.from;
    for( var i = +options.to ; i += delta ; i <  +options.to ){

        //get data
        var _data = filterTime(i, i+delta);

        //create and save image
        promises.push( createImage(_data, options.filename + i, projection) );

    }

    //when all images are created, create movie
    q.all(promises).then(function(){

        createVideo();
        finish.resolve(data);

    }).catch(function(e){
        console.log(e);
    });

};
