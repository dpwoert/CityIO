//import lib to import data
//simple XHR request in pure JavaScript
function load(url, callback) {
	var xhr;

	if(typeof XMLHttpRequest !== 'undefined') xhr = new XMLHttpRequest();
	else {
		var versions = ["MSXML2.XmlHttp.5.0",
			 	"MSXML2.XmlHttp.4.0",
			 	"MSXML2.XmlHttp.3.0",
			 	"MSXML2.XmlHttp.2.0",
			 	"Microsoft.XmlHttp"]

		for(var i = 0, len = versions.length; i < len; i++) {
		try {
			xhr = new ActiveXObject(versions[i]);
			break;
		}
			catch(e){}
		} // end for
	}

	xhr.onreadystatechange = ensureReadiness;

	function ensureReadiness() {
		if(xhr.readyState < 4) {
			return;
		}

		if(xhr.status !== 200) {
			return;
		}

		// all is well
		if(xhr.readyState === 4) {
			callback(xhr);
		}
	}

	xhr.open('GET', url, true);
	xhr.send('');
};

//callback
self.addEventListener('message', function(e) {

    //todo something here?

}, false);

var testBoat = {
    id: 1,
    name: 'Pakjesboot 1',
    model: 'ship',
    position: [ 4.475384, 51.901984 ],
    rotation: 300,
};

var testBoat2 = {
    id: 2,
    name: 'Pakjesboot 1',
    model: 'ship',
    position: [ 4.485426, 51.906379 ],
    rotation: 300,
};

var boats = [];
var list = {

    add: [],
    remove: [],
    change: []

};

//search boat
var getBoat = function(id){

	for( var i = 0 ; i < boats.length ; i++ ){
		if(boats[i].id == id) return boats[i];
	}

	//not found
	return false;

}

//update loop [10sec]
var update = function(speed){

    load('http://cityio-ais.herokuapp.com/API/boats', function(xhr) {
        var result = JSON.parse(xhr.responseText);

        for( var i = 0 ; i < result.length ; i++ ){

			var boat;
			boat = getBoat(result[i].MMSI);

			//not in list
			if(!boat){

				var rotation = result[i].COG == 360 ? 180 : result[i].COG;

				var boat = {
					id: result[i].MMSI,
					name: result[i].NAME,
					model: 'ship',
					position: [ result[i].LONGITUDE, result[i].LATITUDE ],
					rotation: rotation,
					scale: result[i].DRAUGHT
				}

				//add to lists
				boats.push(boat);
				list.add.push(boat);
			}

			else {

				//check if changed
				var newPos = [ result[i].LONGITUDE, result[i].LATITUDE ];
				if(boat.position[0] != newPos[0] || boat.position[1] != newPos[1]){
					list.change.push(boat);
				}

			}


		}

		//send back
		postMessage(list);

    });


    //reset
    list.change = [];
    list.remove = [];
    list.add = [];


    setTimeout(update, 1000*60);
}

update();
