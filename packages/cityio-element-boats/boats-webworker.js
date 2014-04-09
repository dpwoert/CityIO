//import lib to import data

//callback
self.addEventListener('message', function(e) {

    if(e.data == 'start'){
        //started
    }

}, false);

//update loop [10sec]
var update = function(){

     postMessage('worker update');
     setTimeout(update, 1000*10);
}

update();
