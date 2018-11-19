/* global module __dirname */

const path = require('path');
const fs = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const TARGET = path.resolve(__dirname, 'target');
const SAMPLE_SERVER = path.resolve(__dirname, 'buildtools/sample-server');
const DEFAULT_SERVER_PORT = 3000;
const WIDGET_RC = '.widgetrc';

let widgetRc = {
  widgetOptions: {}
};

if (!fs.existsSync(WIDGET_RC)) {
  // create default WIDGET_RC if it doesn't exist to simplifed the build process
  fs.writeFileSync(WIDGET_RC, JSON.stringify(widgetRc, null, 2));
} else {
  widgetRc = JSON.parse(fs.readFileSync(WIDGET_RC));
}

const PORT = widgetRc.serverPort || DEFAULT_SERVER_PORT;

module.exports = {
  entry: {
    'sample-server.js': [`${SAMPLE_SERVER}/main.js`]
  },
  output: {
    path: `${TARGET}`,
    filename: 'sample-server-bundle.js',
  },
  devtool: 'source-map',

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
      {
        test: /\.json$|\.widgetrc/,
        loader: 'json-loader'
      },
    ]
  },

  plugins: [
    new CopyWebpackPlugin([
      {
        from: `${SAMPLE_SERVER}/index.html`,
        to: `${TARGET}/sample-server.html`
      }
    ]),
  ],

  devServer: {
    contentBase: TARGET,
    index: 'sample-server.html',
    compress: true,
    port: PORT,
    open: true,
  },

  // Webpack attempts to add a polyfill for process
  // and setImmediate, because q uses process to see
  // if it's in a Node.js environment
  node: {
    process: false,
    setImmediate: false
  }

};
