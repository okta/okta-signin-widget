/* global module, __dirname */

var path          = require('path');
var commonConfig  = require('./webpack.common.config');
var plugins       = require('./buildtools/webpack/plugins');
var testConfig    = commonConfig('main-tests.js');
var rootDir       = path.resolve(__dirname);

testConfig.entry = null;
testConfig.output = null;
testConfig.devtool = 'inline-source-map';
testConfig.plugins = plugins({ isProduction: false });
testConfig.resolve.root = [ `${rootDir}/src` ];
Object.assign(testConfig.resolve.alias, {
  'config/config': `${rootDir}/target/js/config/config.json`,
  'sandbox': `${rootDir}/test/unit/helpers/sandbox`,
  'helpers': `${rootDir}/test/unit/helpers`
});

module.exports = testConfig;
