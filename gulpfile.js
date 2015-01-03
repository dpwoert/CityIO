var gulp = require('gulp');
var concat = require('gulp-concat');
var browserify = require('gulp-browserify');
var rename = require('gulp-rename');

// gulp.task('client', function() {
//   return gulp.src('client/**/*,server/**/*')
//     .pipe(concat('cityio.isomorphic.js'))
//     .pipe(gulp.dest('export'))
//     .pipe(notify({ message: 'Builded isomorphic version of CityIO' }));
// });

gulp.task('client', function() {

    console.log('starting client build');

    return gulp.src('client.export.js', { read: false })
        .pipe(browserify({
            // transform: ['folderify'],
            insertGlobals: true,
            debug: true
        }))
        .pipe(rename('cityio.client.js'))
        .pipe(gulp.dest('./export'));
});

gulp.task('demo/denBosch', function() {

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

gulp.task('demo/denBosch/import', function() {
    require('./demos/denBosch/server.js')();
});

gulp.task('watch', ['client'], function() {
    gulp.watch(['client/**/*.js','server/**/*.js','isomorphic/**/*.js'], ['client']);
});
