var jsonurl = 'http://api.citysdk.waag.org/nodes?per_page=100&lat=51.697816&lon=5.303675&radius=3600&osm::natural=water';
//Een test url van citysdk

function loadJSON(callback) {   
  var xobj = new XMLHttpRequest();
  
  xobj.overrideMimeType("application/json");
  xobj.open('GET', jsonurl, true); // //  Zet op false voor synchronous load.
  xobj.onreadystatechange = function () {
    if (xobj.status == "404"){
      console.log('Page not found');
    }
    if (xobj.readyState == 1){
      console.log('server connection established');
    }
    if (xobj.readyState == 2){
      console.log('request received');
    }
    if (xobj.readyState == 3){
      console.log('processing request');
    } 
    //Alles hierboven kan weg zodra het werkt. Is om te checken tot waar het werkt / waar die crasht

    if (xobj.readyState == 4 && xobj.status == "200") {
    // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
      callback(xobj.responseText); //Response data als string
      //console.log(xobj.responseText);
    }
    };
    xobj.send(xobj.responseText);  
};


//Een yolo init(); om in console om te testen of die werkt.
function init() {
 loadJSON(function(response) {
  // Parse JSON string into object
  var actual_JSON = JSON.parse(response);
  console.log(actual_JSON);
 });
};
