/* global module __dirname */

const path = require('path');
const fs = require('fs');
const dyson = require('dyson');
const responseConfig = require('./playground/config/responseConfig.js');

const TARGET = path.resolve(__dirname, 'target');
const PLAYGROUND = path.resolve(__dirname, 'playground');
const DEFAULT_SERVER_PORT = 3000;
const WIDGET_RC = '.widgetrc';

let widgetRc = {
  widgetOptions: {
    baseUrl: 'https://{yourOktaDomain}',
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
    before (app) {

      app.get('/app/UserHome', (req, res) => {
        res.status(200)
          .send('<h1>Mock User Dashboard</h1><a href="/">Back to Login</a>');
      });

      const bodyParser = require('body-parser');

      app.use(
        bodyParser.urlencoded({
          extended: true
        })
      );

      app.use(bodyParser.json());

      // Endpoint to configure mock playground responses
      app.post('/playground/responseConfig', (req, res) => {
        /**
         * Example post data:
        {
          "idp/idx": ["select-factor-authenticate"],
          "idp/idx/challenge":[
              "factor-required-password-with-options",
              "success"
            ]
          }
         */
        Object.assign(responseConfig.mocks, req.body);
        res.status(200).
          send('Mock data bootstrapped');
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
