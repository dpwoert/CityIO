module.exports = function(finish, data, options){

    var checkList = [];

    //check function
    var check = function(pos, _delete, key){

        var found = false;

        for( var i = 0 ; i < checkList.length ; i++ ){

            if(pos[0] === checkList[i][0] && pos[1] === checkList[i][1]){
                _delete.splice(key,1);
                found = true;
            }

        }

        //not found so add to list
        if(!found){
            checkList.push( pos );
        }

    };

    //check each feature
    data.features.forEach(function(feature){

        feature.geometry.coordinates.forEach(function(pos, key){

            var multi = pos[0] instanceof Array;

            if(!multi){

                check(pos, feature.geometry.coordinates, key);

            } else {

                pos.forEach(function(pos2, key){
                    check(pos2, pos, key);
                });
            }

        });

    });

    //done
    console.log('doubles removed');
    finish.resolve(data);

}
