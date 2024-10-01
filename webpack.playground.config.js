/* eslint no-console:0 */
/* eslint max-len: [2, 140] */

const path = require('path');
const fs = require('fs');
const nodemon = require('nodemon');
const { DefinePlugin } = require('webpack');

const TARGET = path.resolve(__dirname, 'target');
const ASSETS = path.resolve(__dirname, 'assets');
const PLAYGROUND = path.resolve(__dirname, 'playground');
const DEV_SERVER_PORT = 3000;
const MOCK_SERVER_PORT = 3030;
const WIDGET_RC_JS = path.resolve(__dirname, '.widgetrc.js');
const WIDGET_RC = path.resolve(__dirname, '.widgetrc');

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
  const scriptSrc = `script-src http://${HOST}:${DEV_SERVER_PORT} 'nonce-playground' https://www.google.com https://www.gstatic.com`;
  const styleSrc = `style-src http://${HOST}:${DEV_SERVER_PORT} 'nonce-playground'`;
  const csp = `${scriptSrc}; ${styleSrc};`;
  headers['Content-Security-Policy'] = csp;
}

const hotReloadOptions = process.env.IE11_COMPAT_MODE === 'true' ? {
  hot: false,
  liveReload: false,
  webSocketServer: false,
} : {};

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
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      '@okta/okta-i18n-bundles': path.resolve(__dirname, 'src/util/Bundles.ts'),
      config: path.resolve(__dirname, 'src/config'),
      nls: path.resolve(__dirname, 'packages/@okta/i18n/src/json'),
      'util/BrowserFeatures': path.resolve(__dirname, 'src/util/BrowserFeatures'),
      'util/Bundles': path.resolve(__dirname, 'src/util/Bundles'),
      'util/Logger': path.resolve(__dirname, 'src/util/Logger'),
    }
  },
  plugins: [
    new DefinePlugin({
      IE11_COMPAT_MODE: process.env.IE11_COMPAT_MODE === 'true',
    })
  ],
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
            ...(process.env.IE11_COMPAT_MODE === 'true' ? [
              [
                '@babel/preset-env',
                {
                  targets: {
                    ie: '11'
                  }
                }
              ]
            ] : []),
            '@babel/preset-typescript' // must run before preset-env: https://github.com/babel/babel/issues/12066
          ]
        }
      },
    ]
  },
  devServer: {
    ...hotReloadOptions,
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
      const env = { MOCK_SERVER_PORT, DEV_SERVER_PORT, BASE_URL: require(WIDGET_RC_JS).baseUrl };
      nodemon({ script, watch, env, delay: 50 })
        .on('crash', console.error);
      return middlewares;
    },
  },
};
