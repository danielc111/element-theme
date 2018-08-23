var path = require('path')
var fs = require('fs')
var gulp = require('gulp')
var ora = require('ora')
var nop = require('gulp-nop')
var sass = require('gulp-sass')
var autoprefixer = require('gulp-autoprefixer')
var cssmin = require('gulp-cssmin')
var config = require('./config')
var merge_stream = require('merge-stream');

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

function prefixThemeVariables(themeName, inputFileData) {
  if (themeName == 'default') {
    return inputFileData;
  }
  return inputFileData
    // convert property names from $--[name] to '$--themeName-[name]
    .replace(/\$--([a-z0-9-]+)/mg, "\$--" + themeName + "-$1")
}

exports.build = function (opts) {
  var spin = ora(opts.message).start()
  var stream = merge_stream();
  var components
  var cssFiles = '*'

  if (config.components) {
    components = config.components.concat(['base'])
    cssFiles = '{' + components.join(',') + '}'
  }
  var varsPath = path.resolve(config.themePath, './src/common/var.scss')
  var inputPaths = (opts.config || config.config);
  var themeVariables = [];
  inputPaths.forEach(function (configPath) {
    var inputPath = path.resolve(process.cwd(), configPath);
    var themeName = path.basename(inputPath, path.extname(inputPath));
    var inputFileData = fs.readFileSync(inputPath, 'utf-8');
    fs.writeFileSync(varsPath, inputFileData, 'utf-8')

    themeVariables.push(prefixThemeVariables(themeName, inputFileData));
    var outPath = (opts.out || config.out);
    if (!fs.existsSync(outPath)) {
      fs.mkdir(outPath);
    }

    stream.add(gulp.src([configPath, path.resolve(config.themePath, './src/' + cssFiles + '.scss')])
      .pipe(sass.sync())
      .pipe(autoprefixer({
        browsers: config.browsers,
        cascade: false
      }))
      .pipe((opts.minimize || config.minimize) ? cssmin({showLog: false}) : nop())
      .pipe(gulp.dest((opts.out || config.out) + '/' + themeName))
      .on('end', function () {
        spin.succeed()
      }))
  });

  var variablesFile = themeVariables.join('\n\n');
  fs.writeFileSync((opts.out || config.out) + '/theme-variables.scss', variablesFile, 'utf-8')

  return stream
}
