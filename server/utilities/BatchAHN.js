BatchAHN = function(db, find){
	
	console.log('Start Getting AHN data');

	//settings
	var batchSize = 50;
	find = find || {};

	//AHN
	this.AHN = new AHN();

	//get data
	var q = Meteor.require('q');
	var Fiber = Npm.require('fibers');
    Fiber(function(){

    	//wait db to be updated
		this.data = db.find({}).fetch();
		console.log('Records to update: ' + this.data.length);
		getBatch(0, batchSize);

    }).run();

	//run
	var getBatch = function(start, end){

		console.log('Get Batch ' + start + '-' + end);

		//check if (almost) ready
		var last = false;
		if(end >= this.data.length - 1){
			//last batch
			last = true;
			end = this.data.length - 1;
		}

		//get the data
		var list = [];
		var get, id;
		for(var i = start ; i < end ; i++){
			list[i] = { promise: AHN.get(data[i].center[0], data[i].center[1]), id: data[i]._id };
		}

		//add callbacks
		_.each(list, function(val){

			//update when ready
			val.promise.then(function(d){

				db.update(val.id, { $set: d }); 

			});

		});

		//batch done
		q.all(list).then(function(){

			if(!last) {
				console.log('get next batch');
				getBatch(end, end+batchSize);
			}
			else { 
				//no more batching
				console.log('Resolved AHN batch')
				deferred.resolve();  
			}

		});


	};

	//start
	var deferred = q.defer();
	this.promise = deferred.promise;
	return this.promise;

}