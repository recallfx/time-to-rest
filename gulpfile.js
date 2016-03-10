var gulp        = require('gulp'),
    jshint      = require('gulp-jshint'),
    concat      = require('gulp-concat'),
    minifyCSS   = require('gulp-minify-css'),
    rename      = require('gulp-rename'),
    uglify      = require('gulp-uglify'),
    clean       = require('gulp-clean'),
    liveServer  = require('gulp-live-server');

var buildDir    = 'build';
var distDir     = 'dist';

/*
* CSS
* */
gulp.task('css-src', function() {
    return gulp.src([
        // app
        './src/**/*.css'
    ])
        .pipe(concat('styles.css'))
        .pipe(gulp.dest(buildDir));
});

gulp.task('css-min', ['css-src'], function() {
    return gulp.src(buildDir + '/*.css')
        .pipe(minifyCSS({
            restructuring: false
        }))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(distDir + '/css'));
});

/*
* JS
* */
gulp.task('js-src', function() {
    return gulp.src([
            // vendors
            './bower_components/jquery/dist/jquery.js',
            './bower_components/moment/moment.js',

            // app
            './src/app.js',

            // the rest of app components
            './src/**/*.js'
        ])
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest(buildDir));
});

gulp.task('js-min', ['js-src'], function(){
    return gulp.src(buildDir + '/*.js')
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(distDir + '/js'));
});

/*
* JSHint
* */
gulp.task('lint', function() {
    return gulp.src(['./src/*.js', './src/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});


/*
* Copy files
* */
// copy and rename index to dist folder
gulp.task('dist-index', function() {
    return gulp.src(['./index.dist'])
        .pipe(rename({extname: '.html'}))
        .pipe(gulp.dest(distDir));
});

gulp.task('dist-files', function() {
    return gulp.src(['./favicon.ico'])
        .pipe(gulp.dest(distDir));
});

/*
* Clean
* */
gulp.task('clean', function () {
    return gulp.src([
        'build',
        'dist',
    ], {read: false})
        .pipe(clean());
});

/*
* Live server
* */
gulp.task('serve-dev', ['lint'], function() {
    var server = liveServer.static();
    server.start();

    //use gulp.watch to trigger server actions(notify, start or stop)
    return gulp.watch(['./**/*.{html,htm,css,js}' ], function (file) {
        server.notify.apply(server, [file]);
    });
});

gulp.task('serve-dist', ['default'], function() {
    // serve at custom port
    var server = liveServer.static('dist', 8888);
    server.start();

    //use gulp.watch to trigger server actions(notify, start or stop)
    return gulp.watch(['./dist/**/*.{html,htm,css,js}'], function (file) {
        server.notify.apply(server, [file]);
    });
});

/*
* Tasks
* */
gulp.task('dist', [
    'css-min',
    'js-min',
    'dist-index',
    'dist-files'
]);
gulp.task('default', ['lint', 'dist']);