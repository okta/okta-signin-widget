const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const path = require('path');
const ENV = require('@okta/env');
ENV.config();
const DEV_SERVER_PORT = 3000;

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');
const { DIST_ESM, BUNDLE, USE_MIN, USE_POLYFILL, TARGET } = process.env;

// CSP settings
const scriptSrc = `script-src http://localhost:${DEV_SERVER_PORT} https://global.oktacdn.com`;
const styleSrc = `style-src http://localhost:${DEV_SERVER_PORT} https://unpkg.com`;
const csp = `${scriptSrc}; ${styleSrc}`;

const webpackConfig = {
  mode: 'development',
  entry: [
    path.resolve(__dirname, 'src/index.ts')
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.join(__dirname, 'dist'),
    clean: true,
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['.js', '.ts'],
    alias: {
      './getOktaSignIn': './getOktaSignInFromCDN'
    },
    fallback: { 'events': require.resolve('events/') }
  },
  module: {
    rules: [
      {
        test: /\.[jt]s$/,
        exclude: [/node_modules/, /dist/],
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  devtool: 'source-map',
  devServer: {
    static: [
      path.resolve(__dirname, '..', '..', 'target'),
      path.resolve(__dirname, 'public'),
      {
        staticOptions: {
          watchContentBase: true
        }
      }
    ],
    port: DEV_SERVER_PORT,
    historyApiFallback: true,
    headers: {
      'Content-Security-Policy': csp
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: `!!handlebars-loader!${path.resolve(__dirname, 'index.hbs')}`,
      templateParameters: {},
      inject: false,
    }),
    new webpack.DefinePlugin({
      // Replaces "process.env" with an object literal
      'process.env': JSON.stringify({
        // includes values in env.defaults
        ...ENV.getValues(), 

        // additional env vars recognized
        DIST_ESM,
        BUNDLE,
        USE_MIN,
        USE_POLYFILL
      })
    }),
    new BundleAnalyzerPlugin({
      openAnalyzer: false,
      reportFilename: path.join(__dirname, 'dist/main.bundle.analyzer.html'),
      analyzerMode: 'static',
    }),
  ]
};

// By default it serves the dev bundle from target directory
// With env var set, run against built ESM module in dist folder
if (DIST_ESM) {
  webpackConfig.resolve.alias['./getOktaSignIn'] = './getOktaSignInFromNPM';
  webpackConfig.resolve.alias['@okta/okta-signin-widget'] = path.resolve(WORKSPACE_ROOT, 'dist/');
}

if (TARGET === 'CROSS_BROWSER') {
  // Promise is used by this test app
  // include Promise polyfill for IE
  // the widget has its own polyfill for the features it uses
  webpackConfig.entry.unshift('core-js/es/promise');
}

module.exports = webpackConfig;
