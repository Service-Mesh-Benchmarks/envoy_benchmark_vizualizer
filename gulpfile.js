var gulp = require('gulp');
var run = require('gulp-run');
var browserSync = require('browser-sync');

gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: "./"
        }
    });
});

// use gulp-run to start a pipeline 
gulp.task('start-fileserver', function() {
    return run('npm start').exec().pipe(gulp.dest('output'))    // run "npm start". 
})

gulp.task('default', ['browser-sync', 'start-fileserver']);
