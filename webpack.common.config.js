/* eslint-disable camelcase */
const { resolve, join } = require('path');
const { readFileSync } = require('fs');

const TerserPlugin = require('terser-webpack-plugin');

var SRC = resolve(__dirname, 'src');
var TARGET_JS = resolve(__dirname, 'target/js/');
var LOCAL_PACKAGES = resolve(__dirname, 'packages/');

// Return a function so that all consumers get a new copy of the config
module.exports = function(outputFilename, mode = 'development') {

  const babelOptions = {
    configFile: false, // do not load from babel.config.js
    babelrc: false, // do not load from .babelrc
    presets: [
      '@babel/preset-typescript',
    ],
    plugins: [
      './packages/@okta/babel-plugin-handlebars-inline-precompile',
      '@babel/plugin-transform-modules-commonjs',
    ],
    assumptions: {
      setPublicClassFields: true
    }
  };

  if (mode === 'production') {
    // preset-env must run before preset-typescript https://github.com/babel/babel/issues/12066
    babelOptions.presets.unshift('@babel/preset-env'); 
  } else {
    // In local development, we would prefer not to include any babel transforms as they make debugging more difficult
    // However, there is an issue with testcafe which requires us to include the optional chaining transform
    // https://github.com/DevExpress/testcafe-hammerhead/issues/2714
    babelOptions.plugins.unshift('@babel/plugin-proposal-optional-chaining');

    // acorn-hammerhead (testcafe) is currently unable to parse class fields, and will return the script unmodified
    // this will cause URLs to load outside the proxy and cause browser disconnect error
    babelOptions.plugins.unshift('@babel/plugin-proposal-class-properties');
  }

  return {
    entry: [`${SRC}/index.cjs.js`],
    mode,
    devtool: 'source-map',
    output: {
      path: TARGET_JS,
      filename: outputFilename,
      library: 'OktaSignIn',
      libraryTarget: 'umd'
    },
    resolve: {
      extensions: ['.js', '.ts'],
      modules: [SRC, 'packages', 'node_modules'],
      alias: {
        // General remapping
        'nls': '@okta/i18n/src/json',
        'okta': `${LOCAL_PACKAGES}/@okta/courage-dist/okta.js`,
        'okta-i18n-bundles': 'util/Bundles',

        // jQuery from courage
        'jquery': `${LOCAL_PACKAGES}/@okta/courage-dist/jquery.js`,

        // Vendor files from courage that are remapped in OSW to point to an npm
        // module in our package.json dependencies
        'handlebars/runtime': 'handlebars/dist/cjs/handlebars.runtime',
        'handlebars$': 'handlebars/dist/cjs/handlebars.runtime',
        'qtip': '@okta/qtip2/dist/jquery.qtip.min.js',

        'duo': `${LOCAL_PACKAGES}/vendor/duo_web_sdk/index.js`,
        'typingdna': `${LOCAL_PACKAGES}/vendor/TypingDnaRecorder-JavaScript/typingdna`,
      }
    },

    module: {
      rules: [
        // Babel
        {
          test: /\.[jt]s$/,
          exclude: function(filePath) {
            const filePathContains = (f) => filePath.indexOf(f) > 0;
            const npmRequiresTransform = [
              '/node_modules/parse-ms',
              '/node_modules/@sindresorhus/to-milliseconds'
            ].some(filePathContains);
            const shallBeExcluded = [
              '/node_modules/',
              'packages/@okta/courage-dist/jquery.js',
              'packages/@okta/qtip2',
              'okta-auth-js'
            ].some(filePathContains);

            return shallBeExcluded && !npmRequiresTransform;

          },
          loader: 'babel-loader',
          options: babelOptions
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
    node: false,

    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
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
            format: {
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
                return (isLicense || isException) && (!isOkta);
              },
            }
          },
          extractComments: {
            // `banner` config option is intended for a message pointing to file containing license info
            // we use it to place single Okta license banner
            banner: readFileSync(join(__dirname, './src/widget/copyright.txt'), 'utf8')
          }
        })
      ],
    },
  };
};
