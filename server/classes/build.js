var browserify = require('browserify');
var q = require('q');
var fs = require('fs');
var mapping = require('../../client/mapping.js');

module.exports = function(){

    var list = [];

    var load = function(){
        var file = 'var IO = require("./client/index.js"); \n';
        // file += 'module.exports=function(){ \n';
        list.forEach(function(req){

            //todo parse keyname
            file += 'IO.' + [req.name] + ' = require("./client/' + req.url + '"); \n';

        });
        file += 'window.IO = IO;';
        file += 'window.THREE = require("three");';
        // file += '};';
        return file;
    };

    this.add = function(name, url){

        if(!url){
            url = mapping(name);
        }

        //add to list
        list.push({
            'name': name,
            'url': url
        });

        //chainable
        return this;
    };

    this.export = function(filename, options){

        //create promis
        var defer = q.defer();

        //defaults
        options = options || {};
        options.minify = options.minify || true;
        options.debug = options.debug || false;
        // options.exportLibs = options.exportLibs || false;

        //create temp file?
        var tmpName = __dirname + '/../../buildscript.'+ Date.now() +'.js';
        var tmp = load();
        fs.writeFileSync(tmpName, tmp);

        //build
        browserify()
            .add(tmpName)
            .bundle(function(err, content){

                fs.unlinkSync(tmpName);
                if(err){
                    console.error('error: ', err);
                    defer.reject(err);
                }
                else {
                    fs.writeFileSync(filename, content);
                    defer.resolve(content);
                }

            });

        return defer.promise;

    };

};
