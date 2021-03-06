
var q = require('q');
var fs = require('fs');

module.exports = function(){

    var data;
    var actions = [];

    this.open = function(filename){
        //todo
    };

    //action that creates it's own promise
    this.scraper = function(scraper, options){

        if(!scraper){
            throw new Error('scraper not found');
        }

        //get data
        var action = scraper(options, data);

        //save data
        action.then(function(r){
            if(r instanceof Object === false){
                data = JSON.parse(r);
            } else {
                data = r;
            }
        }, function(err){
            throw new Error(err);
        });

        //save promise
        actions.push({
            promise: action
        });

        //chainable
        return this;

    };

    this.action = function(fn, options){

        //create promise
        var defer = q.defer()

        //object
        var current = {
            fn: fn,
            options: options,
            defer: defer,
            promise: defer.promise
        };

        //save data on resolve
        current.defer.promise.then(function(r){
            data = r;
        }, function(err){
            throw new Error(err);
        });

        //wait on other promise?
        if(actions.length > 0){

            //get last
            var last = actions.length - 1;

            //set promise chain
            actions[last].promise.then(function(){
                current.fn(current.defer, data, current.options);
            });

        } else {
            current.fn(current.defer, data, current.options);
        }

        //add to list
        actions.push(current);

        //chainable
        return this;
    };

    this.save = function(filename){

        this.end().then(function(){

            //collection?
            if(data.export){
                data = data.export();
            }

            //save to file
            fs.writeFileSync(filename, JSON.stringify(data));
            console.log('successfully saved to ' + filename);

        });

    };

    this.end = function(){

        //get last
        var last = actions.length - 1;

        //prevent errors
        if(last < 0){
            last = 0;
        }

        //get promise
        return actions[last].promise;

    }

};
