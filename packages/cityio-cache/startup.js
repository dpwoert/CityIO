Meteor.startup(function(){

    if(!IO || !IO.buildpacks || IO.buildpacks.length < 1){
        console.error('IO-cache dependency loaded before buildpacks or missing IO object');
        //return false;
    }

    //make cache
    IO.cache = new IO.Cache();

});
