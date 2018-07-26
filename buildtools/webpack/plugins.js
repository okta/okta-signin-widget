/* global module module, __dirname */
/*eslint camelcase: ["error", {properties: "never"}]*/

const { readFileSync } = require('fs');
const { join } = require('path');
const { DefinePlugin, BannerPlugin, optimize } = require('webpack');
const { some } = require('underscore');

const UglifyJsPlugin = optimize.UglifyJsPlugin;

function devMode() {
  return new DefinePlugin({
    DEBUG: true
  });
}

function uglify() {
  return new UglifyJsPlugin({
    compress: {
      warnings: false,
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

      const isException = some(exceptions, (exception) => {
        return comment.value.indexOf(exception) !== -1;
      });

      return (isLicense || isException) && !isOkta;
    }
  });
}

function banner() {
  // Add a single Okta license after removing others
  const license = readFileSync(join(__dirname, '../../src/widget/copyright.txt'), 'utf8');
  return new BannerPlugin(license);
}

function plugins(options = {}) {
  if (options.isProduction) {
    // Uglify and add license header
    return [ uglify(), banner() ];
  }
  // Use DEBUG/development environment w/ console warnings
  return [ devMode() ];
}

module.exports = plugins;
