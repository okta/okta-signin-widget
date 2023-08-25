const { DefinePlugin, IgnorePlugin, ProvidePlugin } = require('webpack');
const fs = require('fs-extra');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const EventHooksPlugin = require('event-hooks-webpack-plugin');
const { sentryWebpackPlugin } = require("@sentry/webpack-plugin");
require('@okta/env').config();

const FailOnBuildFailPlugin = require('./FailOnBuildFailPlugin');

function webpackBundleAnalyzer(reportFilename = 'okta-sign-in.analyzer') {
  // OKTA-429162: webpack-bundle-analyzer does not report bundled modules stats after upgrade to webpack@5
  return new BundleAnalyzerPlugin({
    openAnalyzer: false,
    reportFilename: `${reportFilename}.html`,
    analyzerMode: 'static',
    defaultSizes: 'stat'
  });
}

// https://webpack.js.org/plugins/ignore-plugin/#example-of-ignoring-moment-locales
function emptyModule() {
  return new IgnorePlugin({
    resourceRegExp: /^\.\/locale$/,
    contextRegExp: /moment$/,
  });
}

function prodMode() {
  return new DefinePlugin({
    DEBUG: false,
    SENTRY_DSN: JSON.stringify(process.env.SENTRY_DSN),
  });
}

function devMode() {
  return new DefinePlugin({
    DEBUG: true,
    SENTRY_DSN: JSON.stringify(process.env.SENTRY_DSN),
  });
}

function failOnBuildFail() {
  return FailOnBuildFailPlugin;
}

function plugins(options = {}) {
  const { isProduction, skipAnalyzer, copyAssets } = options;
  const list = isProduction ? 
    [
      failOnBuildFail(),
      emptyModule(),
      prodMode(),
    ] : 
    // Use DEBUG/development environment w/ console warnings
    [
      failOnBuildFail(),
      emptyModule(),
      devMode(),
    ];

  if (copyAssets) {
    list.push(new EventHooksPlugin({
      beforeRun: () => {
        fs.copySync('assets/sass', 'target/sass');
        fs.copySync('assets/font', 'target/font');
        fs.copySync('assets/img', 'target/img');
        fs.copySync('assets/css', 'target/css');
      }
    }));
  }
  
  list.push(new MiniCssExtractPlugin({
    filename: isProduction ? '../css/okta-sign-in.min.css' : '../css/okta-sign-in.css',
  }));

  if (!skipAnalyzer) {
    list.push(webpackBundleAnalyzer(options.analyzerFile));
  }

  if (process.env.SENTRY_AUTH_TOKEN) {
    list.push(sentryWebpackPlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }));
  }

  return list;
}

module.exports = plugins;
