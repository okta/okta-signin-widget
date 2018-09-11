/* global module __dirname */
const path = require('path');
const EMPTY = 'src/empty';
const SHARED_JS = path.resolve(__dirname, 'node_modules/@okta/courage/src');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
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

const EXTERNALS = EXTERNAL_PATHS.reduce((init, pathName) => {
  return Object.assign(init, {[pathName]: {
    'commonjs': pathName,
    'commonjs2': pathName,
    'amd': pathName,
    'root': pathName
  }});
}, {});
EXTERNALS.jquery.root = 'jQuery';

const webpackConfig = {
  entry: ['./src/OktaForSigninWidget.js'],
  devtool: 'source-map',
  output: {
    // why the destination is outside current directory?
    // turns out node_modules in current directory will hoist
    // node_modules at root directory.
    path: path.resolve(__dirname, '../'),
    filename: `${DIST_FILE_NAME}.js`,
    libraryTarget: 'umd',
    library: DIST_FILE_NAME
  },
  externals: EXTERNALS,
  resolve: {
    root: '.',
    modulesDirectories: ['node_modules'],
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
    loaders: [
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
    new BundleAnalyzerPlugin({
      openAnalyzer: false,
      reportFilename: `${DIST_FILE_NAME}.html`,
      analyzerMode: 'static',
    })
  ]

};

module.exports = webpackConfig;
