const luxon = require('luxon');
const cleanCss = require('clean-css');
const uglifyEs = require('uglify-es');
const htmlMin = require('html-minifier');
const slugify = require('slugify');
const eleventyNavigation = require('@11ty/eleventy-navigation');
const eleventyLazyImages = require('eleventy-plugin-lazyimages');
const eleventySyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
let markdownIt = require('markdown-it');
let markdownItAnchor = require('markdown-it-anchor');

module.exports = function (eleventyConfig) {
  // TODO: add pass through copies of static files?
  eleventyConfig.addPassthroughCopy('src/assets');

  eleventyConfig.addPlugin(eleventySyntaxHighlight);
  eleventyConfig.addPlugin(eleventyNavigation);
  eleventyConfig.addPlugin(eleventyLazyImages, {
    transformImgPath: (imgPath) => imgPath.startsWith('http://') || imgPath.startsWith('https://') ? imgPath : `./src/${imgPath}`
  });

  eleventyConfig.addTransform('minifyHtml', (code, outputPath) => {
    if (outputPath.endsWith('.html')) {
      const minified = htmlMin.minify(code, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
        minifyJS: true
      });
      return minified;
    }
    return code;
  });

  eleventyConfig.addFilter('minifyCss', code => new cleanCss({}).minify(code).styles);
  eleventyConfig.addFilter('minifyJs', code => {
    let minified = uglifyEs.minify(code);
    if (minified.error) {
      console.log('Uglify ES error: ', minified.error);
      return code;
    }
    return minified.code;
  });
  eleventyConfig.addFilter('slugify', string => slugify(string, {
    lower: true,
    replacement: '-',
    remove: /[*+~.·,()'"`´%!?¿:@]/g
  }));

  const md = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  })
    .use(markdownItAnchor, {permalink: false});
  eleventyConfig.setLibrary('md', md);
  eleventyConfig.addFilter('markdownify', markdownString => md.render(markdownString));

  return {
    templateFormats: ['md', 'njk', 'html', 'liquid'],
    markdownTemplateEngine: 'liquid',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    dir: {
      input: 'src',
      includes: '_includes',
      output: '_site',
      data: '_data'
    },
  };
};
