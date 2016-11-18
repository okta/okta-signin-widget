// The release webpack config exports three configs:
// 1. entryConfig - generates okta-sign-in.entry.js, a non-minified built
//    version of the widget that does not include any vendor dependencies. This
//    is meant to be imported through a require() statement using webpack or
//    browserify.
// 2. cdnConfig - generates okta.sign-in.min.js, a minified built version of the
//    widget that includes everything necessary to run (including all vendor
//    libraries)
// 3. noJqueryConfig - generates okta.sign-in.no-jquery.js, which is used by
//    our own internal login flow. We can remove this once we update loginpage
//    to use webpack.

var webpack = require('webpack');
var fs      = require('fs');
var _       = require('underscore');
var config  = require('./webpack.common.config');

// 1. entryConfig
var entryConfig = config('okta-sign-in.entry.js');
entryConfig.output.filename = 'okta-sign-in.entry.js';
entryConfig.externals = {
  '@okta/okta-auth-js/jquery': true,
  'backbone': true,
  'jquery': {
    'commonjs': 'jquery',
    'commonjs2': 'jquery',
    'amd': 'jquery',
    'root': 'jQuery'
  },
  'jquery.cookie': true,
  'handlebars': {
    'commonjs': 'handlebars/dist/handlebars',
    'commonjs2': 'handlebars/dist/handlebars',
    'amd': 'handlebars',
    'root': 'handlebars'
  },
  'q': true,
  'qtip': 'qtip2',
  'u2f-api-polyfill': true,
  'underscore': true,
  'vendor/lib/q': 'q'

  // We explicitly choose not to include jquery.placeholder in the externals
  // array because it requires a shim (requires work in their webpack.config).
  // 'vendor/plugins/jquery.placeholder': 'jquery-placeholder'

  // Chosen is also another special case - because we're currently modifying
  // some of the chosen code, we cannot include it as an npm dependency.
};

// 2. cdnConfig
var license = fs.readFileSync('src/widget/copyright.txt', 'utf8');
var cdnConfig = config('okta-sign-in.min.js');
cdnConfig.plugins = [
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
];

// 3. noJqueryConfig
var noJqueryConfig = config('okta-sign-in-no-jquery.js');
noJqueryConfig.plugins = cdnConfig.plugins;
noJqueryConfig.externals = {
  'jquery': {
    'commonjs': 'jquery',
    'commonjs2': 'jquery',
    'amd': 'jquery',
    'root': 'jQuery'
  }
};

module.exports = [entryConfig, cdnConfig, noJqueryConfig];
