var useRuntime = require('./runtime');
module.exports = function usePolyfill (webpackConfig) {
  webpackConfig.entry.unshift('@babel/polyfill'); // needed for IE
  useRuntime(webpackConfig, { corejs: 3});
};
