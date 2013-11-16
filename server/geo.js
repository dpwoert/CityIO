var geo = {
	APIurl: 'http://api.citysdk.waag.org/nodes',
	maxCalls: 2,
	calls: 0,

	//get field settings
	terrainSize: 2, //km
	center: [51.68836,5.30507]
};

Meteor.methods({
	//trigger loading all api's again
	buildCity: function(){

		//load & resest DB
		var buildings = new Meteor.Collection('buildings');
		buildings.remove({});
		console.log('==== Building city ====');

		//get & prepare BAG entries
		geo.getBAG({
			'pos': geo.center, 
			'radius': geo.terrainSize,
			'after': geo.addBAG,
			'db': buildings,
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
				console.log('finshed!!1!');
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

	db.insert({
		id: bagID,
		bouwjaar: obj.layers['bag.panden'].data.bouwjaar,
		geom: obj.geom,
		height: Math.random()*20 + 10
	});
}