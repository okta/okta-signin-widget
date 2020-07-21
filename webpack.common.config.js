/* global module __dirname */

var path      = require('path');
var SRC = path.resolve(__dirname, 'src');
var TARGET_JS = path.resolve(__dirname, 'target/js/');
var LOCAL_PACKAGES = path.resolve(__dirname, 'packages/');

// Return a function so that all consumers get a new copy of the config
module.exports = function (outputFilename) {
  return {
    entry: [`${SRC}/widget/OktaSignIn.js`],
    devtool: 'source-map',
    output: {
      path: TARGET_JS,
      filename: outputFilename,
      library: 'OktaSignIn',
      libraryTarget: 'umd'
    },
    resolve: {
      modules: [SRC, 'packages', 'node_modules'],
      alias: {
        // General remapping
        'nls': '@okta/i18n/src/json',
        'okta': `${LOCAL_PACKAGES}/@okta/courage-dist/okta.js`,
        'okta-i18n-bundles': 'util/Bundles',
        'jquery': `${LOCAL_PACKAGES}/@okta/courage-dist/jquery.js`,
        'idx': `${LOCAL_PACKAGES}/@okta/idx-dist/idx.js`,

        // Vendor files from courage that are remapped in OSW to point to an npm
        // module in our package.json dependencies
        'handlebars/runtime': 'handlebars/dist/cjs/handlebars.runtime',
        'handlebars$': 'handlebars/dist/cjs/handlebars.runtime',
        'qtip': '@okta/qtip2/dist/jquery.qtip.min.js',

        'duo': 'duo_web_sdk/index.js',
        'typingdna': 'TypingDnaRecorder-JavaScript/typingdna',
      }
    },

    module: {
      rules: [
        // Babel
        {
          test: /\.js$/,
          exclude: function (filePath) {
            const filePathContains = (f) => filePath.indexOf(f) > 0;
            const npmRequiresTransform = [
              '/node_modules/parse-ms',
              '/node_modules/@sindresorhus/to-milliseconds'
            ].some(filePathContains);
            const shallBeExcluded = [
              '/node_modules/',
              'packages/@okta/courage-dist/jquery.js',
              'packages/@okta/qtip2'
            ].some(filePathContains);

            return shallBeExcluded && !npmRequiresTransform;

          },
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              './packages/@okta/babel-plugin-handlebars-inline-precompile',
              '@babel/plugin-transform-modules-commonjs'
            ]
          }
        },
        {
          test: /\.json$/,
          loader: 'json-loader'
        },
        // load external source maps
        {
          test: /\.js$/,
          use: ['source-map-loader'],
          enforce: 'pre'
        }
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
