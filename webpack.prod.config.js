var webpack = require('webpack');
var fs      = require('fs');
var commonConfig = require('./webpack.common.config');

var license = fs.readFileSync('src/widget/copyright.txt', 'utf8');

commonConfig.plugins = commonConfig.plugins.concat([
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    },
    sourceMap: false,
    comments: function(node, comment) {
      // Remove other Okta copyrights
      var isLicense = /^!/.test(comment.value);
      var isOkta = /.*Okta.*/.test(comment.value);
      return isLicense && !isOkta;
    }
  }),

  // Add a single Okta license after removing others
  new webpack.BannerPlugin(license)
]);

module.exports = commonConfig;
