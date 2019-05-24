// --------------------------------------------------------
// Dependencies
// --------------------------------------------------------

// Utils
const fs = require('fs');
const del = require('del');
const gulp = require('gulp');
const map = require('map-stream');
const path  = require('path');

// JavaScript
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const modernizr = require('gulp-modernizr-build');
const jshint = require('gulp-jshint');
const stylish = require('jshint-stylish');

// SCSS
const sass = require('gulp-sass');
const sassLint = require('gulp-sass-lint');

// CSS
const postcss = require('gulp-postcss');
const autoprefixer = require('gulp-autoprefixer');
const nano = require('cssnano');

// Misc
const ghPages = require('gulp-gh-pages');
const imagemin = require('gulp-imagemin');
const sourcemaps = require('gulp-sourcemaps');
const spritesmith = require('gulp.spritesmith');
const svgSprite = require("gulp-svg-sprites");
const merge = require('merge-stream');
const buffer = require('vinyl-buffer');
const plumber = require('gulp-plumber');
const newer = require("gulp-newer");
const remember = require('gulp-remember');
const cached = require('gulp-cached');
const gulpif = require('gulp-if');

// Fractal
const pkg = require('./package.json');
const fractal = require('./fractal.js');
const twig = require('twig');
const twigDrupal = require('twig-drupal-filters');
const logger = fractal.cli.console;
const bluebird = require('bluebird');

// --------------------------------------------------------
// Configuration
// --------------------------------------------------------

// Drupal filters
twigDrupal(twig);

// Turn off  warnings
bluebird.config({
  warnings: false
});

const isDevelopment = process.env.NODE_ENV == 'development';

// Paths
const paths = {
  build: `${__dirname}/build`,
  dest: `${__dirname}/tmp`,
  src: `${__dirname}/src`,
  modules: `${__dirname}/node_modules`
};

// PostCSS plugins
const processors = [
  nano({zindex: false})
];

// JavaScript files for main theme
const behaviorPaths = {
  base: [
    `${paths.src}/assets/scripts/utils/classes/*.js`,
    `${paths.src}/components/veo_site/**/*.js`,
    `!${paths.src}/components/veo_site/**/*module.js`
  ],
  vwt: [
    `${paths.src}/components/veo_watertech/**/*.js`,
    `!${paths.src}/components/veo_watertech/**/*module.js`
  ],
  wl: [
    `${paths.src}/components/veo_whitelabel/**/*.js`,
    `!${paths.src}/components/veo_whitelabel/**/*module.js`
  ]
};

// JavaScript files for admin theme
const adminJs = [
  'node_modules/babel-polyfill/dist/polyfill.js',
  `${paths.src}/components/**/*.admin.js`
];

const modules = [
  `${paths.src}/components/**/*.module.js`
];

const nodeFilesJS = [
  `${paths.modules}/jquery-once/jquery.once.min.js`,
  `${paths.modules}/simplebar/dist/simplebar.min.js`
];

// --------------------------------------------------------
// Tasks
// --------------------------------------------------------

// Build static site
function build() {
  const builder = fractal.web.builder();

  builder.on('progress', (completed, total) => {
    if ((completed % 100) === 0) {
      logger.update(`Exported ${completed} of ${total} items`, 'info');
    }
  });
  builder.on('error', err => logger.error(err.message));

  return builder.build().then(() => {
    logger.success('Fractal build completed!');
  });
}

function prepareBuildAssets() {
  return new Promise(function(res, rej) {
    setTimeout(function() {
      paths.dest = paths.build;
      res('Finished');
    }, 500);
  })
}

// Serve dynamic site
function serve() {
  const server = fractal.web.server({
    sync: true,
    syncOptions: {
      https: true
    }
  });

  server.on('error', err => logger.error(err.message));

  return server.start().then(() => {
    logger.success(`Fractal server is now running at ${server.url}`);
  });
}

// Clean
function clean() {
  return del(`${paths.dest}/assets/`);
}

