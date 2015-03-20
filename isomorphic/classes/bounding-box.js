var Geo = require('./geo.js');

module.exports = function(point1, point2){

    //creat points
    this.ne = point1.clone();
    this.nw = new Geo(point1.lat, point2.lon);
    this.sw = point2.clone();
    this.se = new Geo(point1.lat, point2.lon);

    this.getArray = function(){
        return [point1, point2];
    };

    this.inBox = function(point){
        //todo
    };

    this.getCenter = function(){
        return point1.lerp(point2, 0.5);
    };

    this.getRadius = function(){
        return {
            'center': this.getCenter(),
            'radius': point1.distanceTo(point2)
        };
    };

};
