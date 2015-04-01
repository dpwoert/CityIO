var THREE = require('three');
var d3 = require('d3-geo-mercator');

module.exports = function(center, zoom){

    //todo switch between projections [globe - map]
	zoom = zoom || 20;

	//create d3 projection
	var projection = d3.geo.mercator()
			.scale(Math.pow(2,zoom))
			.center( center.toArray() );

	this.translate = function(point){
		return projection([point.lat, point.lon]);
	};

	//todo should be refactored
	this.translate2D = function(point){
		var coords = projection([point.lat, point.lon]);
		return new THREE.Vector2(-coords[0], coords[1]);
	};

	this.translate3D = function(point){
		var coords = projection([point.lat, point.lon]);
		return new THREE.Vector3(-coords[0], coords[1], point.getHeight(this.pixelScale) );
	};

	this.reverse = function(vec3){

		//reverse through projection
		return projection.invert([vec3.x,vec3.y]);

	};

	//get pixel scale
	var pixelScale = function(){

		var offset = center.clone();
		var pos1 = this.translate(center);
		var pos2 = this.translate(offset);

		//distance in meters
		var meters = center.distanceTo(offset);
		var pixels = Math.sqrt( Math.pow(pos2[0]-pos1[0],2) + Math.pow(pos2[1]-pos1[1],2) );

		//ratios
		this.pixelScale = meters / pixels;
		this.meterScale = pixels / meters;

	}.call(this);

	//make public, maybe needed
	this.d3 = projection;

};