// Deploy to GitHub pages
function deploy() {
  // Generate CNAME file from `homepage` value in package.json
  const cname = pkg.homepage.replace(/.*?:\/\//g, '');
  fs.writeFileSync(`${paths.build}/CNAME`, cname);

  // Push contents of build folder to `gh-pages` branch
  return gulp.src(`${paths.build}/**/*`)
    .pipe(ghPages({
      force: true
    }));
}

// Meta
function meta() {
  return gulp.src(`${paths.src}/*.{txt,json}`)
    .pipe(newer(paths.dest))
    .pipe(gulp.dest(paths.dest));
}

// Icons
function icons() {
  return gulp.src(`${paths.src}/assets/icons/**/*`)
    .pipe(newer(`${paths.dest}/assets/icons`))
    .pipe(imagemin())
    .pipe(gulp.dest(`${paths.dest}/assets/icons`));
}

// Images
function images() {
  return gulp.src(`${paths.src}/assets/images/**/*`)
    .pipe(newer(`${paths.dest}/assets/images`))
    .pipe(imagemin({
      progressive: true
    }))
    .pipe(gulp.dest(`${paths.dest}/assets/images`));
}

// Vectors
function vectors() {
  return gulp.src(`${paths.src}/assets/vectors/**/*`)
    .pipe(newer(`${paths.dest}/assets/vectors`))
    .pipe(gulp.dest(`${paths.dest}/assets/vectors`));
}

// Integration code

function integrationCode() {
  return gulp.src(`${paths.src}/assets/integration_code/**/*`)
    .pipe(newer(`${paths.dest}/assets/integration_code`))
    .pipe(gulp.dest(`${paths.dest}/assets/integration_code`));
}

// Fonts
function fonts() {
  return gulp.src(`${paths.src}/assets/fonts/**/*`)
    .pipe(newer(`${paths.dest}/assets/fonts`))
    .pipe(gulp.dest(`${paths.dest}/assets/fonts`));
}

// Modernizr
function modernizrbuild() {
  return gulp.src([
    `${paths.src}/assets/scripts/*.js`,
    `${paths.src}/assets/styles/*.scss`,
    `!${paths.src}/assets/**/modernizr*.js`
  ])
  .pipe( modernizr('modernizr.js', {
    cssPrefix   : 'feat-'
  }));
}

// assets scripts
function assetsScripts() {
  return gulp.src(`${paths.src}/assets/scripts/**`)
    .pipe(newer(`${paths.dest}/assets/scripts`))
    .pipe(gulp.dest(`${paths.dest}/assets/scripts`));
}

// Scripts for main theme
function behaviors() {
  function behaviors(src, theme) {
    return gulp.src(src)
      .pipe(plumber())
      .pipe(cached('behaviors'+theme))
      .pipe(sourcemaps.init())
      .pipe(babel({
        presets: ['env'],
        plugins: ['transform-es2015-classes', 'transform-es2015-typeof-symbol']
      }))
      .pipe(uglify())
      .pipe(remember('behaviors'+theme))
      .pipe(concat('app.js'))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(`${paths.dest}/assets/scripts${theme ? '/sub_themes/'+theme : ''}`));
  }

  let base = behaviors(behaviorPaths.base);
  let vwt = behaviors(behaviorPaths.vwt, 'vwt');
  let wl = behaviors(behaviorPaths.wl, 'wl');

  return merge(base, vwt, wl);
}

// Scripts for admin theme
function adminScripts() {
  return gulp.src(adminJs)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(cached('adminScripts'))
    .pipe(babel({
      presets: ['env'],
      plugins: ['transform-es2015-classes', 'transform-es2015-typeof-symbol']
    }))
    .pipe(uglify())
    .pipe(remember('adminScripts'))
    .pipe(concat('adminApp.js'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(`${paths.dest}/assets/scripts`));
}

function moduleScripts() {
  return gulp.src(modules)
  .pipe(plumber())
  .pipe(cached('moduleScripts'))
  .pipe(babel({
    presets: ['env'],
    plugins: ['transform-es2015-classes', 'transform-es2015-typeof-symbol']
  }))
  .pipe(uglify())
  .pipe(remember('moduleScripts'))
  .pipe(gulp.dest(`${paths.dest}/assets/scripts/modules`))
}

// JSHint
function jslint() {
  return gulp.src([`${paths.src}/components/**/*.js`])
    .pipe(plumber())
    .pipe(jshint('.jshintrc', {fail: true}))
    .pipe(jshint.reporter(stylish));
}

// SCSS
function styles() {
  function styles (theme) {
    return gulp.src([`${paths.src}/assets/styles${theme ? '/sub_themes/'+theme+'/' : '/'}*.scss`])
      .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
      .pipe(autoprefixer({
        browsers: ['ios >= 7', 'last 2 versions', 'ie >= 9']
      }))
      .pipe(gulpif(!isDevelopment, postcss(processors)))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(`${paths.dest}/assets/styles${theme ? '/sub_themes/'+theme : ''}`));
  }

  let base = styles();
  let vwt = styles('vwt');
  let wl = styles('wl');

  return merge(base, vwt, wl);
}

