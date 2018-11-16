/* global module, __dirname */

var path          = require('path');
var commonConfig  = require('./webpack.common.config');
var createPlugins = require('./buildtools/webpack/plugins');
var testConfig    = commonConfig('main-tests.js');
var rootDir       = path.resolve(__dirname);
var RemoveStrictPlugin = require( 'remove-strict-webpack-plugin' );
var plugins = createPlugins({ isProduction: false });

plugins.unshift(new RemoveStrictPlugin());

testConfig.entry = null;
testConfig.output = null;
testConfig.devtool = 'inline-source-map';
testConfig.plugins = plugins;
Object.assign(testConfig.resolve.alias, {
  'sandbox': `${rootDir}/test/unit/helpers/sandbox`,
  'helpers': `${rootDir}/test/unit/helpers`
});
module.exports = testConfig;
