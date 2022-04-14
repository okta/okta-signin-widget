const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const ENV = require('@okta/env');
ENV.config();
const DEV_SERVER_PORT = 3000;

module.exports = {
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
      './getOktaSignIn': './getOktaSignInFromCDN',
      // '@okta/okta-auth-js': '@okta/okta-auth-js/build/dist/okta-auth-js.umd.js'
      // '@okta/okta-signin-widget': path.resolve(__dirname, 'target/js/okta-sign-in.entry.js'),
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
    })
  ]
};