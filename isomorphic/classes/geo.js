var proj4 = require('proj4');
var THREE = require('three');

var Geo = function(lat, lon, srs){

    this.lat = lat;
    this.lon = lon;
    this.srs = srs || 'EPSG:4326';

    this.distanceTo = function(geo){

        //http://stackoverflow.com/questions/639695/how-to-convert-latitude-or-longitude-to-meters
        var R = 6378.137; // Radius of earth in KM
        var dLat = (geo.lat - this.lat) * Math.PI / 180;
        var dLon = (geo.lon - this.lon) * Math.PI / 180;
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(this.lon * Math.PI / 180) * Math.cos(geo.lat * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c;
        return d * 1000; // meters

    };

    this.convert = function(srs){

        //convert to another SRS when needed
        if(srs != this.srs){
            var coord = proj4(this.srs, srs, [this.lat, this.lon]);
            this.lat = coord[0];
            this.lon = coord[1];
            this.srs = srs;
        }

        return this;
    };

    this.clone = function(){
        return new Geo(this.lat, this.lon);
    };

    this.copy = function(geo){
        this.lat = geo.lat;
        this.lon = geo.lon;
    };

    this.fromArray = function(pos){
        this.lat = pos[0];
        this.lon = pos[1];

        return this;
    };

    this.toArray = function(){
        return [this.lat, this.lon];
    };

    this.to3D = function(projection, z){
        z = z || 0;
        var coords = projection.translate3D(this.lat, this.lon);
        return new THREE.Vector3(coords.x, coords.y, z);
    };

};

module.exports = Geo;
