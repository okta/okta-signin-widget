var path          = require('path');
var _             = require('underscore');
var commonConfig  = require('./webpack.common.config');
var testConfig    = commonConfig('main-tests.js');
var plugins       = require('./webpack.plugins.config');

testConfig.entry = ['babel-polyfill', './target/js/test/unit/main.js'];
testConfig.output.path = path.resolve(__dirname, 'target/test/unit');
testConfig.devtool = '#inline-source-map';
testConfig.plugins = [plugins.envPlugin('development')];

_.extend(testConfig.resolve.alias, {
  'sandbox': 'test/unit/helpers/sandbox',
  'helpers': 'test/unit/helpers'
});

module.exports = testConfig;
