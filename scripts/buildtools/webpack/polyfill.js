module.exports = function usePolyfill(webpackConfig) {
  webpackConfig.entry.unshift('./polyfill/polyfill.js');
};