// SCSS Lint
function scssLint() {
  return gulp.src([
    `${paths.src}/assets/styles/config/*.scss`,
    `${paths.src}/assets/styles/helpers/*.scss`,
    `${paths.src}/assets/styles/layouts/*.scss`,
    `${paths.src}/assets/styles/*.scss`,
    `${paths.src}/components/**/*.scss`,
    `!${paths.src}/assets/styles/font-awesome.scss`,
  ])
    .pipe(sassLint({
      configFile: '.scss-lint.yml',
      formatter: 'stylish'
    }))
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError());
}

/* Create png sprite */
function sprites() {
  let currentDate = new Date().getTime();
  const spriteData =
  gulp.src(`${paths.src}/assets/sprite-png/*.*`)
    .pipe(spritesmith({
        retinaSrcFilter: `${paths.src}/assets/sprite-png/*@2x.png`,
        imgName: 'sprite.png',
        retinaImgName: 'sprite@2x.png',
        cssName: '_sprite-png.scss',
        algorithm: 'binary-tree',
        imgPath: `../sprite-png/sprite.png?v=${currentDate}`,
        retinaImgPath: `../sprite-png/sprite@2x.png?v=${currentDate}`,
        padding: 2
    }));

  const imgStream = spriteData.img
    .pipe(buffer())
    .pipe(gulp.dest(`${paths.dest}/assets/sprite-png/`));

  const cssStream = spriteData.css
    .pipe(gulp.dest(`${paths.src}/assets/styles/helpers/`));
  return merge(imgStream, cssStream);
}

/* Create svg sprite */
function spritesSvg() {
  return gulp.src(`${paths.src}/assets/sprite-svg/*.svg`)
    .pipe(svgSprite({
      mode: 'symbols',
      preview: false,
      svg: {
        symbols: `sprite.svg`
      }
    }))
    .pipe(gulp.dest(`${paths.dest}/assets/sprite-svg/`));
}

/* NODE JS COPY FILES */

function nodeUtilsJS() {
  return gulp.src(nodeFilesJS)
    .pipe(gulp.dest(`${paths.dest}/assets/scripts/node_utils/`));
}

// Watch
function watch() {
  serve();
  gulp.watch(`${paths.src}/assets/icons`, icons);
  gulp.watch(`${paths.src}/assets/images`, images);
  gulp.watch(`${paths.src}/assets/vectors`, vectors);
  gulp.watch(`${paths.src}/assets/integration_code`, integrationCode);
  gulp.watch(`${paths.src}/assets/fonts`, fonts);
  gulp.watch(`${paths.src}/assets/scripts`, assetsScripts);

  gulp.watch(behaviorPaths.base, behaviors).on('unlink', function(filepath) {
    remember.forget('behaviors', path.resolve(filepath));
    delete cached.caches.styles[path.resolve(filepath)];
  });

  gulp.watch(behaviorPaths.vwt, behaviors).on('unlink', function(filepath) {
    remember.forget('behaviorsvwt', path.resolve(filepath));
    delete cached.caches.styles[path.resolve(filepath)];
  });

  gulp.watch(behaviorPaths.wl, behaviors).on('unlink', function(filepath) {
    remember.forget('behaviorswl', path.resolve(filepath));
    delete cached.caches.styles[path.resolve(filepath)];
  });

  gulp.watch(`${paths.src}/**/*.admin.js`, adminScripts).on('unlink', function(filepath) {
    remember.forget('adminScripts', path.resolve(filepath));
    delete cached.caches.styles[path.resolve(filepath)];
  });

  gulp.watch([
    `${paths.src}/**/*.module.js`
  ], moduleScripts).on('unlink', function(filepath) {
    remember.forget('moduleScripts', path.resolve(filepath));
    delete cached.caches.styles[path.resolve(filepath)];
  });

  gulp.watch(`${paths.src}/assets/sprite-png/`, sprites);
  gulp.watch(`${paths.src}/assets/sprite-svg/*.svg`, spritesSvg);
  gulp.watch(`${paths.src}/**/*.scss`, styles);
}

// Task sets
const compile = gulp.series(nodeUtilsJS, gulp.parallel(meta, integrationCode, icons, images, vectors, fonts, modernizrbuild, assetsScripts, behaviors, adminScripts, moduleScripts, sprites, spritesSvg), styles);

gulp.task('start', gulp.series(clean, compile, serve));
gulp.task('build', gulp.series(clean, compile, build));
gulp.task('buildAssets', gulp.series(prepareBuildAssets, clean, compile));
gulp.task('dev', gulp.series(compile, watch));
gulp.task('publish', gulp.series(build, deploy));
gulp.task('lint', gulp.series(scssLint, jslint));
