/* eslint no-console:0 */

const path = require('path');
const fs = require('fs');
const nodemon = require('nodemon');

const TARGET = path.resolve(__dirname, 'target');
const PLAYGROUND = path.resolve(__dirname, 'playground');
const DEV_SERVER_PORT = 3000;
const MOCK_SERVER_PORT = 3030;
const WIDGET_RC_JS = '.widgetrc.js';
const WIDGET_RC = '.widgetrc';

// run `OKTA_SIW_HOST=0.0.0.0 yarn start --watch` to override the host
const HOST = process.env.OKTA_SIW_HOST || 'localhost';

if (!fs.existsSync(WIDGET_RC_JS) && fs.existsSync(WIDGET_RC)) {
  console.error('============================================');
  console.error(`Please migrate the ${WIDGET_RC} to ${WIDGET_RC_JS}.`);
  /* eslint-disable-next-line @okta/okta/no-exclusive-language */
  console.error('For more information, please see https://github.com/okta/okta-signin-widget/blob/master/MIGRATING.md');
  console.error('============================================');
  process.exit(1);
}

if (!fs.existsSync(WIDGET_RC_JS)) {
  // create default WIDGET_RC if it doesn't exist to simplifed the build process
  fs.copyFileSync('.widgetrc.sample.js', WIDGET_RC_JS);
}

module.exports = {
  mode: 'development',
  target: 'web',
  infrastructureLogging: {
    level: 'warn',
  },
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
        options: {
          presets: ['@babel/preset-env']
        }
      },
    ]
  },
  devServer: {
    host: HOST,
    static: [
      PLAYGROUND,
      TARGET,
      {
        staticOptions: {
          watchContentBase: true
        }
      }
    ],
    historyApiFallback: true,
    headers: {
      'Content-Security-Policy': `script-src http://${HOST}:${DEV_SERVER_PORT}`
    },
    compress: true,
    port: DEV_SERVER_PORT,
    proxy: [{
      context: [
        '/oauth2/',
        '/api/v1/',
        '/idp/idx/',
        '/login/getimage',
        '/sso/idps/',
        '/app/UserHome',
        '/oauth2/v1/authorize',
        '/auth/services/',
      ],
      target: `http://${HOST}:${MOCK_SERVER_PORT}`
    }],
    onBeforeSetupMiddleware() {
      const script = path.resolve(
        __dirname,
        'playground',
        'mocks',
        'server.js'
      );
      const watch = [
        path.resolve(__dirname, 'playground', 'mocks')
      ];
      const env = {
        MOCK_SERVER_PORT,
        DEV_SERVER_PORT
      };
      nodemon({ script, watch, env, delay: 50 })
        .on('restart', (filesChanged) => {
          console.log(
            'file changed:',
            filesChanged.join(', ')
          );
        })
        .on('crash', console.error);
    },
  },
};
