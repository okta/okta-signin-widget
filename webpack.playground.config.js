/* eslint no-console:0 */

const path = require('path');
const fs = require('fs');
const nodemon = require('nodemon');
const { DefinePlugin } = require('webpack');
const ENV = require('@okta/env');
ENV.config();

const TARGET = path.resolve(__dirname, 'target');
const ASSETS = path.resolve(__dirname, 'assets');
const PLAYGROUND = path.resolve(__dirname, 'playground');
const DEV_SERVER_PORT = 3000;
const MOCK_SERVER_PORT = 3030;
const WIDGET_RC_JS = path.resolve(__dirname, '.widgetrc.js');
const WIDGET_RC = path.resolve(__dirname, '.widgetrc');
const { SENTRY_PROJECT, SENTRY_KEY, SENTRY_REPORT_URI } = process.env;

// run `OKTA_SIW_HOST=0.0.0.0 yarn start --watch` to override the host
const HOST = process.env.OKTA_SIW_HOST || 'localhost';
const staticDirs = [PLAYGROUND, TARGET, ASSETS];

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
  fs.copyFileSync(path.resolve(__dirname, '.widgetrc.sample.js'), WIDGET_RC_JS);
}

const headers = {};

if (!process.env.DISABLE_CSP) {
  // Allow google domains for testing recaptcha
  const scriptSrc = `script-src http://${HOST}:${DEV_SERVER_PORT} https://www.google.com https://www.gstatic.com`;
  //todo: sentry's rrweb needs to be updated to fix the issue
  //const styleSrc = `style-src http://${HOST}:${DEV_SERVER_PORT} 'nonce-playground'`;
  const styleSrc = `style-src http://${HOST}:${DEV_SERVER_PORT} 'unsafe-inline'`;
  const workerSrc = `worker-src 'self' blob:; child-src 'self' blob:`;
  const reportUri = `report-uri https://sentry.io/api/${SENTRY_PROJECT}/security/?sentry_key=${SENTRY_KEY} ${SENTRY_REPORT_URI}`;
  const csp = `${scriptSrc}; ${styleSrc}; ${workerSrc}; ${reportUri};`;
  headers['Content-Security-Policy'] = csp;
}

module.exports = {
  mode: 'development',
  target: ['web', 'es5'],
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
  plugins: [
    new DefinePlugin({
      OMIT_MSWJS: process.env.OMIT_MSWJS === 'true',
      SENTRY_DSN: JSON.stringify(process.env.SENTRY_DSN),
    })
  ],
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `preset-typescript`
      {
        test: /\.m?[jt]sx?$/,
        exclude: function(filePath) {
          const filePathContains = (f) => filePath.indexOf(f) > 0;
          const npmRequiresTransform = [
            //msw
            '/node_modules/msw',
            '/node_modules/@mswjs',
            '/node_modules/@open-draft',
            '/node_modules/headers-polyfill',
            '/node_modules/outvariant',
            '/node_modules/strict-event-emitter',
            '/node_modules/graphql',
          ].some(filePathContains);
          const shallBeExcluded = [
            '/node_modules/',
          ].some(filePathContains);

          return shallBeExcluded && !npmRequiresTransform;

        },
        loader: 'babel-loader',
        options: {
          configFile: false, // do not load from babel.config.js
          babelrc: false, // do not load from .babelrc
          presets: [
            // preset-env is disabled for a better debugging experience.
            // It can be enabled if necessary to run playground on IE11
            '@babel/preset-env',
            '@babel/preset-typescript', // must run before preset-env: https://github.com/babel/babel/issues/12066
          ]
        }
      },
    ]
  },
  devServer: {
    client: {
      // Issue with IE 11:
      // webpack adds iframe #webpack-dev-server-client-overlay
      // rrweb from sentry tries to serialize its content
      //  and calls `matches` method on `contentDocument` which does not exist (even after polyfilling)
      overlay: process.env.TARGET !== 'CROSS_BROWSER',
    },
    host: HOST,
    watchFiles: [...staticDirs],
    static: [
      ...staticDirs
    ],
    historyApiFallback: true,
    headers,
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
    // https://webpack.js.org/configuration/dev-server/#devserversetupmiddlewares
    setupMiddlewares(middlewares) {
      const script = path.resolve(__dirname, 'playground/mocks/server.js');
      const watch = [path.resolve(__dirname, 'playground/mocks')];
      const env = { MOCK_SERVER_PORT, DEV_SERVER_PORT };
      nodemon({ script, watch, env, delay: 50 })
        .on('crash', console.error);
      return middlewares;
    },
  },
};
