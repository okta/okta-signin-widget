/* global __dirname, module */
/* eslint no-undef: 0 */

const path = require('path');
const webpackConfig = require('./webpack.test.config.js');
const karmaOverrides = require('./test/unit/karma/karma-overrides');

module.exports = (config) => {
  const options = {
    basePath: './',
    browsers: ['PhantomJSCustom'],
    frameworks: ['karma-overrides', 'jasmine-jquery', 'jasmine'],
    files: [
      './node_modules/babel-polyfill/dist/polyfill.js',
      { pattern: './test/unit/main_applitools.js', watched: false },
      { pattern: './test/unit/assets/*', watched: false, included: false, served: true, nocache: false },
      { pattern: './target/css/*.css', watched: true, included: true, served: true },
      { pattern: './target/**/*', watched: false, included: false, served: true },
    ],
    proxies: {
      '/img/logos/': 'http://localhost:9876/base/test/unit/assets/'
    },
    preprocessors: {
      'test/unit/main_applitools.js': ['webpack', 'sourcemap'],
    },
    plugins: [
      'karma-*',
      karmaOverrides,
    ],
    webpack: webpackConfig,
    webpackMiddleware: {
      stats: 'normal',
    },
    client: {
      // Passing specific test to run
      // but this works only with `karma start`, not `karma run`.
      test: config.test,
      jasmine: {
        timeoutInterval: 10000, // increased timeout for Travis
        random: false
      }
    },
    failOnEmptyTestSuite: false,
    customLaunchers: {
      PhantomJSCustom: {
        base: 'PhantomJS',
        options: {
          onCallback: function (data) {
            if (data.type === 'render' && data.fname !== undefined) {
              page.render(data.fname);
            }
          },
          viewportSize: {
            width: 1228,
            height: 1000
          }
        }
      }

    },

  };

  config.set(options);
};
