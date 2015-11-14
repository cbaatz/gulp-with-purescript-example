var babelify   = require("babelify");
var browserify = require("browserify");
var watchify   = require("watchify");
var source     = require("vinyl-source-stream");
var buffer     = require('vinyl-buffer');
var notifier   = require("node-notifier");
var del        = require("del");
var gulp       = require("gulp");
var less       = require("gulp-less");
var livereload = require("gulp-livereload");
var minifyCSS  = require('gulp-minify-css');
var uglify     = require("gulp-uglify");
var gutil      = require("gulp-util");
var postcss    = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var purescript = require("gulp-purescript");
var package    = require("./package.json");

// Vendor libraries that we want to distribute in a separate file from the
// proprietary code.
var VENDOR = [
  "react",
  "react-dom"
];

// Ensure compiled PureScript modules can be found.
process.env['NODE_PATH'] = __dirname + '/' + package.paths.purescript.modules;

var handleError = function(err) {
  notifier.notify({ message: 'ERROR: ' + err.message });
  gutil.log(gutil.colors.red('ERROR'), err.message);
};

var babelSettings = {
  presets: ["es2015", "react"],
  plugins: [
    "transform-class-properties",
    "transform-flow-strip-types",
    "transform-object-rest-spread"
  ]
};

var bundlerApp = browserify({});
bundlerApp.add("src/js/main.jsx");
bundlerApp.transform(babelify, babelSettings);
VENDOR.forEach(function(lib) { bundlerApp.external(lib); });

var bundlerVendor = browserify();
VENDOR.forEach(function(lib) { bundlerVendor.require(lib); });

gulp.task("watch", function () {
  var path = "public";

  bundlerApp = watchify(bundlerApp);
  bundlerApp.on("update", function() {
    makeJSApp(path, bundlerApp).pipe(livereload());
  });

  bundlerVendor = watchify(bundlerVendor);
  bundlerVendor.on("update", function() {
    makeJSVendor(path, bundlerVendor).pipe(livereload());
  });

  gulp.watch(package.paths.html, function() {
    makeHTML(path).pipe(livereload());
  });

  gulp.watch(package.paths.lessAll, function() {
    makeCSS(path).pipe(livereload());
  });

  gulp.watch(package.paths.static, function() {
    makeStatic(path).pipe(livereload());
  });

  gulp.watch(package.paths.purescript.sources, function() {
    makePureScript(path);
  });

  gulp.watch(package.paths.purescript.foreigns, function() {
    makePureScript(path);
  });

  makeHTML(path);
  makeCSS(path);
  makeStatic(path);
  makePureScript(path);
  makeJSApp(path, bundlerApp);
  makeJSVendor(path, bundlerVendor);
  livereload.listen();
});

gulp.task("build", function () {
  var path = package.paths.dist;

  // Set NODE_ENV=production to ensure React uses production version.
  process.env['NODE_ENV'] = "production";

  del.sync(path);
  del.sync(package.paths.purescript.modules);
  makeHTML(path);
  makeCSS(path);
  makeStatic(path);
  makePureScript(path);
  makeJSApp(path, bundlerApp, true);
  makeJSVendor(path, bundlerVendor, true);
});

gulp.task("dotpsci", function () {
  return purescript.psci({
    src: package.paths.purescript.sources,
    ffi: package.paths.purescript.foreigns
  }).pipe(gulp.dest("."));
});

var uglifier = uglify({
  mangle: false,
  "screw-ie8": true,
});
function makeJSApp(path, bundler, minify) {
  return bundler.bundle()
  .on('error', handleError)
  .pipe(source("main.js"))
  .pipe(minify ? buffer() : gutil.noop())
  .pipe(minify ? uglifier : gutil.noop())
  .pipe(gulp.dest(path));
};
function makeJSVendor(path, bundler, minify) {
  return bundler.bundle()
  .on('error', handleError)
  .pipe(source("vendor.js"))
  .pipe(minify ? buffer() : gutil.noop())
  .pipe(minify ? uglify() : gutil.noop())
  .pipe(gulp.dest(path));
};
function makePureScript(path) {
  return purescript.psc({
    src: package.paths.purescript.sources,
    ffi: package.paths.purescript.foreigns,
    output: package.paths.purescript.modules
  }).on("error", handleError);
};
function makeHTML(path) {
  return gulp.src(package.paths.html)
  .pipe(gulp.dest(path));
};
function makeCSS(path) {
  return gulp.src(package.paths.lessMain)
  .pipe(less().on('error', handleError))
  .pipe( postcss([ autoprefixer({ browsers: ['last 1 version'] }) ]))
  .pipe(gulp.dest(path));
};
function makeStatic(path) {
  return gulp.src(package.paths.static)
  .pipe(gulp.dest(path));
};
