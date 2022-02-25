var common    = require('./webpack.common.config');
var plugins   = require('./scripts/buildtools/webpack/plugins');
var usePolyfill = require('./scripts/buildtools/webpack/polyfill');
var path       = require('path');
var PLAYGROUND = path.resolve(__dirname, 'playground');

module.exports = (env = {}) => {
  const { isProduction, skipAnalyzer } = env;

  const webpackConfig = {
    ...common('okta-sign-in.js'),
    plugins: plugins({
      isProduction,
      skipAnalyzer,
    })
  };


  if (isProduction) {
    // development bundle does not include runtime transforms
    usePolyfill(webpackConfig);
  } else {
    webpackConfig.optimization.minimize = false;
  }

  if (env.mockDuo) {
    console.log('======> Mocking Duo iFrame');  // eslint-disable-line no-console
    Object.assign(webpackConfig.resolve.alias, {
      'duo': `${PLAYGROUND}/mocks/spec-duo/duo-mock.js`,
    });
  }

  return webpackConfig;
};
