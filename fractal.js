const paths = {
  build: `${__dirname}/build`,
  src: `${__dirname}/src`,
  static: `${__dirname}/tmp`
};

const fractal = require('@frctl/fractal').create();
const twigAdapter = require('fractal-twig-drupal-adapter');
const twig = twigAdapter({
  handlePrefix: `@`,
});

const mandelbrot = require('@frctl/mandelbrot')({
  favicon: `/assets/icons/favicon.ico`,
  lang: 'en-gb',
  styles: ['default', '/assets/styles/theme.css'],
  static: {
    mount: 'fractal'
  },
  nav: ['components'],
  scripts: ['default', '/assets/scripts/layout/search-component.js']
});

const mdAbbr = require('markdown-it-abbr');
const mdFootnote = require('markdown-it-footnote');
const md = require('markdown-it')({
  html: true,
  xhtmlOut: true,
  typographer: true
}).use(mdAbbr).use(mdFootnote);
// const nunjucksDate = require('nunjucks-date');
// const nunjucks = require('@frctl/nunjucks')({
//   filters: {
//     date: nunjucksDate,
//     markdown(str) {
//       return md.render(str);
//     },
//     markdownInline(str) {
//       return md.renderInline(str);
//     },
//     slugify(str) {
//       return str.toLowerCase().replace(/[^\w]+/g, '');
//     },
//     stringify() {
//       return JSON.stringify(this, null, '\t');
//     }
//   },
//   paths: [`${paths.static}/assets/vectors`]
// });

// Cache variable
const defaultQueryString = new Date().getTime();

// Project config
fractal.set('project.title', 'Fractal');

// Components config
fractal.components.engine(twig);
fractal.components.set('default.preview', '@preview');
fractal.components.set('default.status', null);
fractal.components.set('ext', '.twig');
fractal.components.set('path', `${paths.src}/components`);
fractal.components.set('default.context', {
  fractal: true,
  theme_path: '../..',
  default_query_string: defaultQueryString
});

// Docs config
fractal.docs.set('path', `${paths.src}/docs`);


// Web UI config
fractal.web.theme(mandelbrot);
fractal.web.set('static.path', paths.static);
fractal.web.set('builder.dest', paths.build);
fractal.web.set('builder.ext', '.html');
fractal.web.set('builder.urls.ext', '.html');

// Export config
module.exports = fractal;
