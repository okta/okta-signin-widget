/* global module */

var common    = require('./webpack.common.config');
var plugins   = require('./buildtools/webpack/plugins');

var devConfig = common('okta-sign-in.js');
devConfig.plugins = plugins({ isProduction: false });
devConfig.watch = true;

module.exports = devConfig;
