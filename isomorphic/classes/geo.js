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

    this.distanceTo = function(geo, unit){

        //http://stackoverflow.com/questions/639695/how-to-convert-latitude-or-longitude-to-meters
        var R = 6378.137; // Radius of earth in KM
        var dLat = (geo.lat - this.lat) * Math.PI / 180;
        var dLon = (geo.lon - this.lon) * Math.PI / 180;
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(this.lon * Math.PI / 180) * Math.cos(geo.lat * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c;

        switch(unit){

            //nautical miles
            case 'nm':
            case 'nmi':
                return d * 0.539956803;

            //km
            case 'km':
                return d;

            //meters
            case 'm':
            default:
                return d*1000;

        }

        // return d * 1000; // meters

    };

    this.inRadius = function(radius, point){
        return this.distanceTo(point) < radius;
    };

    this.getRadians = function(){

        var point = this.clone();
        point.convert('EPSG:4326');

        return {
            lat: (point.lat * (Math.PI / 180)),
            lon: (point.lon * (Math.PI / 180))
        };

    };

    this.getCourse = function(destination){

        var d = this.distanceTo(destination, 'nm');

        if ( Math.sin( destination.lon - this.lon ) < 0 ){

            return Math.acos((Math.sin(destination.lat)-Math.sin(this.lat)*Math.cos(d))/(Math.sin(d)*Math.cos(this.lat)));

        } else{

            return 2*Math.PI-Math.acos((Math.sin(destination.lat)-Math.sin(this.lat)*Math.cos(d))/(Math.sin(d)*Math.cos(this.lat)));

        }

    };

    //interpolate to position (alpha between 0,1)
    this.interpolate = function(destination, alpha){

        var start = this.getRadians();
        var end = destination.getRadians();

        //http://williams.best.vwh.net/avform.htm#Intermediate
        // var d = Math.acos(Math.sin(start.lat)*Math.sin(end.lat)+Math.cos(start.lat)*Math.cos(end.lat)*Math.cos(start.lon-end.lon))
        var d = this.distanceTo(destination, 'nm');
        var A = Math.sin( (1-alpha) * d ) / Math.sin(d);
        var B = Math.sin( alpha * d ) / Math.sin(d);
        var x = A * Math.cos( start.lat ) * Math.cos( start.lon ) + B * Math.cos( end.lat ) * Math.cos( end.lon );
        var y = A * Math.cos( start.lat ) * Math.sin( start.lon ) + B * Math.cos( end.lat ) * Math.sin( end.lon );
        var z = A * Math.sin( start.lat ) + B * Math.sin( end.lat );

        var lat = Math.atan2( z, Math.sqrt( Math.pow(x,2)+Math.pow(y,2) ) );
        var lon = Math.atan2( y, x );

        lat = (180.0 * (lat / Math.PI))
        lon = (180.0 * (lon / Math.PI))

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
