var Geo = require('./geo.js');

var Feature = function(data){

    var list = [];

    //properties of feature
    this.properties = {};
    this.type = '';

    //data in constructor? (when cloning for example)
    if(data){
        list = data;
    }

    //parse from JSON
    this.parse = function(json){

        if(!json.geometry){
            console.warn('no geometry');
        }

        //save properties
        this.properties = json.properties;
        this.type = json.geometry.type;

        //add al points to list
        json.geometry.coordinates.forEach(function(pos){

            var multi = pos[0] instanceof Array;

            if(!multi){
                var pos = new Geo().fromArray(pos);
                list.push( pos );
            } else {

                var _list = [];

                pos.forEach(function(pos){

                    var pos = new Geo().fromArray(pos);
                    _list.push( pos );

                });

                list.push(_list);
            }

        });

        //chainable
        return this;

    };

    this.each = function(callback){

        if(callback instanceof Function === false){
            console.log('each loop must use a function as parameter');
        }

        for( var i = 0 ; i < list.length ; i++ ){

            var pos = list[i];
            var multi = pos instanceof Array;

            if(!multi){
                callback(pos, i);
            } else {

                for( var j = 0 ; j < pos.length ; j++ ){
                    callback(list[i][j], j);
                }

            }

        }

        //chainable
        return this;

    };

    this.getFlatArray = function(){

        //create list
        var _list = [];

        //add all to new list
        this.each(function(pos){
            debugger
            _list.push(pos);
        });

        //and return
        return _list;
    };

    this.getArray = function(){
        return list;
    };

    this.exportArray = function(){
        var _list = [];

        //get original geometry array back
        list.forEach(function(pos){

            var multi = pos[0] instanceof Array;

            if(!multi){
                _list.push( pos.toArray() );
            } else {

                var sublist = [];

                pos.forEach(function(pos){
                    sublist.push( pos.toArray() );
                });

                _list.push(sublist);
            }

        });

        return _list;

    };

    this.getCenter = function(){

        var _list = this.getFlatArray();
        var x = _list.map(function(a){ return a.lat });
        var y = _list.map(function(a){ return a.lon });
        var minX = Math.min.apply(null, x);
        var maxX = Math.max.apply(null, x);
        var minY = Math.min.apply(null, y);
        var maxY = Math.max.apply(null, y);
        // return [(minX + maxX)/2, (minY + maxY)/2];
        return new Geo((minX + maxX)/2, (minY + maxY)/2);

    };

    this.getClosest = function(compareList){

        var _list = this.getFlatArray();
        var min = -1;
        var closest;

        for( var i = 0 ; i < _list.length ; i++ ){

            //check agains list provided
            for( var j = 0 ; j < compareList.length ; j++ ){

                //get distance
                var distance = _list[i].distanceTo(compareList[j]);

                //is closer?
                if(min < 0 || distance < min){
                    min = distance;
                    closest = compareList[j];
                }

            }

        }

        return closest;

    };

    this.splitPath = function(interval){

        //standard length
        interval = interval || 20;
        var newList = [];

        var split = function(points){

            //prevent loading single points
            if(!points || points.length < 2){
                console.warn('trying to split path of single point');
            }

            var _list = [];
            for (var i = 0; i < points.length-1 ; i++){

                //make line
                start = points[i];
                end = points[i+1];

                //calculate nr of points
                var distance = start.distanceTo(end);
                var parts = Math.ceil(distance/interval);

                //add interpolated points
                var point;
                for(var j=0 ; j < parts ; j++){
                    point = (1 / parts) * j;
                    _list.push(start.lerp(end, point));
                }

                //final point
                _list.push(start.lerp(end, 1));

            }

            return _list;

        };

        //get original geometry array back
        list = split( this.getFlatArray() );

        //chainable
        return this;
    };

    this.get3D = function(projection, height){

        var points = [];
        var _list = this.getFlatArray();
        height = height || 0;

        //convert to 3d
        for( var i = 0 ; i < _list.length ; i++ ){

            //get height per point when an function
            var _height = height;
            if(height instanceof Function){
                _height = height(this.properties, i, _list);
            }

            points.push( _list[i].to3D(projection, _height) );
        }

        //return new points
        return points;
    };

    this.clone = function(){
        var clone = new Feature(list);
        clone.properties = this.properties;
        return clone;
    };

    this.export = function(){
        var json = {};
        json.properties = this.properties;
        json.geometry = {};
        json.geometry.type = this.type;
        json.geometry.coordinates = this.exportArray();
    };

};

module.exports = Feature;
