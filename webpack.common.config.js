var webpack = require('webpack');
var path    = require('path');
var empty = 'widget/empty';
var packageJson = require('./package.json');

module.exports = {
  entry: './target/js/widget/OktaSignIn.js',
  output: {
    path: path.resolve(__dirname, 'target/js/'),
    filename: 'okta-sign-in.js',
    library: 'OktaSignIn',
    libraryTarget: 'umd'
  },
  resolve: {
    root: [
      path.resolve(__dirname, 'target/js')
    ],
    alias: {
      'handlebars': 'handlebars/dist/handlebars',
      'duo': 'vendor/Duo-Web-v2',
      'xdomain': 'vendor/xdomain-0.7.5',
      'nls': '@okta/i18n/dist/json',
      'okta': 'shared/util/Okta',

      // Will be populated at runtime
      'shared/util/Bundles': 'util/Bundles',

      // Aliases for Courage
      'qtip': 'vendor/plugins/jquery.qtip',
      'imagesloaded': 'shared/vendor/plugins/imagesloaded',
      'vendor/lib/q': 'q',
      'eventie/eventie': 'shared/vendor/plugins/eventie',
      'eventEmitter/EventEmitter': 'shared/vendor/plugins/EventEmitter',
      'moment': empty,
      'jqueryui': empty,
      'mixpanel': empty,
      'shared/views/datalist/DeadSimpleDataList': empty,
      'shared/views/Backbone.TableView': empty,
      'shared/util/TabbedRouter': empty,
      'shared/util/DataListController': empty,
      'shared/views/components/BaseFormDialog': empty,
      'shared/views/components/BaseModalDialog': empty,
      'shared/views/components/ConfirmationDialog': empty,
      'shared/views/components/MultiViewModalDialog': empty,
      // Currently using BaseDropDown - switch this out at some point:
      'shared/views/components/DropDown': empty,
      'shared/views/forms/inputs/TextArea': empty,
      'shared/views/forms/inputs/GroupPicker': empty,
      'shared/views/forms/inputs/AppPicker': empty,
      'shared/views/forms/inputs/AppInstancePicker': empty,
      'shared/views/forms/inputs/SUOrgsPicker': empty,
      'shared/views/forms/inputs/UserPicker': empty,
      'shared/views/forms/inputs/BasePicker': empty,
      'shared/views/forms/inputs/TextPlusSelect': empty,
      'shared/views/forms/inputs/DateBox': empty,
      'shared/views/forms/inputs/NumberBox': empty,
      'shared/views/forms/inputs/TextSelect': empty,
      'shared/views/forms/components/ReadModeBar': empty,
      'shared/util/markdownToHtml': empty
    }
  },
  plugins: [
    // Webpack attempts to add a polyfill for process
    // and setImmediate, because q uses process to see
    // if it's in a Node.js environment
    new webpack.ProvidePlugin({
      process: empty,
      setImmediate: empty
    }),

    new webpack.DefinePlugin({
      WIDGET_VERSION: JSON.stringify(packageJson.version)
    })
  ],
  resolveLoader: {
    'alias': {
      'i18n': 'json'
    }
  },
  module: {
    loaders: [
      // Use json-loader only for config.json, because
      // we alias i18n to the json loader, which
      // causes webpack to attempt using json-loader
      // twice. This behavior causes the build to fail 
      // on i18n json files.
      { test: /config\.json$/, loader: 'json' }
    ]
  }
};
