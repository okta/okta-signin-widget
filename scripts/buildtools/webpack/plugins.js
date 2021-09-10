/*eslint camelcase: ["error", {properties: "never"}]*/

const { readFileSync } = require('fs');
const { join } = require('path');
const { DefinePlugin, BannerPlugin, IgnorePlugin } = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

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

function uglify() {
  return new UglifyJsPlugin({
    uglifyOptions: {
      compress: {
        // Drop all console.* and Logger statements
        drop_console: true,
        drop_debugger: true,
        pure_funcs: [
          'Logger.trace',
          'Logger.dir',
          'Logger.time',
          'Logger.timeEnd',
          'Logger.group',
          'Logger.groupEnd',
          'Logger.assert',
          'Logger.log',
          'Logger.info',
          'Logger.warn',
          'Logger.deprecate'
        ],
      },
      sourceMap: true,
      comments: (node, comment) => {
        // Remove other Okta copyrights
        const isLicense = /^!/.test(comment.value) ||
                        /.*(([Ll]icense)|([Cc]opyright)|(\([Cc]\))).*/.test(comment.value);
        const isOkta = /.*Okta.*/.test(comment.value);

        // Some licenses are in inline comments, rather than standard block comments.
        // UglifyJS2 treats consecutive inline comments as separate comments, so we
        // need exceptions to include all relevant licenses.
        const exceptions = [
          'Chosen, a Select Box Enhancer',
          'by Patrick Filler for Harvest',
          'Version 0.11.1',
          'Full source at https://github.com/harvesthq/chosen',

          'Underscore.js 1.8.3'
        ];

        const isException = exceptions.some(exception => {
          return comment.value.indexOf(exception) !== -1;
        });

        return (isLicense || isException) && !isOkta;
      },
      warnings: false
    }
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
    // Uglify and add license header
    [
      failOnBuildFail(),
      emptyModule(),
      prodMode(),
      uglify(),
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
