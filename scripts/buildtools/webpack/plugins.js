const { readFileSync } = require('fs');
const { join } = require('path');
const { DefinePlugin, BannerPlugin, IgnorePlugin } = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

function webpackBundleAnalyzer(reportFilename = 'okta-sign-in.analyzer') {
  return new BundleAnalyzerPlugin({
    openAnalyzer: false,
    reportFilename: `${reportFilename}.html`,
    analyzerMode: 'static',
  });
}
function emptyModule() {
  return new IgnorePlugin(/^\.\/locale$/, /moment$/);
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

function banner() {
  // Add a single Okta license after removing others
  const license = readFileSync(join(__dirname, '../../../src/widget/copyright.txt'), 'utf8');
  return new BannerPlugin(license);
}

function failOnBuildFail() {
  const FailOnBuildPlugin = function () {};
  FailOnBuildPlugin.prototype.apply = function(compiler) {
    compiler.hooks.done.tap('Fail on build', (stats) => {

      // webpack 3.x and karma-webpack combo will fail to treat seom missing assets as build failures
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
    // Add license header
    [
      failOnBuildFail(),
      emptyModule(),
      prodMode(),
      banner(),
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
