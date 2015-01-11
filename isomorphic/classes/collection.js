var Feature = require('./feature.js');

module.exports = function(){

    var list = [];

    this.parse = function(collection){

        for( var i = 0 ; i < collection.features.length ; i++ ){
            this.add(collection.features[i]);
        }

        return this;

    }

    this.add = function(feature){
        var feature = new Feature().parse(feature);
        list.push(feature);

        return this;
    };

    this.get = function(){
        return list;
    };

    this.each = function(fn){
        for( var i = 0 ; i < list.length ; i++ ){
            fn(list[i], i);
        }
    };

    this.destroy = function(){

        //destroy all features
        this.each(function(f){
            f.destroy();
        });

        //clear reference
        list = [];
    };

}
