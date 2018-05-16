// The release webpack config exports four configs:
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
// 4. devConfig - generates okta.sign-in.js, which is a non-minified version of
//    the widget that contains helpful warning messages and includes everything
//    necessary to run (including all vendor libraries).

/* global module */
var config  = require('./webpack.common.config');
var plugins = require('./buildtools/webpack/plugins');

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
  'u2f-api-polyfill': true,
  'underscore': true,
  'vendor/lib/q': 'q'

  // We explicitly choose not to include jquery.placeholder in the externals
  // array because it requires a shim (requires work in their webpack.config).
  // 'vendor/plugins/jquery.placeholder': 'jquery-placeholder'

  // Chosen is also another special case - because we're currently modifying
  // some of the chosen code, we cannot include it as an npm dependency.
};
// Add transform-runtime
entryConfig.module.loaders = entryConfig.module.loaders || [];
const loader = entryConfig.module.loaders.find(item =>
  item.loader === 'babel-loader');
if (loader) {
  loader.query.plugins = loader.query.plugins || [];
  loader.query.plugins.push('transform-runtime');
}

// 2. cdnConfig
var cdnConfig = config('okta-sign-in.min.js');
cdnConfig.entry.unshift('babel-polyfill');
cdnConfig.plugins = plugins({
  uglify: true
});

// 3. noJqueryConfig
var noJqueryConfig = config('okta-sign-in-no-jquery.js');
noJqueryConfig.entry = cdnConfig.entry;
noJqueryConfig.plugins = cdnConfig.plugins;
noJqueryConfig.externals = {
  'jquery': {
    'commonjs': 'jquery',
    'commonjs2': 'jquery',
    'amd': 'jquery',
    'root': 'jQuery'
  }
};

// 4. devConfig
var devConfig = config('okta-sign-in.js');
devConfig.entry.unshift('babel-polyfill');
devConfig.plugins = plugins({
  debug: true
});

module.exports = [entryConfig, cdnConfig, noJqueryConfig, devConfig];
