var gulp = require('gulp');
var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

gulp.task('build', function () {
  browserify({
    entries: './lib/shopkeeper.js',
    debug: true
  })
  .transform(babelify)
  .bundle()
  .pipe(source('shopkeeper.js'))
  .pipe(gulp.dest('./'));
});

gulp.task('minify', function () {

});

gulp.task('watch', function(){
  gulp.watch('./lib/**/*.js', ['build']);
});
