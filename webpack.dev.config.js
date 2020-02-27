/* global module */

var common    = require('./webpack.common.config');
var plugins   = require('./buildtools/webpack/plugins');

module.exports = (env = {}) => {
  const { isProduction, skipAnalyzer } = env;

  return {
    ...common('okta-sign-in.js'),
    plugins: plugins({ 
      isProduction,
      skipAnalyzer,
    })
  };
};
