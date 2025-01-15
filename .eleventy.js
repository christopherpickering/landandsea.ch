const Image = require('@11ty/eleventy-img');
const metagen = require('eleventy-plugin-metagen');
const fs = require('fs');
const schema = require('@quasibit/eleventy-plugin-schema');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const pluginNavigation = require('@11ty/eleventy-navigation');
const { DateTime } = require('luxon');
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const editOnGithub = require('eleventy-plugin-edit-on-github');
const esbuild = require('esbuild');

async function imageShortcode(
  src,
  alt,
  sizes,
  cls = '',
  loading = 'lazy',
  decoding = 'async',
) {
  const metadata = await Image(src, {
    widths: [24, 300, 400, 500, 600, 800],
    formats: ['webp'],
    outputDir: './_site/static/img/',
    urlPath: '/static/img/',
  });

  const imageAttributes = {
    class: cls,
    alt,
    sizes,
    loading: loading,
    decoding: decoding,
  };

  return Image.generateHTML(metadata, imageAttributes);
}

module.exports = (eleventyConfig) => {
  eleventyConfig.on('eleventy.before', async () => {
    await esbuild.build({
      entryPoints: ['src/static/js/index.js'],
      bundle: true,
      outfile: '_site/static/js/bundle.js',
      sourcemap: true,
      //target: ["chrome58", "firefox57", "safari11", "edge16"],
    });
  });

  eleventyConfig.setUseGitIgnore(false);
  eleventyConfig.addWatchTarget('./src/static/');
  eleventyConfig.addWatchTarget('./styles/global.css');
  eleventyConfig.addNunjucksAsyncShortcode('image', imageShortcode);
  eleventyConfig.addTransform(
    'htmlmin',
    require('./src/_utils/minify-html.js'),
  );
  eleventyConfig.addPlugin(metagen);
  eleventyConfig.addPlugin(schema);
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginNavigation);
  eleventyConfig.addPlugin(syntaxHighlight, {
    preAttributes: {
      class: ({ language }) => `rounded language-${language || 'plain'}`,
    },
  });
  eleventyConfig.addPlugin(editOnGithub, {
    // required
    github_edit_repo: 'https://github.com/christopherpickering/going-bg',
    // optional: defaults
    github_edit_branch: 'master',
    github_edit_text: 'Edit on Github', // html accepted
    github_edit_class: 'edit-on-github',
    github_edit_tag: 'a',
    github_edit_attributes: 'target="_blank" rel="noopener"',
    github_edit_wrapper: undefined, //ex: "<div stuff>${edit_on_github}</div>"
  });

  eleventyConfig.addShortcode('version', () => String(Date.now()));
  // copy font
  eleventyConfig.addPassthroughCopy({
    './node_modules/@fontsource/inter/files': 'static/font/inter/files',
  });

  // copy images
  eleventyConfig.addPassthroughCopy({
    'src/static/img': 'static/img',
  });

  // copy robots
  eleventyConfig.addPassthroughCopy({
    'src/robots.txt': 'robots.txt',
  });

  eleventyConfig.addPassthroughCopy({
    'src/favicon.ico': 'favicon.ico',
  });

  eleventyConfig.addFilter('old', (dateObj) => {
    var oldDate = new Date(dateObj);
    var todayDate = new Date();
    return (todayDate - oldDate) / (1000 * 3600 * 24 * 365) > 1;
  });

  // https://github.com/11ty/eleventy-base-blog/blob/master/.eleventy.js
  eleventyConfig.addFilter('readableDate', (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat(
      'LLL dd, yyyy',
    );
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('yyyy-LL-dd');
  });

  // Return the smallest number argument
  eleventyConfig.addFilter('min', (...numbers) => {
    return Math.min.apply(null, numbers);
  });

  function filterTagList(tags) {
    return (tags || [])
      .filter((tag) => ['all', 'nav', 'post', 'posts'].indexOf(tag) === -1)
      .sort((a, b) => a - b);
  }

  eleventyConfig.addFilter('filterTagList', filterTagList);

  // Create an array of all tags
  eleventyConfig.addCollection('tagList', (collection) => {
    const tagSet = new Set();
    collection.getAll().forEach((item) => {
      (item.data.tags || []).forEach((tag) => tagSet.add(tag));
    });

    return filterTagList([...tagSet]);
  });

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter('head', (array, n) => {
    if (!Array.isArray(array) || array.length === 0) {
      return [];
    }
    if (n < 0) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  const mapping = {
    h1: 'text-2xl font-light text-slate-800 py-3 dark:text-slate-200',
    h2: 'text-xl font-light text-slate-800 py-3 dark:text-slate-200',
    h3: 'text-lg font-light text-slate-800 py-3 dark:text-slate-200',
    h4: 'font-light text-slate-800 py-3 dark:text-slate-200',
    h5: 'font-light text-slate-800 py-3 dark:text-slate-200',
    h6: 'font-light text-slate-800 py-3 dark:text-slate-200',
    p: 'py-3',
    table: 'table',
    pre: 'rounded',
    blockquote: 'rounded p-4 border',
  };

  // Customize Markdown library and settings:
  const markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
  })
    .use(markdownItAnchor, {
      permalink: markdownItAnchor.permalink.linkInsideHeader({
        placement: 'before',
        class: 'text-blue-600 dark:text-blue-200',
        symbol: '∞',
        level: [2, 3, 4, 5],
      }),
      slugify: eleventyConfig.getFilter('slug'),
    })
    .use(require('@toycode/markdown-it-class'), mapping)
    .use(require('markdown-it-div'), 'div', {})
    .use(require('markdown-it-imsize'), { autofill: true });

  eleventyConfig.setLibrary('md', markdownLibrary);

  // Override Browsersync defaults (used only with --serve)
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: (err, browserSync) => {
        const content_404 = fs.readFileSync('_site/404.html');

        browserSync.addMiddleware('*', (req, res) => {
          // Provides the 404 content without redirect.
          res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
          res.write(content_404);
          res.end();
        });
      },
    },
    ui: false,
    ghostMode: false,
  });

  return {
    dir: {
      input: 'src',
      formats: 'njk',
      includes: '_includes',
      data: '_data',
      output: '_site',
    },
    templateFormats: ['md', 'html', 'njk', '11ty.js', 'MD'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    passthroughFileCopy: true,
  };
};
