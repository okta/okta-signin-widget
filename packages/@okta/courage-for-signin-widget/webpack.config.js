/* global module __dirname */
const path = require('path');
const packageJson = require('./package.json');
const EMPTY = path.resolve(__dirname, 'src/empty');
const SHARED_JS = path.resolve(__dirname, 'node_modules/@okta/courage/src');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { BannerPlugin } = require('webpack');
const DIST_FILE_NAME = 'courage-for-signin-widget';

const EXTERNAL_PATHS = [
  'jquery',
  'qtip',
  'backbone',
  'underscore',
  'handlebars',
  'moment',
  'shared/util/Bundles'
];

const webpackConfig = {
  entry: ['./src/CourageForSigninWidget.js'],
  devtool: 'source-map',
  output: {
    // why the destination is outside current directory?
    // turns out node_modules in current directory will hoist
    // node_modules at root directory.
    path: path.resolve(__dirname, '../'),
    filename: `${DIST_FILE_NAME}.js`,
    libraryTarget: 'commonjs2'
  },
  externals: EXTERNAL_PATHS,
  resolve: {
    alias: {

      'okta/jquery': SHARED_JS + '/util/jquery-wrapper',
      'okta/underscore': SHARED_JS + '/util/underscore-wrapper',
      'okta/handlebars': SHARED_JS + '/util/handlebars-wrapper',
      'okta/moment': SHARED_JS + '/util/moment-wrapper',

      // jsons is from StringUtil
      'vendor/lib/json2': EMPTY,

      // simplemodal is from dependency chain:
      //   BaseRouter -> ConfirmationDialog -> BaseFormDialog -> BaseModalDialog -> simplemodal
      'vendor/plugins/jquery.simplemodal': EMPTY,

      'shared': SHARED_JS,
      'vendor': SHARED_JS + '/vendor',
    }
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['env'],
        }
      },
    ]
  },

  plugins: [
    new BannerPlugin(`THIS FILE IS GENERATED FROM PACKAGE @okta/courage@${packageJson.dependencies['@okta/courage']}`),
    new BundleAnalyzerPlugin({
      openAnalyzer: false,
      reportFilename: `${DIST_FILE_NAME}.html`,
      analyzerMode: 'static',
    })
  ]

};

module.exports = webpackConfig;
