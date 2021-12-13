const Image = require("@11ty/eleventy-img");
const criticalCss = require("eleventy-critical-css");
const metagen = require("eleventy-plugin-metagen");
const fs = require('fs');
const schema = require("@quasibit/eleventy-plugin-schema");

async function imageShortcode(src, alt, sizes, cls='', loading="lazy", decoding="async") {
  let metadata = await Image(src, {
    widths: [24, 300, 400, 500, 600, 800],
    formats: ["webp"],
    outputDir: "./_site/static/img/",
    urlPath: "/static/img/"
  });

  let imageAttributes = {
    class:cls,
    alt,
    sizes,
    loading: loading,
    decoding: decoding,
  };

  return Image.generateHTML(metadata, imageAttributes);
}


module.exports = function(eleventyConfig) {

  eleventyConfig.setUseGitIgnore(false);
  eleventyConfig.addWatchTarget("./src/static/");
  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
  eleventyConfig.addTransform("htmlmin", require("./src/_utils/minify-html.js"));
  eleventyConfig.addPlugin(metagen);
  eleventyConfig.addPlugin(criticalCss);
  eleventyConfig.addPlugin(schema);

  // copy font
  eleventyConfig.addPassthroughCopy({
    "./node_modules/@fontsource/inter/files": "static/font/inter/files"
  });

  // copy images
  eleventyConfig.addPassthroughCopy({
    "src/static/img": "static/img"
  });

  // copy robots
  eleventyConfig.addPassthroughCopy({
    "src/robots.txt": "robots.txt"
  });


  return {
    dir: {
      input: "src",
      formats: "njk",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    templateFormats: ["md", "html", "njk", "11ty.js"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    passthroughFileCopy: true
  };

};
