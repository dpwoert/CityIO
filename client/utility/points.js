window.Points = function(center, zoom){
	
	this.init = function(){

		this.projection = d3.geo.mercator()
			.translate([1000 / 2, 10000 / 2])
			// .translate([geo.terrainSize / 2, geo.terrainSize / 2])
		    .scale(Math.pow(2,zoom))
		    // .rotate([-9, 0, 0])
		    .center(center);

		//get center in projection
		this.centerProjection = this.projection(geo.center);

	}.call(this);

	this.translate = function(point2){
		var coords = this.projection([ +point2[1], +point2[0] ]);
		var center = this.centerProjection;

		var point = [];
		point[0] = coords[0] - center[0];
		point[1] = coords[1] - center[1];

		return point;
	};

	this.translate2D = function(point2){
		var point = this.translate(point2);
		return new THREE.Vector2(point[0],point[1]);
	}

}