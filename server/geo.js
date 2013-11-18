geo = {
	APIurl: 'http://api.citysdk.waag.org/nodes',
	maxCalls: 2,
	calls: 0,

	//get field settings
	terrainSize: 2, //km
	center: [51.68836,5.30507]
};

//publish on startup
Meteor.startup(function(){

	//load buildings
	geo.buildingsDB = new Meteor.Collection('buildings');
	Meteor.publish("all-buildings", function() {
		return geo.buildingsDB.find({});
	});		


});

Meteor.methods({
	//trigger loading all api's again
	buildCity: function(){

		//load & resest DB
		geo.buildingsDB.remove({});
		console.log('==== Building city ====');

		//get & prepare BAG entries
		geo.getBAG({
			'pos': geo.center, 
			'radius': geo.terrainSize,
			'after': geo.addBAG,
			'db': geo.buildingsDB,
			'finished': function(){}
		});
	}
});

geo.getBAG = function(obj){
	
	var options = {
		lat: obj.pos[0],
		lon: obj.pos[1],
		radius: 1000*obj.radius,
		layer: 'bag.panden',
		geom: true,
		per_page: 1000,
		page: 0
	};

	getPage();

	function getPage(){

		//measure no calls
		geo.calls++;
		options.page += 1;
		console.log('get BAG page: ' + options.page)

		//make request
		Meteor.http.get(geo.APIurl, { params: options } , function(error, result){

			console.log(result.data.url);

			//add to data object
			_.each(result.data.results, function(value){
				obj.after(value, obj.db);
			});

			//check if finished/more pages
			if(result.data.results.length < obj.per_page || geo.calls >= geo.maxCalls){

				//finished
				console.log('finshed gettings BAG data');
				console.log('records added:' + obj.db.find().fetch().length);
				obj.finished();
			} 
			else {
				getPage();
			}
		});
	}

}

geo.addBAG = function(obj, db){
	var bagID = obj.layers['bag.panden'].data.pand_id;
	//console.log('add bag, id: ' + bagID);

	//get center
	var geoCenter = geo.getCenter(obj.geom.coordinates[0]);

	//insert into database
	db.insert({
		id: bagID,
		bouwjaar: obj.layers['bag.panden'].data.bouwjaar,
		geom: obj.geom,
		height: 0,
		center: geoCenter
	}, function(error, id){
		//get & save height
		tiles.saveHeight(geoCenter, db, id);
	});
}

geo.getCenter = function(arr){
    var x = arr.map(function(a){ return a[0] });
    var y = arr.map(function(a){ return a[1] });
    var minX = Math.min.apply(null, x);
    var maxX = Math.max.apply(null, x);
    var minY = Math.min.apply(null, y);
    var maxY = Math.max.apply(null, y);
    return [(minX + maxX)/2, (minY + maxY)/2];
}