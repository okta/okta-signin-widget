/* global module __dirname */

var path      = require('path');
var TARGET_JS = path.resolve(__dirname, 'target/js/');
var LOCAL_PACKAGES = path.resolve(__dirname, 'packages/');

// Return a function so that all consumers get a new copy of the config
module.exports = function (outputFilename) {
  return {
    entry: ['./target/js/widget/OktaSignIn.js'],
    devtool: 'source-map',
    output: {
      path: TARGET_JS,
      filename: outputFilename,
      library: 'OktaSignIn',
      libraryTarget: 'umd'
    },
    resolve: {
      root: [TARGET_JS],
      modulesDirectories: ['node_modules', 'packages'],
      alias: {
        // General remapping
        'nls': '@okta/i18n/dist/json',
        'okta': LOCAL_PACKAGES + '/@okta/courage-for-signin-widget.js',
        'shared/util/Bundles': 'util/Bundles',

        // Vendor files from courage that are remapped in OSW to point to an npm
        // module in our package.json dependencies
        'vendor/lib/q': 'q',
        'handlebars': 'handlebars/dist/handlebars',
        'qtip': '@okta/qtip2',

        // Duo has an npm module, but the latest version does not expose the
        // v2 version. Continue to use the vendor file that is checked into
        // source.
        'duo': 'vendor/Duo-Web-v2.6',
        'moment': TARGET_JS + '/widget/empty.js',
      }
    },

    module: {
      loaders: [
        // Babel
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          query: {
            presets: ['env'],
            plugins: ['transform-runtime']
          }
        },
      ]
    },

    // Webpack attempts to add a polyfill for process
    // and setImmediate, because q uses process to see
    // if it's in a Node.js environment
    node: {
      process: false,
      setImmediate: false
    }
  };
};
