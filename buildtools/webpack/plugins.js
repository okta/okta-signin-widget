/* global module module */
/*eslint camelcase: ["error", {properties: "never"}]*/

var fs      = require('fs');
var webpack = require('webpack');
var _       = require('underscore');

var license = fs.readFileSync('src/widget/copyright.txt', 'utf8');

var devMode = function(mode = true) {
  return new webpack.DefinePlugin({
    DEBUG: mode
  });
};

var uglify = function() {
  return new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false,
      // Drop all console.* and Logger statements
      drop_console: true,
      drop_debugger: true,
      pure_funcs: [
        'Logger.warn',
        'Logger.deprecate'
      ],
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
};

var banner = function(license) {
  // Add a single Okta license after removing others
  return new webpack.BannerPlugin(license);
};

function plugin(options = {}) {
  var plugins = [];
  if (options.uglify) {
    plugins = [
      uglify(),
      // Automatically add license header to uglified file
      banner(license)
    ];
  }
  if (options.debug) {
    // Use DEBUG/development environment w/ console warnings
    plugins.push(devMode());
  } else {
    // Use default for production mode
    plugins.push(devMode(false));
  }
  return plugins;
}

module.exports = plugin;
