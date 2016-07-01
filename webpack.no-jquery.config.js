var _ = require('underscore');
var prodConfig = require('./webpack.prod.config');

prodConfig.output.filename = 'okta-sign-in-no-jquery.js';

module.exports = _.extend(prodConfig, {
  externals: {
    jquery: {
      commonjs: 'jquery',
      commonjs2: 'jquery',
      amd: 'jquery',
      root: 'jQuery'
    }
  }
});
