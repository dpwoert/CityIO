var Feature = require('./feature.js');

module.exports = function(){

    var list = [];

    this.parse = function(collection){

        for( var i = 0 ; i < collection.features.length ; i++ ){
            this.add(collection.features[i]);
        }

        //chainable
        return this;

    }

    this.add = function(feature){

        //import when just JSON data
        if(!feature.parse){
            feature = new Feature().parse(feature);
        }

        //add to list
        list.push(feature);

        //chainable
        return this;
    };

    this.get = function(){
        return list;
    };

    this.toJSON = function(){
        var json = {};
        json.type = "FeatureCollection";
        json.features = [];

        //add feature data
        this.each(function(feature){
            json.features.push( feature.export() );
        });

        return json;
    };

    this.each = function(fn){
        for( var i = 0 ; i < list.length ; i++ ){
            fn(list[i], i);
        }
    };

    this.count = function(){
        return list.length;
    }

    this.destroy = function(){

        //destroy all features
        this.each(function(f){
            f.destroy();
        });

        //clear reference
        list = [];
    };

}
