IO.extra = IO.extra || {};

IO.extra.removeDoubles = function(list, point){

    for( var i = 0 ; i < list.length ; i++ ){

        if(
            list[i].x == point.x &&
            list[i].y == point.y
        ){
            point.x++;
            //point.y++;
        }
    }

    return point;

}
