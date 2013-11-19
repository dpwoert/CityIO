window.mouse = {};

mouse.init = function(){
    DDD.projector = new THREE.Projector();

    //events
	$('canvas').mousemove(mouse.move);
    $('canvas').dblclick(mouse.click);
}

mouse.move = function(event){

	var vector = new THREE.Vector3( 
        ( event.clientX / window.innerWidth ) * 2 - 1, 
        - ( event.clientY / window.innerHeight ) * 2 + 1, 
        0.5 );

    DDD.projector.unprojectVector( vector, DDD.camera );

    var ray = new THREE.Raycaster( DDD.camera.position, vector.sub( DDD.camera.position ).normalize() );

    var intersects = ray.intersectObjects( DDD.buildings );    

    if ( intersects.length > 0 ) {
        mouse.active = intersects[0].object;
    } else {
        mouse.active = false;
    }

}

mouse.click = function(){
    console.log('BUILDING :: ' + mouse.active.userData.id);
    console.log(mouse.active.userData);
    console.log(mouse.active);
    console.log('http://geodata.nationaalgeoregister.nl/tms/1.0.0/brtachtergrondkaart@EPSG:28992@png8/');
}