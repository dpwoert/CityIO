IO.render = function(){

	//reshedule
	requestAnimationFrame( IO.render );

	//pause
    if(IO.pause) return false;

    //get delta from clock
    var delta = IO.clock.getDelta();
	
	//animate all functions in renderlist
	for( var i = 0 ; i < IO.renderList.length ; i++ ){

		IO.renderList[i](delta);

	}

}