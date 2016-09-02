var path    = require('path');
var _ = require('underscore');
var commonConfig = require('./webpack.common.config');

_.extend(commonConfig.resolve.alias, {
  'sandbox': 'test/unit/helpers/sandbox',
  'helpers': 'test/unit/helpers'
});

module.exports = _.extend(commonConfig, {
  entry: './target/js/test/unit/main.js',
  output: {
    path: path.resolve(__dirname, 'target/test/unit'),
    filename: 'main-tests.js'
  },
  devtool: '#inline-source-map'
});
