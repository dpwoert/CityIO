IO.scrapers.AIS = function(db, record){

    var url = 'http://data.aishub.net/ws.php';
    var defaults = {
        username: 'AH_TRIAL_Q3AZ',
        format: 1,
        output: 'json',
        compress: 'gzip',

        //position
        latmin: null,
        latmax: null,
        lonmin: null,
        lonmax: null
    };

    var retrieveAPI = function(latmin, latmax, lonmin, lonmax){

        var deferred = Q.defer();
        var urlOptions = defaults;

        //position
        urlOptions.latmin = latmin;
        urlOptions.latmax = latmax;
        urlOptions.lonmin = lonmin;
        urlOptions.lonmax = lonmax;

        console.log('retrieve API');

        Meteor.http.get(url, { params: urlOptions } , function(error, result){

            console.log('headers:');
            console.log(result.data[0]);
            console.log('results:');
            if(result.data[1] && result.data[1][0]) console.log(result.data[1][0]);

            //http error
            if(error){
                console.error(error, result);
            }

            //api error
            if(result.data[0].ERROR){
                console.warn('AIS API: ' + result.data[0].ERROR_MESSAGE);
                deferred.reject();
            }

            deferred.resolve(result.data[1]);

        });

        return deferred.promise;

    };

    var save = function(data){

        console.log('save rows:' + data.length);

        var Fiber = Npm.require('fibers');
        Fiber(function(){

            //clear?
            if(!record) db.remove({});

            //save here
            db.insert({
                'type': 'AIS',
                'time': new Date(),
                'data': data
            }, function(e){
                console.error(e);
            });

        }).run();

    };

    this.retrieve = function(latmin, latmax, lonmin, lonmax){

        var deferred = Q.defer();

        retrieveAPI(latmin, latmax, lonmin, lonmax)
            .then(function(data){

                console.log(data);

                //save
                save(data);

                //done
                deferred.resolve(data);

        });

		return deferred.promise;

    }

}
