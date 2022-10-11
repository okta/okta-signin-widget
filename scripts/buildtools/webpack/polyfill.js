module.exports = function usePolyfill(webpackConfig) {
  webpackConfig.entry.unshift('./polyfill/index.js');
};
