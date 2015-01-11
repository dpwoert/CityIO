var browserify = require('browserify');
var q = require('q');

module.exports = function(){

    var list = [];

    var load = function(){
        list.forEach(function(req){

            IO[req.type][req.name] = require(req.file);

        });
    };

    this.add = function(name){

        //chainable
        return this;
    };

    this.export = function(filename, options){

        //create promis
        var defer = q.defer();

        //defaults
        options.minify = options.minify || true;
        options.debug = options.debug || false;
        // options.exportLibs = options.exportLibs || false;

        //create temp file?
        var tmpName = 'buildscript.'+ Date.now() +'.js';
        var tmp = JSON.parse(list) + load.toString();
        fs.writeFileSync(tmpName, tmp);

        //build
        browserify()
            .require('../../client/', {expose: 'IO'})
            .add(list);
            .bundle()
            .pipe(function(content){

                fs.writeFileSync(filename, content);
                fs.unlinkSync(tmpName);
                defer.resolve(content);

            });

        return defer.promise;

    };

};
