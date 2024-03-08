const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const ENV = require('@okta/env');
ENV.config();
const DEV_SERVER_PORT = 3000;

const { DIST_ESM, BUNDLE, USE_MIN, USE_POLYFILL, TARGET } = process.env;

// CSP settings
const headers = {};
if (!process.env.DISABLE_CSP) {
  const scriptSrc = `script-src http://localhost:${DEV_SERVER_PORT} https://global.oktacdn.com 'nonce-e2e'`;
  const styleSrc = `style-src http://localhost:${DEV_SERVER_PORT} https://unpkg.com 'nonce-e2e'`;

  const styleSrcElem = `style-src-elem http://localhost:${DEV_SERVER_PORT} https://unpkg.com 'nonce-e2e'`;
  const csp = `${scriptSrc}; ${styleSrc}; ${styleSrcElem}`;
  headers['Content-Security-Policy'] = csp;
}

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
    fallback: { 'events': require.resolve('events/') },
    // needed to load ESM version of SIW for DIST_ESM=1
    ...(DIST_ESM && { conditionNames: ['browser', 'import', 'default'] }),
  },
  module: {
    rules: [
      {
        test: /\.[jt]s$/,
        exclude: [/node_modules/, /dist/],
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        exclude: [/node_modules/],
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'source-map-loader'
        ]
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
    headers,
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      template: `!!handlebars-loader!${path.resolve(__dirname, 'index.hbs')}`,
      templateParameters: {
        DIST_ESM,
      },
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
}

if (TARGET === 'CROSS_BROWSER') {
  // Promise is used by this test app
  // include Promise polyfill for IE
  // the widget has its own polyfill for the features it uses
  webpackConfig.entry.unshift('core-js/es/promise');
}

module.exports = webpackConfig;
