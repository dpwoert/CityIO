var Geo = require('./geo.js');

module.exports = function(){

    var list = [];

    //properties of feature
    this.properties = {};

    //parse from JSON
    this.parse = function(json){

        if(!json.geometry){
            console.warn('no geometry');
        }

        //save properties
        this.properties = json.properties;

        //add al points to list
        json.geometry.coordinates.forEach(function(pos){

            var multi = pos[0] instanceof Array;

            if(!multi){
                var pos = new Geo().fromArray(pos);
                list.push( pos );
            } else {

                pos.forEach(function(pos){

                    var pos = new Geo().fromArray(pos);
                    list.push( pos );

                });
            }

        });

        //chainable
        return this;

    };

    this.getCenter = function(){

        var x = list.map(function(a){ return a.lat });
        var y = list.map(function(a){ return a.lon });
        var minX = Math.min.apply(null, x);
        var maxX = Math.max.apply(null, x);
        var minY = Math.min.apply(null, y);
        var maxY = Math.max.apply(null, y);
        // return [(minX + maxX)/2, (minY + maxY)/2];
        return new Geo((minX + maxX)/2, (minY + maxY)/2);

    };

    this.getClosest = function(compareList){

        var min = -1;
        var closest;

        for( var i = 0 ; i < list.length ; i++ ){

            //check agains list provided
            for( var j = 0 ; j < compareList.length ; j++ ){

                //get distance
                var distance = list[i].distanceTo(compareList[j]);

                //is closer?
                if(min < 0 || distance < min){
                    min = distance;
                    closest = compareList[j];
                }

            }

        }

        return closest;

    };

    this.get3D = function(projection){

        var points = [];

        //convert to 3d
        for( var i = 0 ; i < list.length ; i++ ){
            points.push( list[i].to3D(projection) );
        }

        //return new points
        return points;
    };

    this.clone = function(){
        //todo
    };

}
