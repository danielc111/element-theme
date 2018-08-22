var path = require('path')
var fs = require('fs')
var gulp = require('gulp')
var ora = require('ora')
var nop = require('gulp-nop')
var sass = require('gulp-sass')
var autoprefixer = require('gulp-autoprefixer')
var cssmin = require('gulp-cssmin')
var config = require('./config')

exports.fonts = function (opts) {
  var spin = ora(opts.message).start()
  var stream = gulp.src(path.resolve(config.themePath, './src/fonts/**'))
    .pipe((opts.minimize || config.minimize) ? cssmin({showLog: false}) : nop())
    .pipe(gulp.dest(path.resolve(opts.out || config.out, './fonts')))
    .on('end', function () {
      spin.succeed()
    })

  return stream
}

exports.build = function (opts) {
  var spin = ora(opts.message).start()
  var stream
  var components
  var cssFiles = '*'

  if (config.components) {
    components = config.components.concat(['base'])
    cssFiles = '{' + components.join(',') + '}'
  }
  var varsPath = path.resolve(config.themePath, './src/common/var.scss')
  var inputPath = path.resolve(process.cwd(), opts.config || config.config);
  var themeName = path.basename(inputPath, path.extname(inputPath));
  var inputFileData = fs.readFileSync(inputPath, 'utf-8');
  fs.writeFileSync(varsPath, inputFileData, 'utf-8')

  var variablesFile = "$theme: (\n" +
    "\t'" + themeName + "': (\n" +
      inputFileData.replace(/\$--([a-z0-9-]+)\:/mg, "'$1':").replace(/\$--([a-z-]+)/gm, 'map-get(\'' + themeName + '\', \'$1\')').replace(/;/mg, ',').replace(/\s!default/gm, "").replace(/(.*\S.*)/gm, "\t\t\t$1") +
      "\t\t\t'name': '" + themeName + "'\n" +
      "\t\t)\n" +
    "\t);";

  fs.writeFileSync((opts.out || config.out) + '/theme-variables.scss', variablesFile, 'utf-8')

  stream = gulp.src([opts.config || config.config, path.resolve(config.themePath, './src/' + cssFiles + '.scss')])
    .pipe(sass.sync())
    .pipe(autoprefixer({
      browsers: config.browsers,
      cascade: false
    }))
    .pipe((opts.minimize || config.minimize) ? cssmin({showLog: false}) : nop())
    .pipe(gulp.dest((opts.out || config.out) + '/' + themeName))
    .on('end', function () {
      spin.succeed()
    })

  return stream
}
