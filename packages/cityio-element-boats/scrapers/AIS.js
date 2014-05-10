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

        Meteor.http.get(url, { params: urlOptions } , function(error, result){

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

        var Fiber = Npm.require('fibers');
        Fiber(function(){

            console.log('saved AIS rows: ' + data.length);

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

                //save
                save(data);

                //done
                deferred.resolve(data);

        });

		return deferred.promise;

    }

}
