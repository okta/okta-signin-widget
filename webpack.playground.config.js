/* global module __dirname */

const path = require('path');
const fs = require('fs');

const TARGET = path.resolve(__dirname, 'target');
const PLAYGROUND = path.resolve(__dirname, 'playground');
const DEFAULT_SERVER_PORT = 3000;
const WIDGET_RC = '.widgetrc';

let widgetRc = {
  widgetOptions: {
    baseUrl: 'https://your-org.okta.com',
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
  target: 'web',
  entry: {
    'playground.js': [`${PLAYGROUND}/main.js`]
  },
  output: {
    path: `${PLAYGROUND}`,
    filename: 'playground.bundle.js',
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

  devServer: {
    contentBase: [PLAYGROUND, TARGET],
    compress: true,
    port: PORT,
    open: true,
  },

};
