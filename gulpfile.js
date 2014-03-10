var gulp = require('gulp');
var es = require('event-stream');
var pj = require('./package.json');
var $ = require('gulp-load-plugins')();
var concat = require('gulp-concat');

// var debug = require('gulp-debug');


gulp.task('usemin', ['templates'], function() {
  return gulp.src('app/index.html')
    .pipe($.usemin({
      html: [$.minifyHtml({empty: true})],
      js: ['concat', $.rev()],
      css: [$.minifyCss(), 'concat']
    }))
    .pipe(gulp.dest('dist'));
});

// The generated file is being created at src
// so it can be fetched by usemin.
gulp.task('templates', function() {
  return gulp.src('app/partials/*.html')
    .pipe($.angularTemplatecache('partials.js', {
      root: 'partials',
      module: 'partials',
      standalone: true
    }))
    .pipe(gulp.dest('app/js'));
});

gulp.task('copy', function() {
  return es.concat(
    gulp.src(['app/favicon.ico', 'app/favicon_unread.ico', 'app/manifest.webapp', 'app/manifest.json', 'app/**/*worker.js'])
      .pipe(gulp.dest('dist')),
    gulp.src(['app/img/**/*', '!app/img/screenshot*'])
      .pipe(gulp.dest('dist/img')),
    gulp.src('app/vendor/console-polyfill/console-polyfill.js')
      .pipe(gulp.dest('dist/vendor/console-polyfill')),
    gulp.src('app/js/lib/mtproto.js')
      .pipe(gulp.dest('dist/js/lib')),
    gulp.src('app/js/lib/config.js')
      .pipe(gulp.dest('dist/js/lib')),
    gulp.src('app/vendor/jsbn/jsbn_combined.js')
      .pipe(gulp.dest('dist/vendor/jsbn')),
    gulp.src('app/vendor/cryptoJS/crypto.js')
      .pipe(gulp.dest('dist/vendor/cryptoJS'))
  );
});

gulp.task('compress-dist', ['add-csp'], function() {
  return es.concat(
    gulp.src('dist/**/*')
      .pipe($.zip('webogram_v' + pj.version + '.zip'))
      .pipe(gulp.dest('package_dist')),

    gulp.src('package_dist/*.zip')
      // .pipe(debug({verbose: true}))
      .pipe(gulp.dest('releases')),

    gulp.src(['package_dist'])
      // .pipe(debug({verbose: true}))
      .pipe($.clean())
  );
});

gulp.task('add-csp', ['build'], function() {
  return gulp.src('dist/index.html')
    .pipe($.replace('<html lang=en ng-app=myApp>', '<html lang=en ng-app=myApp ng-csp="">'))
    .pipe(gulp.dest('dist'));
});

gulp.task('update-version-manifests', function() {
 return gulp.src(['app/manifest.webapp', 'app/manifest.json'])
    .pipe($.replace(/"version": ".*",/, '"version": "' + pj.version + '",'))
    .pipe(gulp.dest('app'));
});

gulp.task('update-version-settings', function() {
 return gulp.src('app/partials/settings_modal.html')
    .pipe($.replace(/<span class="settings_version">alpha .*<\/span>/, '<span class="settings_version">alpha ' + pj.version  + '<\/span>'))
    .pipe(gulp.dest('app/partials'));
});

gulp.task('update-version-comments', function() {
 return gulp.src('app/**/*')
  .pipe($.grepStream('Webogram v'))
  .pipe($.replace(/Webogram v[0-9.]*/, 'Webogram v' +  pj.version))
  .pipe(gulp.dest('app'));
});


gulp.task('clean', function() {
  return gulp.src(['dist/**/*', '!dist/.git']).pipe($.clean());
});

gulp.task('bump', ['update-version-manifests', 'update-version-settings', 'update-version-comments']);
gulp.task('build', ['templates', 'usemin', 'copy']);
gulp.task('package', ['compress-dist']);

gulp.task('default', ['clean'], function() {
  gulp.start('build');
});
