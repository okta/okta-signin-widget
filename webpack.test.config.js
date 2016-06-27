var path    = require('path');
var _ = require('underscore');
var commonConfig = require('./webpack.common.config');

_.extend(commonConfig.resolve.alias, {
  'sandbox': 'test/helpers/sandbox',
  'helpers': 'test/helpers'
});

module.exports = _.extend(commonConfig, {
  entry: './target/js/test/main.js',
  output: {
    path: path.resolve(__dirname, 'dist/test'),
    filename: 'tests.js'
  },
  devtool: '#inline-source-map'
});
