IO.cacheStrip = function(data, keys){
	
	var item;
    var key;

    //read the data
    for ( var i = 0 ; i < data.length ; i++ ){
            item = data[i];

            //delete all keys in row
            for( var j = 0 ; j < keys.length ; j++){
                    key = keys[j];
                    data[i][key] = null;
                    delete data[i][key];
            }        
            
    }

    return data;

}