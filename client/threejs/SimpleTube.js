/*
	Simple tube - dpwoert.com
*/

THREE.SimpleTube = function(path, weight){

	var geom = new THREE.Geometry();
	var i = 0;

	//add all sections
	for( var i = 0 ; i < path.points.length - 1 ; i++){
		var now = path.points[i];
		var next = path.points[i+1];

		this.addSection(p1, p2);
	}

	return geom;

	//not between 2 points, but butween new point and latest point...
	this.addSection = function(p1, p2){

		//calculate angle
		var deltaX = p1.x - p2.x; 
		var deltaY = p1.y - p2.x;
		var angle = Math.atan2(deltaY, deltaX) * 180 / PI;

		//get points
		var p1 = new THREE.Vector3( p1.x , p1.y , p1.z+weight );
		var p2 = new THREE.Vector3();
		var p3 = new THREE.Vector3();

		var p4 = new THREE.Vector3( p2.x , p2.y , p2.z+weight);
		var p5 = new THREE.Vector3();
		var p6 = new THREE.Vector3();

		geom.vertices.push(p1,p2,p3,p4,p5,p6);
		geom.computeFaceNormals();

		//make faces
		geom.faces.push( new THREE.Face3( i+0, i+1, i+2 ) );
		geom.faces.push( new THREE.Face3( i+4, i+5, i+6 ) );

		geom.faces.push( new THREE.Face3( i+2, i+3, i+4 ) );
		geom.faces.push( new THREE.Face3( i+2, i+4, i+5 ) );

		geom.faces.push( new THREE.Face3( i+1, i+4, i+6 ) );
		geom.faces.push( new THREE.Face3( i+1, i+3, i+6 ) );

	}

}

