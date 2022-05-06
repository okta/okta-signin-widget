const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const path = require('path');
const ENV = require('@okta/env');
ENV.config();
const DEV_SERVER_PORT = 3000;

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');

const webpackConfig = {
  mode: 'development',
  entry: path.resolve(__dirname, 'src/index.ts'),
  output: {
    filename: '[name].bundle.js',
    path: path.join(__dirname, 'dist'),
    clean: true
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
      'Content-Security-Policy': `script-src http://localhost:${DEV_SERVER_PORT}`
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public/index.html'),
      inject: false,
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(ENV.getValues())
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
if (process.env.DIST_ESM) {
  webpackConfig.resolve.alias['./getOktaSignIn'] = './getOktaSignInFromNPM';
  webpackConfig.resolve.alias['@okta/okta-signin-widget'] = path.resolve(WORKSPACE_ROOT, 'dist/');
}

module.exports = webpackConfig;
