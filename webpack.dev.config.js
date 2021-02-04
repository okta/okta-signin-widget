/* global module */

var common    = require('./webpack.common.config');
var plugins   = require('./buildtools/webpack/plugins');
var usePolyfill = require('./buildtools/webpack/polyfill');

var path          = require('path');
const PLAYGROUND = path.resolve(__dirname, 'playground');


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
  Object.assign(webpackConfig.resolve.alias, {
    'duo': `${PLAYGROUND}/mocks/thirdparty/duo-mock.js`,
  });
  return webpackConfig;
};
