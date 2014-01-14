//source: http://www.nczonline.net/blog/2009/07/28/the-best-way-to-load-external-javascript/
Meteor.loadScript = function(url){

    var script = document.createElement("script")
    script.type = "text/javascript";

    var deferred = Q.defer();

    if (script.readyState){  //IE
        script.onreadystatechange = function(){
            if (script.readyState == "loaded" ||
                    script.readyState == "complete"){
                script.onreadystatechange = null;
                deferred.resolve();
            }
        };
    } else {  //Others
        script.onload = function(){
            deferred.resolve();
        };
    }

    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);

    return deferred.promise;
};

Meteor.loadScripts = function(list){

    //make promise
    var deferred = Q.defer();

    //load all urls
    var promises = [];
    for(var i = 0 ; i < list.length ; i ++){
        list.push( Meteor.loadScript( list[i] ) );
    }

    Q.all(promises).then(function(){
        deferred.resolve();
    });

    //return promise
    return deferred.promise;

}