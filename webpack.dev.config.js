/* global module */

var common    = require('./webpack.common.config');
var plugins   = require('./buildtools/webpack/plugins');
var usePolyfill = require('./buildtools/webpack/polyfill');

module.exports = (env = {}) => {
  const { isProduction, skipAnalyzer } = env;

  const webpackConfig = {
    ...common('okta-sign-in.js'),
    plugins: plugins({ 
      isProduction,
      skipAnalyzer,
    })
  };
  usePolyfill(webpackConfig);
  return webpackConfig;
};
