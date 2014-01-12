checkIfUpdated = function(db, find){
	
	//promise
	var q = Meteor.require('q');
	var deferred = q.defer();
	this.promise = deferred.promise;
	find = find || {};

	var check = function(){
		console.log('check');
		if(db.find(find).count > 0) { deferred.resolve(); }
		else {
			console.log('not updated');
			setTimeout(check, 100);		
		}
	}

	//run
	setTimeout(check, 100);
	return this.promise;


}