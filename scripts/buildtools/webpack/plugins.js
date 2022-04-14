const { DefinePlugin, IgnorePlugin } = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

function webpackBundleAnalyzer(reportFilename = 'okta-sign-in.analyzer') {
  // OKTA-429162: webpack-bundle-analyzer does not report bundled modules stats after upgrade to webpack@5
  return new BundleAnalyzerPlugin({
    openAnalyzer: false,
    reportFilename: `${reportFilename}.html`,
    analyzerMode: 'static',
  });
}

// https://webpack.js.org/plugins/ignore-plugin/#example-of-ignoring-moment-locales
function emptyModule() {
  return new IgnorePlugin({
    resourceRegExp: /^\.\/locale$/,
    contextRegExp: /moment$/,
  });
}

function prodMode() {
  return new DefinePlugin({
    DEBUG: false
  });
}

function devMode() {
  return new DefinePlugin({
    DEBUG: true
  });
}

function failOnBuildFail() {
  const FailOnBuildPlugin = function() {};
  FailOnBuildPlugin.prototype.apply = function(compiler) {
    compiler.hooks.done.tap('Fail on build', (stats) => {

      // webpack 5.x and karma-webpack combo will fail to treat some missing assets as build failures
      // See https://oktainc.atlassian.net/browse/OKTA-253137
      if( stats.warnings.length || stats.errors.length ) {
        [
          ...stats.warnings,
          ...stats.errors,
        ].forEach(function( warning ) { console.error( warning ); });
        console.error('failOnBuildFail plugin Forcibly killing build because of webpack compile failure');
        throw new Error('Plugin failOnBuildFail forcing build abort');
      }
    });
  };
  return FailOnBuildPlugin;
}

function plugins(options = {}) {
  const { isProduction, skipAnalyzer } = options;
  const list = isProduction ? 
    [
      failOnBuildFail(),
      emptyModule(),
      prodMode(),
    ] : 
    // Use DEBUG/development environment w/ console warnings
    [
      failOnBuildFail(),
      emptyModule(),
      devMode(),
    ];

  if (!skipAnalyzer) {
    list.push(webpackBundleAnalyzer(options.analyzerFile));
  }

  return list;
}

module.exports = plugins;
