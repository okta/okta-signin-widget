/* global module __dirname */

const path = require('path');
const fs = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const TARGET = path.resolve(__dirname, 'target');
const PLAYGROUND = path.resolve(__dirname, 'playground');
const DEFAULT_SERVER_PORT = 3000;
const WIDGET_RC = '.widgetrc';

let widgetRc = {
  widgetOptions: {
    baseUrl: 'http://your-org.okta.com:1802',
    logo: '/img/logo_widgico.png',
    logoText: 'Windico',
    features: {
      router: true,
      rememberMe: true,
      multiOptionalFactorEnroll: true
    },
    // Host the assets (i.e. jsonp files) locally
    assets: {
      baseUrl: '/'
    }
  }
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
    'playground.js': [`${PLAYGROUND}/main.js`]
  },
  output: {
    path: `${TARGET}`,
    filename: 'playground-bundle.js',
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
        from: `${PLAYGROUND}/index.html`,
        to: `${TARGET}/playground.html`
      }
    ]),
  ],

  devServer: {
    contentBase: TARGET,
    index: 'playground.html',
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
