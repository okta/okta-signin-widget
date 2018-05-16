/* global module */

var common    = require('./webpack.common.config');
var devConfig = common('okta-sign-in.js');
var plugins   = require('./buildtools/webpack/plugins');

devConfig.devtool = '#inline-source-map';
devConfig.plugins = plugins({ debug: true });

module.exports = devConfig;
