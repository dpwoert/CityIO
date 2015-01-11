var gulp = require('gulp');
var concat = require('gulp-concat');
var browserify = require('gulp-browserify');
var rename = require('gulp-rename');

gulp.task('demos/denBosch', function() {

    var connect = require('connect');
    var app = connect()
        .use(connect.static('demos/denBosch'))
        .use(connect.static('export'))
        .use(connect.directory('demos/denBosch'));

    require('http').createServer(app)
        .listen(9000)
        .on('listening', function () {
            console.log('Started connect web server on http://localhost:9000');
        });

});

gulp.task('demos/denBosch/import', function() {
    require('./demos/denBosch/server.js')();
});

gulp.task('demos/denBosch/update', function() {
    require('./demos/denBosch/createScript.js')();
});

gulp.task('watch', ['demos/denBosch/update'], function() {
    gulp.watch(['client/**/*.js','server/**/*.js','isomorphic/**/*.js'], ['demos/denBosch/update']);
});
