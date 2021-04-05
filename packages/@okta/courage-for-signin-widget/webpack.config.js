/* global module __dirname */
const { resolve } = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { BannerPlugin } = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ReplacePlugin = require('webpack-plugin-replace');
const PACKAGE_JSON = require('./package.json');

const EMPTY = resolve(__dirname, 'src/empty');
const NODE_MODULES_SRC = resolve(__dirname, 'node_modules/@okta');
const NODE_MODULES_DEST = resolve(__dirname, '..');
const SHARED_JS = resolve(NODE_MODULES_SRC, 'courage/src');
const COURAGE_DIST = resolve(NODE_MODULES_SRC, 'courage/dist');
const PUBLISH_DIR = resolve(NODE_MODULES_DEST, 'courage-dist');
const I18N_DIR = resolve(NODE_MODULES_DEST, 'i18n');
const DIST_FILE_NAME = 'okta';

const EXTERNAL_PATHS = [
  'jquery',
  'qtip',
  'backbone',
  'underscore',
  'handlebars',
  'handlebars/runtime',
  'okta-i18n-bundles'
];

const webpackConfig = {
  entry: ['./src/CourageForSigninWidget.js'],
  devtool: 'source-map',
  output: {
    // why the destination is outside current directory?
    // turns out node_modules in current directory will hoist
    // node_modules at root directory.
    path: PUBLISH_DIR,
    filename: `${DIST_FILE_NAME}.js`,
    libraryTarget: 'commonjs2'
  },
  externals: EXTERNAL_PATHS,
  resolve: {
    alias: {

      // jsons is from StringUtil
      'vendor/lib/json2': EMPTY,

      // util/handlebars-wrapper -> moment
      // It's used for formatting date in handlebar template.
      // signin-widget doesn't use that feature hence it's safe to comment out.
      // Could be removed when upgrade courage to latest version from which
      // we would explicitly import handlebar plugins in main file.
      'moment': EMPTY,

      // simplemodal is from dependency chain:
      //   BaseRouter -> ConfirmationDialog -> BaseFormDialog -> BaseModalDialog -> simplemodal
      'vendor/plugins/jquery.simplemodal': EMPTY,

      // util/BaseRouter -> ConfirmationDialog
      'ConfirmationDialog': EMPTY,

      'vendor': SHARED_JS + '/vendor',
    }
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: function (filePath) {
          const filePathContains = (f) => filePath.indexOf(f) > 0;
          const npmRequiresTransform = [
            '/node_modules/@okta/courage',
          ].some(filePathContains);
          const shallBeExcluded = [
            '/node_modules/',
          ].some(filePathContains);
          return shallBeExcluded && !npmRequiresTransform;
        },
        loader: 'babel-loader',
        query: {
          presets: [['@babel/preset-env', { modules: 'commonjs' }]],
          plugins: [
            '@okta/babel-plugin-handlebars-inline-precompile',
            'add-module-exports'
          ]
        }
      },
    ]
  },

  plugins: [
    new BannerPlugin(`THIS FILE IS GENERATED FROM PACKAGE @okta/courage@${PACKAGE_JSON.devDependencies['@okta/courage']}`),
    new BundleAnalyzerPlugin({
      openAnalyzer: false,
      reportFilename: `${DIST_FILE_NAME}.html`,
      analyzerMode: 'static',
    }),
    new CopyWebpackPlugin([
      {
        from: `${NODE_MODULES_SRC}/babel-plugin-handlebars-inline-precompile`,
        to: `${NODE_MODULES_DEST}/babel-plugin-handlebars-inline-precompile`
      },
      {
        from: `${NODE_MODULES_SRC}/eslint-plugin-okta-ui/lib/rules/no-bare-templates.js`,
        to: `${NODE_MODULES_DEST}/eslint-plugin-okta-ui/lib/rules/no-bare-templates.js`,
      },
      {
        from: `${SHARED_JS}/vendor/lib/jquery-1.12.4.js`,
        to: `${PUBLISH_DIR}/jquery.js`,
        toType: 'file',
      },
      {
        from: `${COURAGE_DIST}/properties/country.properties`,
        to: `${I18N_DIR}/dist/properties/country.properties`,
      },
      {
        context: `${COURAGE_DIST}/properties/translations/`,
        from: 'country_*.properties',
        to: `${I18N_DIR}/dist/properties/`,
      }
    ]),
    new ReplacePlugin({
      patterns: [{
        regex: /underscore\.noConflict\(\)/,
        value: 'underscore'
      }]
    })
  ]

};

module.exports = webpackConfig;
