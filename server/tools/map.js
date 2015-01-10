module.exports = function(finish, data, options){

    //make sure mapping is done correct
    if(options instanceof Function === false){
        console.error('Mapping withouth an function as argument');
        return false;
    }

    //do mapping
    data.features.forEach(function(row, index){
        row = options(row, index, data);
    });

    console.log('applied mapping');

    //and done
    finish.resolve(data);

};
