Meteor.loadScript = function(url){

    var deferred = Q.defer();

    //load
    var script = document.createElement('script');
    script.type = "text/javascript";
    script.src = url;
    console.log('load script: ' + url);
    script.onload = function () {
        deferred.resolve();
        console.log('loaded script');
    };

    document.head.appendChild(script);
    return deferred.promise;
};

Meteor.loadScripts = function(list){

    //make promise
    var deferred = Q.defer();

    //load all urls
    var promises = [];
    for(var i = 0 ; i < list.length ; i ++){
        promises.push( Meteor.loadScript( list[i] ) );
    }

    Q.all(promises).then(function(){
        deferred.resolve();
    });

    //return promise
    return deferred.promise;

}