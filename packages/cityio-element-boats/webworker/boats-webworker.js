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

var i = 0;

var list = {

    add: [ testBoat ],
    remove: [],
    change: []

};

//update loop [10sec]
var update = function(speed){

    // load('http://cityio-ais.herokuapp.com/API/boats', function(xhr) {
    //     var result = JSON.parse(xhr.responseText);
	//
    //     //todo check for changes
	//
    // });

    if(i == 1){
        testBoat.position = [4.49167, 51.915003];
        list.change = [testBoat];
    }

     postMessage(list);

    //reset
    i++;
    list.change = [];
    list.remove = [];
    list.add = [];


    setTimeout(update, 1000*60);
}

update();
