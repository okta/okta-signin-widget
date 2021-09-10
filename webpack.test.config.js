var path          = require('path');
var commonConfig  = require('./webpack.common.config');
var createPlugins = require('./scripts/buildtools/webpack/plugins');
var useRuntime = require('./scripts/buildtools/webpack/runtime');
var testConfig    = commonConfig('main-tests.js');
var rootDir       = path.resolve(__dirname);
var plugins = createPlugins({ isProduction: false });
var webpack = require('webpack');
var SDK_VERSION = require('@okta/okta-auth-js').SDK_VERSION; // Maintain CommonJS require for Node.js

plugins.push(new webpack.DefinePlugin({
  SDK_VERSION: JSON.stringify(SDK_VERSION)
}));

testConfig.module.rules.push({
  test: /\.js$/,
  use: ['source-map-loader'],
  enforce: 'pre'
});

testConfig.entry = {}; // required by webpack config validation schema
testConfig.devtool = 'inline-source-map';
testConfig.plugins = plugins;
Object.assign(testConfig.resolve.alias, {
  'sandbox': `${rootDir}/test/unit/helpers/sandbox`,
  'helpers': `${rootDir}/test/unit/helpers`
});

useRuntime(testConfig);

module.exports = testConfig;
