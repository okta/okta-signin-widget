var useRuntime = require('./runtime');
module.exports = function usePolyfill(webpackConfig) {
  webpackConfig.entry.unshift('core-js/stable');
  webpackConfig.entry.unshift('regenerator-runtime/runtime');
  useRuntime(webpackConfig, { corejs: 3});
};
