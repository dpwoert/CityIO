IO.loadData = function(city){

	//promise
	var deferred = Q.defer();

	//get the data
	Meteor.call('getData', city, function(error, data){

		// error
		if(error) deferred.reject(error);

		//done
		deferred.resolve(data);

	});

	return deferred.promise;

};