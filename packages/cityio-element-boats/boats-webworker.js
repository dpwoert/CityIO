//import lib to import data

//callback
self.addEventListener('message', function(e) {

    //todo something here?

}, false);

var testBoat = {
    id: 1,
    name: 'Pakjesboot 1',
    model: 'ship',
    position: [ 4.475384, 51.901984 ],
    rotation: 120,
};

var i = 0;

var list = {

    add: [ testBoat ],
    remove: [],
    change: []

};

//update loop [10sec]
var update = function(speed){

     postMessage(list);

    //reset
    i++;
    list.change = [];
    list.remove = [];
    list.add = [];

    if(i == 10){
        testBoat.position = [4.49167, 51.915003];
        list.change.push(testBoat);
    }

    setTimeout(update, 1000*10);
}

update();
