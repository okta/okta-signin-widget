var common    = require('./webpack.common.config');
var devConfig = common('okta-sign-in.js');
var plugins   = require('./webpack.plugins.config');

devConfig.devtool = '#inline-source-map';
devConfig.plugins = [plugins.envPlugin('development')];

module.exports = devConfig;
