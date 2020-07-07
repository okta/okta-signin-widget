/* global module, __dirname */

var path          = require('path');
var commonConfig  = require('./webpack.common.config');
var createPlugins = require('./buildtools/webpack/plugins');
var useRuntime = require('./buildtools/webpack/runtime');
var testConfig    = commonConfig('main-tests.js');
var rootDir       = path.resolve(__dirname);
var RemoveStrictPlugin = require( 'remove-strict-webpack-plugin' );
var plugins = createPlugins({ isProduction: false });
var webpack = require('webpack');
var SDK_VERSION = require('@okta/okta-auth-js').SDK_VERSION;

plugins.unshift(new RemoveStrictPlugin());

plugins.push(new webpack.DefinePlugin({
  SDK_VERSION: JSON.stringify(SDK_VERSION)
}));

testConfig.module.rules.push({
  test: /\.js$/,
  use: ['source-map-loader'],
  enforce: 'pre'
});

testConfig.entry = null;
testConfig.output = null;
testConfig.devtool = 'inline-source-map';
testConfig.plugins = plugins;
Object.assign(testConfig.resolve.alias, {
  'sandbox': `${rootDir}/test/unit/helpers/sandbox`,
  'helpers': `${rootDir}/test/unit/helpers`
});

useRuntime(testConfig);

module.exports = testConfig;
