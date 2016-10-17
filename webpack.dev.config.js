var common = require('./webpack.common.config');
var devConfig = common('okta-sign-in.js');
devConfig.devtool = '#inline-source-map';
module.exports = devConfig;

