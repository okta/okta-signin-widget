/* eslint-disable camelcase */
const { resolve, join } = require('path');
const { readFileSync } = require('fs');

const TerserPlugin = require('terser-webpack-plugin');
const terserOptions = require('./scripts/buildtools/terser/config');

var SRC = resolve(__dirname, 'src');
var TARGET_JS = resolve(__dirname, 'target/js/');
var LOCAL_PACKAGES = resolve(__dirname, 'packages/');
var COURAGE_DIST = `${LOCAL_PACKAGES}/@okta/courage-dist/esm`;

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

  // TODO: load query from browserlistrc
  const targets = mode === 'production' ? [
    '> 0.1%',
    'not opera < 69',
    'not firefox < 53',
    'not safari < 7.1',
    'not ie < 11',
    'not IE_Mob 11',
  ] : [
    'last 1 chrome version',
    'last 1 firefox version',
  ];

  // preset-env must run before preset-typescript https://github.com/babel/babel/issues/12066
  babelOptions.presets.unshift([
    '@babel/preset-env',
    {
      useBuiltIns: 'usage',
      corejs: 3,
      targets
    }
  ]); 

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
        // 'okta': `${LOCAL_PACKAGES}/@okta/courage-dist`,
        'okta-i18n-bundles': 'util/Bundles',

        // Vendor files from courage that
        'handlebars/runtime': `${COURAGE_DIST}/lib/handlebars/dist/cjs/handlebars.runtime`,
        'handlebars$': `${COURAGE_DIST}/lib/handlebars/dist/cjs/handlebars.runtime`,

        'qtip': '@okta/qtip2/dist/jquery.qtip.js',

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
