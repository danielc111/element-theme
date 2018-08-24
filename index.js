var gulp = require('gulp')
var series = require('run-sequence').use(gulp)
var task = require('./lib/task')
var vars = require('./lib/gen-vars')
var config = require('./lib/config')

var build = function (configPath, opts) {
  return function () {
    return task.build(configPath, Object.assign(opts, {message: 'build element theme ' + configPath}))
  }
}

var fonts = function (opts) {
  return function () {
    return task.fonts(Object.assign(opts, {message: 'build theme font'}))
  }
}

var buildThemeVariables = function (opts) {
  return function () {
    return task.buildThemeVariables(Object.assign(opts, {message: 'build theme variables'}))
  }
}

exports.init = function (filePath) {
  filePath = {}.toString.call(filePath) === '[object String]' ? filePath : ''
  vars.init(filePath)
}

function createBuildTasks(opts) {
  var paths = (opts.config || config.config);
  var tasks = [];
  paths.forEach(function (path) {
    gulp.task(path, build(path, opts))
    tasks.push(path);
  });
  return tasks;
}

exports.watch = function (opts) {
  gulp.task('build', build(opts))
  exports.run(opts)
  gulp.watch(opts.config || config.config, ['build'])
}

exports.run = function (opts, cb) {
  var tasks = createBuildTasks(opts);
  gulp.task('fonts', fonts(opts))
  gulp.task('buildThemeVariables', buildThemeVariables(opts))
  tasks.push('fonts')
  tasks.push('buildThemeVariables')
  if (typeof cb === 'function') {
    tasks.push(cb);
  }
  return series(tasks);
}
