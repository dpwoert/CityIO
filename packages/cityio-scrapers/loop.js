IO.scrapers.loop = [];

var loop = function(){

    console.log('loop');

    //execute all scrapers
    var Fiber = Npm.require('fibers');
    Fiber(function(){
        for( var i = 0 ; i < IO.scrapers.loop.length ; i++){
            IO.scrapers.loop[i]();
        }
    }).run();

    setTimeout(loop, 1000*60);
}

//auto start
Meteor.startup(loop);
