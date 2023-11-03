const { DefinePlugin } = require('webpack');
const fs = require('fs-extra');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const EventHooksPlugin = require('event-hooks-webpack-plugin');

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

function prodMode() {
  return new DefinePlugin({
    DEBUG: false
  });
}

function devMode() {
  return new DefinePlugin({
    DEBUG: true
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
      prodMode(),
    ] : 
    // Use DEBUG/development environment w/ console warnings
    [
      failOnBuildFail(),
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

  return list;
}

module.exports = plugins;
