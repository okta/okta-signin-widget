var webpack = require('webpack');
var _       = require('underscore');

var plugins = {
  envPlugin: function(type) {
    // Sepecify which environment variables
    return new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(type)
      }
    });
  },

  uglify: function() {
    return new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      sourceMap: true,
      comments: function(node, comment) {
        // Remove other Okta copyrights
        var isLicense = /^!/.test(comment.value) ||
                        /.*(([Ll]icense)|([Cc]opyright)|(\([Cc]\))).*/.test(comment.value);
        var isOkta = /.*Okta.*/.test(comment.value);

        // Some licenses are in inline comments, rather than standard block comments.
        // UglifyJS2 treats consecutive inline comments as separate comments, so we
        // need exceptions to include all relevant licenses.
        var exceptions = [
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
    });
  },

  banner: function(license) {
    // Add a single Okta license after removing others
    return new webpack.BannerPlugin(license);
  }
};

module.exports = plugins;
