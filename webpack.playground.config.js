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
    'playground.js': [`${PLAYGROUND}/main.ts`]
  },
  output: {
    path: `${PLAYGROUND}/target`,
    filename: 'playground.bundle.js',
    environment: {
      arrowFunction: false // for IE11
    }
  },
  devtool: 'source-map',
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `preset-typescript`
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          configFile: false, // do not load from babel.config.js
          babelrc: false, // do not load from .babelrc
          presets: [
            // preset-env is disabled for a better debugging experience.
            // It can be enabled if necessary to run playground on IE11
            // '@babel/preset-env',
            '@babel/preset-typescript' // must run before preset-env: https://github.com/babel/babel/issues/12066
          ]
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
        '/.well-known/webfinger'
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
