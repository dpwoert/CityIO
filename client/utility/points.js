window.Points = function(center, zoom){
	

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

	this.setScale = function(){

		//make points
		var p1 = center;
		var p2 = [center[0]+0.00001 , center[1]+0.00001];

		//distance in m
		var meters = Math.abs( measureDistance(p1[0],p1[1] , p2[0],p2[1]) );

		//pixel points
		var pixels1 = this.projection(p1);
		pixels1[0] = pixels1[0] - geo.center[0];
		pixels1[1] = pixels1[1] - geo.center[1];
		var pixels2 = this.projection(p2);
		pixels2[0] = pixels2[0] - geo.center[0];
		pixels2[1] = pixels2[1] - geo.center[1];

		//pixel distance
		var pixelDistance = Math.sqrt( Math.pow(pixels2[0]-pixels1[0],2) + Math.pow(pixels2[1]-pixels1[1],2) );

		this.pixelScale = meters / pixelDistance;
		this.meterScale = pixelDistance / meters;

	};

	this.init = function(){

		this.projection = d3.geo.mercator()
			//.translate([1000 / 2, 10000 / 2])
			// .translate([geo.terrainSize / 2, geo.terrainSize / 2])
		    .scale(Math.pow(2,zoom))
		    // .rotate([-9, 0, 0])
		    .center(center);

		//get center in projection
		this.centerProjection = this.projection(center);

		//set scale
		this.setScale();

	}.call(this);

}