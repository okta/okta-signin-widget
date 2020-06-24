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
var useRuntime = require('./buildtools/webpack/runtime');
var usePolyfill = require('./buildtools/webpack/polyfill');

// 1. entryConfig (node module main entry. minified, no polyfill, external dependencies)
var entryConfig = config('okta-sign-in.entry.js');
entryConfig.output.filename = 'okta-sign-in.entry.js';
entryConfig.externals = {
  'handlebars': {
    'commonjs': 'handlebars/dist/handlebars',
    'commonjs2': 'handlebars/dist/handlebars',
    'amd': 'handlebars',
    'root': 'handlebars'
  },
  'q': true,
  'u2f-api-polyfill': true,
  'underscore': true
};
entryConfig.plugins = plugins({ isProduction: true, analyzerFile: 'okta-sign-in.entry.analyzer' });
useRuntime(entryConfig);

// 2. noPolyfillConfig
var noPolyfillConfig = config('okta-sign-in.no-polyfill.min.js');
noPolyfillConfig.plugins = plugins({ isProduction: true, analyzerFile: 'okta-sign-in.no-polyfill.min.analyzer' });
useRuntime(noPolyfillConfig);

// 3. cdnConfig (with polyfill)
var cdnConfig = config('okta-sign-in.min.js');
cdnConfig.plugins = plugins({ isProduction: true, analyzerFile: 'okta-sign-in.min.analyzer' });
usePolyfill(cdnConfig);

// 4. noJqueryConfig
var noJqueryConfig = config('okta-sign-in-no-jquery.js');
noJqueryConfig.entry = cdnConfig.entry;
noJqueryConfig.plugins = plugins({ isProduction: true, analyzerFile: 'okta-sign-in-no-jquery.analyzer' });
noJqueryConfig.externals = {
  'jquery': {
    'commonjs': 'jquery',
    'commonjs2': 'jquery',
    'amd': 'jquery',
    'root': 'jQuery'
  }
};
useRuntime(noJqueryConfig);

// 5. devConfig (with polyfill, unminified)
var devConfig = config('okta-sign-in.js');
devConfig.plugins = plugins({ isProduction: false, analyzerFile: 'okta-sign-in.analyzer' });
usePolyfill(devConfig);

module.exports = [entryConfig, noPolyfillConfig, cdnConfig, noJqueryConfig, devConfig];
