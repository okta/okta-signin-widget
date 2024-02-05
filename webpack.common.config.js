/* eslint-disable camelcase */
const { resolve, join } = require('path');
const { readFileSync } = require('fs');

const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const terserOptions = require('./scripts/buildtools/terser/config');

var SRC = resolve(__dirname, 'src');
var TARGET_JS = resolve(__dirname, 'target/js/');
var LOCAL_PACKAGES = resolve(__dirname, 'packages/');
var COURAGE_DIST = `${LOCAL_PACKAGES}/@okta/courage-dist/esm`;
var QTIP2_DIST = `${LOCAL_PACKAGES}/@okta/qtip2/dist`;

// Return a function so that all consumers get a new copy of the config
module.exports = function({
  entry,
  outputFilename,
  mode = 'development',
  engine = '',
  outputLibrary = 'OktaSignIn',
  outputLibraryTarget = 'umd',
  cdn = true
}) {

  // normalize entry so it is always an array
  entry = Array.isArray(entry) ? entry : [entry];

  const babelOptions = {
    configFile: false, // do not load from babel.config.js
    babelrc: false, // do not load from .babelrc
    sourceType: 'unambiguous',
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

  if (cdn) {
    babelOptions.plugins.push('add-module-exports');
  }

  const webpackConfig = {
    entry,
    mode,
    devtool: 'source-map',
    output: {
      path: TARGET_JS,
      filename: outputFilename,
      libraryTarget: outputLibraryTarget
    },
    resolve: {
      // conditionNames: ['import', 'browser'],
      extensions: ['.js', '.ts'],
      modules: [SRC, 'packages', 'node_modules'],
      alias: {
        // General remapping
        'nls': '@okta/i18n/src/json',
        // '@okta/courage': `${LOCAL_PACKAGES}/@okta/courage-dist`,
        '@okta/okta-i18n-bundles': 'util/Bundles',

        // Vendor files from courage that
        'handlebars/runtime': `${COURAGE_DIST}/lib/handlebars/dist/cjs/handlebars.runtime`,
        'handlebars$': `${COURAGE_DIST}/lib/handlebars/dist/cjs/handlebars.runtime`,

        '@okta/qtip': '@okta/qtip2/dist/jquery.qtip.js',
        'widgets/jquery.qtip': `${QTIP2_DIST}/jquery.qtip.css`,

        '@okta/duo': `${LOCAL_PACKAGES}/vendor/duo_web_sdk/index.js`,
        '@okta/typingdna': `${LOCAL_PACKAGES}/vendor/TypingDnaRecorder-JavaScript/typingdna`,
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
        },
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                url: false,
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  map: true,
                  plugins: [
                    ['autoprefixer', { remove: false }],
                    ...(mode === 'production' ? [
                      ['cssnano', { save: true }]
                    ] : [])  
                  ]
                }
              }
            },
            {
              loader: 'sass-loader',
              options: {
                sassOptions: {
                  includePaths: ['target/sass'],
                  outputStyle: 'expanded',
                }
              }
            }
            
          ],
        },
      ]
    },

    // Webpack attempts to add a polyfill for process
    // and setImmediate, because q uses process to see
    // if it's in a Node.js environment
    node: false,

    optimization: {}
  };

  if (outputLibrary) {
    webpackConfig.output.library = outputLibrary;
  }

  if (mode !== 'development') {
    const optimization = {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions,
          extractComments: {
            // `banner` config option is intended for a message pointing to file containing license info
            // we use it to place single Okta license banner
            banner: readFileSync(join(__dirname, './src/widget/copyright.txt'), 'utf8')
          }
        })
      ],
    };
    webpackConfig.optimization = optimization;
  }

  switch (engine) {
  case 'classic':
    webpackConfig.resolve.alias['@okta/okta-auth-js'] = '@okta/okta-auth-js/authn';
    break;
  case 'oie':
    webpackConfig.resolve.alias['@okta/okta-auth-js'] = '@okta/okta-auth-js/idx';
    break;
  }

  return webpackConfig;
};
