module.exports = function(finish, data, options){

    console.log('start filtering data')

    var check = function(d, list){

        //filter
        for(var key in d) {

            var row = d[key];

            //do recursive scan when it is an object
            if(row instanceof Object && list[key] instanceof Object){
                check(row, options[key]);
            }

            else if(list[key] !== true){
                delete d[key];
            }

        };

    };

    //do checking recursively
    data.features.forEach(function(row){
        check(row, options);
    });

    console.log('applied filtering');

    //and done
    finish.resolve(data);

};
