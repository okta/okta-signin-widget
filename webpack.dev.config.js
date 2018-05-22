/* global module */

var common    = require('./webpack.common.config');
var plugins   = require('./buildtools/webpack/plugins');

var devConfig = common('okta-sign-in.js');
devConfig.devtool = '#inline-source-map';
devConfig.plugins = plugins({ isProduction: false });

module.exports = devConfig;
