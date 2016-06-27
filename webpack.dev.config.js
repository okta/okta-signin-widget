var _ = require('underscore');
var commonConfig = require('./webpack.common.config');

module.exports = _.extend(commonConfig, {
  devtool: '#inline-source-map'
});
