/* global module, __dirname */

var path          = require('path');
var _             = require('underscore');
var commonConfig  = require('./webpack.common.config');
var plugins       = require('./buildtools/webpack/plugins');
var testConfig    = commonConfig('main-tests.js');


testConfig.entry = ['babel-polyfill', './target/js/test/unit/main.js'];
testConfig.output.path = path.resolve(__dirname, 'target/test/unit');
testConfig.devtool = '#inline-source-map';
testConfig.plugins = plugins({ isProduction: false });

_.extend(testConfig.resolve.alias, {
  'sandbox': 'test/unit/helpers/sandbox',
  'helpers': 'test/unit/helpers'
});

module.exports = testConfig;
