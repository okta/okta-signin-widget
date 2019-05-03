const webpack = require('webpack');

// List of environment variabls made available to the app
const vars = [
  'WIDGET_TEST_SERVER',
  'WIDGET_CLIENT_ID'
];

const obj = {};
vars.forEach(function (key) {
  obj[key] = JSON.stringify(process.env[key]);
});

// Added to angular's webpack config by @angular-builders/custom-webpack
module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      'process.env': obj
    })
  ]
};
