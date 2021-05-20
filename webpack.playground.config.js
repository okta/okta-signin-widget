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
          presets: ['@babel/preset-env']
        }
      },
    ]
  },
  watch: true,
  devServer: {
    contentBase: [
      PLAYGROUND,
      TARGET,
      // webpack-dev-server v2 only watch contentbase on root level
      // explicitly list folders to watch for browser auto reload
      // sub-folders can be removed when upgrade to webpack-dev-server v3
      path.join(TARGET, 'js'),
      path.join(TARGET, 'css'),
    ],
    historyApiFallback: true,
    headers: {
      'Content-Security-Policy': `script-src http://localhost:${DEV_SERVER_PORT} \
       https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/; \
      frame-src https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/;`
    },
    compress: true,
    port: DEV_SERVER_PORT,
    open: true,
    watchContentBase: true,
    proxy: [{
      context: [
        '/oauth2/',
        '/api/v1/',
        '/idp/idx/',
        '/login/getimage/',
        '/sso/idps/',
        '/app/UserHome',
        '/oauth2/v1/authorize',
        '/auth/services/',
      ],
      target: `http://localhost:${MOCK_SERVER_PORT}`
    }],
    before() {
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
