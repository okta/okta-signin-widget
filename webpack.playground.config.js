/* global module __dirname */

const path = require('path');
const fs = require('fs');
const dyson = require('dyson');

const TARGET = path.resolve(__dirname, 'target');
const PLAYGROUND = path.resolve(__dirname, 'playground');
const DEFAULT_SERVER_PORT = 3000;
const WIDGET_RC = '.widgetrc';

let widgetRc = {
  widgetOptions: {
    baseUrl: 'http://localhost:3000',
    logo: '/img/logo_widgico.png',
    logoText: 'Windico',
    features: {
      router: true,
      rememberMe: true,
      multiOptionalFactorEnroll: true
    },
    stateToken: 'dummy-state-token-wrc',
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
    contentBase: [
      PLAYGROUND, 
      TARGET, 
      // webpack-dev-server v2 only watch contentbase on root level
      // explicitly list folders to watch for browser auto reload
      // sub-folders can be removed when upgrade to webpack-dev-server v3
      `${TARGET}/js`,
      `${TARGET}/css`,
    ],
    compress: true,
    port: PORT,
    open: true,
    watchContentBase: true,
    before (app) {
      app.get('/app/UserHome', (req, res) => {
        const respHtml = `
          <h1>Mock User Dashboard</h1>
          <pre id="preview-query">${JSON.stringify(req.query, null, 2)}</pre>
          <a href="/">Back to Login</a>`;
        res.status(200).send(respHtml);
      });

      // ================================= dyson mock setup
      const mockOptions = {
        multiRequest: false,
        proxy: false,
        configDir: `${PLAYGROUND}/mocks`,
      };
      dyson.registerServices(
        app,
        mockOptions,
        dyson.getConfigurations(mockOptions),
      );
      // dyson register '*' route explicitly, that leads to multiple "*" routes. We need to remove "*" route
      // added by dyson from router stack and keep the one which was added by webpack dev server.
      let routeIndex = app._router.stack.length;
      while (routeIndex) {
        routeIndex -= 1;
        const layer = app._router.stack[routeIndex];
        if (layer.route && layer.route.path && layer.route.path === '*') {
          app._router.stack.splice(routeIndex, 1);
          break;
        }
      }
      // ================================= dyson mock setup
    }
  },

};
