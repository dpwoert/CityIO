var Geo = require('./geo.js');

module.exports = function(point1, point2){

    point1 = new Geo() || point1;
    point2 = new Geo() || point2;

    //creat points
    this.ne = point1.clone();
    this.nw = new Geo(point1.lat, point2.lon);
    this.sw = point2.clone();
    this.se = new Geo(point1.lat, point2.lon);

    this.getArray = function(){
        return [point1, point2];
    };

    this.inBox = function(point){
        return
            point.lat > this.ne.lat && point.lat < this.nw.lat &&
            point.lon > this.sw.lon && point.lon < this.nw.lon;
    };

    this.getCenter = function(){
        return this.ne.interpolate(this.sw, 0.5);
    };

    this.getRadius = function(){
        return {
            'center': this.getCenter(),
            'radius': point1.distanceTo(point2)
        };
    };

    this.fromRadius = function(point, radius){

        // http://williams.best.vwh.net/avform.htm#LL
        // lat =asin(sin(lat1)*cos(d)+cos(lat1)*sin(d)*cos(tc))
        // dlon=atan2(sin(tc)*sin(d)*cos(lat1),cos(d)-sin(lat1)*sin(lat))
        // lon=mod( lon1-dlon +pi,2*pi )-pi

    };

    this.getTiles = function(amount){

        //todo create nr of tiles represented as boundingboxes within this boundingbox

    };

};
