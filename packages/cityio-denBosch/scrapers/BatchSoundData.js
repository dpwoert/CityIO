IO.batch.SoundData = function(db, find, type){

	//settings
	var batchSize = 50;

	//promise
	var deferred = q.defer();
	this.promise = deferred.promise;

	//database data
	var Fiber = Npm.require('fibers');
    Fiber(function(){

    	//wait db to be updated
		this.data = db.find(find).fetch();
		console.log('Records to update: ' + this.data.length);
		getBatch(0, batchSize);


    }).run();

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
		var done = 0;
		for(var i = start ; i < end ; i++){
			list[i] = { promise: new IO.scrapers.SoundData(data[i].points, type), id: data[i]._id, debug: data[i] };
		}

		//add callbacks
		_.each(list, function(val){

			//update when ready
			val.promise.then(function(d){

				//update db
				_.each(d, function(update){
					db.update(val.id, update);
				});
				done++;

				console.log('saved: ' + val.id + ' | ' + d.length + ' | ' + done + '/' + (end - start) + ' | ' + (start + done) + '/' + this.data.length + ' | ' + last);

				//check if done
				if(done >= end - start){

					if(!last) {
						console.log('get next batch');
						getBatch(end, end+batchSize);
					}
					else {
						//no more batching
						console.log('Resolved SoundData batch')
						deferred.resolve();
					}

				}

			}, function(){
				//rejected
				console.log('rejected:');
				console.log(val.debug);
				done++;
			});

		});


	};

	return this.promise;

}