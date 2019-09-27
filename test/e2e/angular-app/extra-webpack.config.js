require('../env').config();

const webpack = require('webpack');
const env = {};

// List of environment variables made available to the app
[
  'PORT',
  'WIDGET_TEST_SERVER',
  'WIDGET_AUTH_SERVER_ID',
  'WIDGET_CLIENT_ID'
].forEach(function (key) {
  env[key] = JSON.stringify(process.env[key]);
});

// Added to angular's webpack config by @angular-builders/custom-webpack
module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      'process.env': env
    })
  ]
};
