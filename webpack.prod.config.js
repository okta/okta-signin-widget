var webpack = require('webpack');
var fs      = require('fs');
var commonConfig = require('./webpack.common.config');
var _ = require('underscore');

var license = fs.readFileSync('src/widget/copyright.txt', 'utf8');

commonConfig.plugins = commonConfig.plugins.concat([
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    },
    sourceMap: false,
    comments: function(node, comment) {
      // Remove other Okta copyrights
      var isLicense = /^!/.test(comment.value) ||
                      /.*(([Ll]icense)|([Cc]opyright)|(\([Cc]\))).*/.test(comment.value);
      var isOkta = /.*Okta.*/.test(comment.value);

      // Some licenses are in inline comments, rather than standard block comments.
      // UglifyJS2 treats consecutive inline comments as separate comments, so we 
      // need exceptions to include all relevant licenses.
      var exceptions = [
        'XDomain - v0.7.5 - https://github.com/jpillora/xdomain',

        'XHook - v1.3.5 - https://github.com/jpillora/xhook',

        'Chosen, a Select Box Enhancer',
        'by Patrick Filler for Harvest',
        'Version 0.11.1',
        'Full source at https://github.com/harvesthq/chosen',

        'Underscore.js 1.8.3'
      ];

      var isException = _.some(exceptions, function(exception) {
        return comment.value.indexOf(exception) !== -1;
      });

      return (isLicense || isException) && !isOkta;
    }
  }),

  // Add a single Okta license after removing others
  new webpack.BannerPlugin(license)
]);

module.exports = commonConfig;
