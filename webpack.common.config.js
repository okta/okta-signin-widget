var path      = require('path');
var EMPTY     = 'widget/empty';
var TARGET_JS = path.resolve(__dirname, 'target/js/');
var SHARED_JS = TARGET_JS + '/shared';
var VENDOR = path.resolve(__dirname, 'packages/@okta/courage/src/vendor');

// Return a function so that all consumers get a new copy of the config
module.exports = function (outputFilename) {
  return {
    entry: ['babel-polyfill', './target/js/widget/OktaSignIn.js'],
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
        'okta/handlebars': 'handlebars/dist/handlebars',
        'okta/moment-tz': VENDOR + '/lib/moment-timezone-with-data-2010-2020',
        'okta/moment': 'moment/moment',
        'mixpanel-browser': SHARED_JS + '/util/mixpanel-factory',
        'selectize': VENDOR + '/lib/selectize',
        'okta/jqueryui': EMPTY,
        'okta': 'shared/util/Okta',
        'shared/util/Bundles': 'util/Bundles',

        // Vendor files from courage that are remapped in OSW to point to an npm
        // module in our package.json dependencies
        'vendor/lib/q': 'q',
        'vendor/plugins/jquery.placeholder': 'jquery-placeholder',
        'vendor/plugins/jquery.autosuggest-1.4.min': VENDOR + '/plugins/jquery.autosuggest-1.4.min',
        'handlebars': 'handlebars/dist/handlebars',
        'qtip': '@okta/qtip2',

        // Duo has an npm module, but the latest version does not expose the
        // v2 version. Continue to use the vendor file that is checked into
        // source.
        'duo': 'vendor/Duo-Web-v2.6',

        // Modules from courage that we are not using. Be proactive about
        // checking these - new modules need to be blacklisted here.
        // Note: If the module is included relatively in the source file,
        // override it in the null-loader configs below.
        'jqueryui': EMPTY,
        //'mixpanel': EMPTY,
        //'selectize': EMPTY,
        'shared/util/Bundle.js': EMPTY,
        'shared/views/datalist/DeadSimpleDataList': EMPTY,
        'shared/views/Backbone.TableView': EMPTY,
        'shared/util/TabbedRouter': EMPTY,
        'shared/util/DataListController': EMPTY,
        'shared/views/components/BaseFormDialog': EMPTY,
        'shared/views/components/BaseModalDialog': EMPTY,
        'shared/views/components/ConfirmationDialog': EMPTY,
        'shared/views/components/MultiViewModalDialog': EMPTY,
        'shared/views/components/DropDown': EMPTY,
        'shared/util/markdownToHtml': EMPTY,
        'shared/util/Metrics': EMPTY,
        'shared/views/wizard/BaseWizard': EMPTY,
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
            'util/TimezoneUtil',
            'views/Backbone.TableVie',
            'views/datalist/SimpleDataList',
            'views/datalist/Table',
            'views/forms/inputs/GroupPicker',
            'views/forms/inputs/AppPicker',
            'views/forms/inputs/AppInstancePicker',
            'views/forms/inputs/IdpPicker',
            'views/forms/inputs/ScopesPicker',
            'views/forms/inputs/SUOrgsPicker',
            'views/forms/inputs/UserPicker',
            //'views/forms/inputs/BasePicker',
            'views/forms/inputs/ZonePicker',
            'views/forms/inputs/TextArea',
            'views/forms/inputs/TextPlusSelect',
            'views/forms/inputs/DateBox',
            'views/forms/inputs/NumberBox',
            'views/forms/inputs/TextSelect',
            'views/forms/components/ReadModeBar',
            'views/forms/inputs/ListInput',
            'views/forms/inputs/SimpleCheckBoxSet'
          ].map(function (file) {
            return path.resolve(TARGET_JS, 'shared', file);
          })
        },
        // Babel
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          query: {
            presets: ['env']
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
