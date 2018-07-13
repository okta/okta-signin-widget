/* global module __dirname */

var path      = require('path');
var EMPTY     = 'widget/empty';
var TARGET_JS = path.resolve(__dirname, 'target/js/');
var SHARED_JS = TARGET_JS + '/shared';

// Return a function so that all consumers get a new copy of the config
module.exports = function (outputFilename) {
  return {
    entry: ['./src/util/RegisterInputs.js', './target/js/widget/OktaSignIn.js'],
    devtool: 'source-map',
    output: {
      path: TARGET_JS,
      filename: outputFilename,
      library: 'OktaSignIn',
      libraryTarget: 'umd'
    },
    resolve: {
      root: [TARGET_JS],
      modulesDirectories: ['node_modules', 'packages'],
      alias: {
        // General remapping
        'nls': '@okta/i18n/dist/json',
        'okta/jquery': SHARED_JS + '/util/jquery-wrapper',
        'okta/underscore': SHARED_JS + '/util/underscore-wrapper',
        'okta/handlebars': SHARED_JS + '/util/handlebars-wrapper',
        'okta/moment': 'moment/moment',
        'okta/moment-tz': EMPTY,

        'okta/jqueryui': EMPTY,
        'okta': 'shared/util/Okta',
        'shared/util/Bundles': 'util/Bundles',

        // Vendor files from courage that are remapped in OSW to point to an npm
        // module in our package.json dependencies
        'vendor/lib/q': 'q',
        'vendor/plugins/jquery.placeholder': 'jquery-placeholder',
        'handlebars': 'handlebars/dist/handlebars',
        'qtip': '@okta/qtip2',

        // Duo has an npm module, but the latest version does not expose the
        // v2 version. Continue to use the vendor file that is checked into
        // source.
        'duo': 'vendor/Duo-Web-v2.6',
        'vendor/plugins/vkbeautify.0.99.00.beta': EMPTY
      }
    },

    module: {
      loaders: [
        // Shims
        {
          loader: 'imports?this=>window,jQuery=jquery',
          test: require.resolve('jquery-placeholder')
        },

        // These are courage files that are loaded with relative paths, which
        // cannot be excluded using the EMPTY method above.
        {
          loader: 'null-loader',
          include: [
            'framework/frameworkBundle',
            'util/TimezoneUtil',
            'util/Metrics',
            'util/TabbedRouter',
            'util/DataListController',
            'util/markdownToHtml',
            'util/Bundle.js',
            'models/modelsBundle',
            'views/Backbone.TableVie',
            'views/datalist/SimpleDataList',
            'views/datalist/Table',
            'views/forms/components/ReadModeBar',
            'views/Backbone.TableView',
            'views/datalist/datalistBundle',
            'views/tabs/tabsBundle',
            'views/uploader/uploaderBundle',
            'views/components/BaseFormDialog',
            'views/components/BaseModalDialog',
            'views/components/BaseWizard',
            'views/components/ConfirmationDialog',
            'views/components/MultiViewModalDialog',
            'views/components/DropDown',
            'views/wizard/BaseWizard',
          ].map(function (file) {
            return path.resolve(TARGET_JS, 'shared', file);
          }).concat([
            /moment-tz/,
            /vendor\/plugins\/jquery.simplemodal/,
            /vendor\/plugins\/spin/,
            'jqueryui',
            'vendor/lib/json2',
          ])
        },
        // Babel
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          query: {
            presets: ['env'],
            plugins: ['transform-runtime']
          }
        },
      ]
    },

    // Webpack attempts to add a polyfill for process
    // and setImmediate, because q uses process to see
    // if it's in a Node.js environment
    node: {
      process: false,
      setImmediate: false
    }
  };
};
