var proj4 = require('proj4');
var THREE = require('three');

var Geo = function(lat, lon, srs){

    this.lat = lat;
    this.lon = lon;
    this.srs = srs || 'EPSG:4326';
    this.altitude = 0; //meters

    this.setAltitude = function(altitude, unit){

        //convert when needed - always needs to be meters
        switch(unit){

            case 'feet':
            case 'ft':
                altitude *= 0.32808399;
            break;

            case 'miles':
            case 'mi':
                altitude *= 0.1609344;
            break;

            case 'km':
            case 'kilometers':
                altitude *= 0.001;
            break;

        }

        //save
        this.altitude = altitude;

        //chainable
        return this;
    };

    this.getAltitude = function(pixelScale){
        pixelScale = pixelScale || 1;
        return pixelScale * this.altitude;
    };

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

    //linear interpolate to position (alpha between 0,1)
    this.lerp = function(destination, alpha){
        var lat = this.lat * (1 - alpha) + destination.lat * alpha;
		var lon = this.lon * (1 - alpha) + destination.lon * alpha;
		return new Geo(lat, lon);
    };

    this.convert = function(srs){

        //convert to another SRS when needed
        if(srs != this.srs){
            var coord = proj4(this.srs, srs, this.toArray());
            this.lat = coord[0];
            this.lon = coord[1];
            this.srs = srs;
        }

        return this;
    };

    this.round = function(decimal){
        decimal = decimal || 3;
        this.lat = parseFloat(this.lat).toFixed(decimal);
        this.lon = parseFloat(this.lon).toFixed(decimal);
    };

    this.equals = function(geo){
        return
            this.lat === geo.lat &&
            this.lon === geo.lon &&
            this.srs === geo.srs &&
            this.altitude === geo.altitude;
    }

    this.clone = function(){
        var point = new Geo(this.lat, this.lon, this.srs);

        //also clone altitude
        point.altitude = this.altitude;

        return point;

    };

    this.copy = function(geo){
        this.lat = geo.lat;
        this.lon = geo.lon;
        this.srs = geo.srs;

        return this;
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
        var coords = projection.translate3D(this);
        return new THREE.Vector3(coords.x, coords.y, z);
    };

};

module.exports = Geo;
