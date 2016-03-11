/* exported getRequireConfig */

// RequireJS has an interesting way of specifying the mainConfigFile - it
// parses this file to find a requireJs({}), require({}), or in our case
// var require = { /* parsed content */ } statement, and then manually extracts
// the exact object that it finds. To use this same mapping at runtime (no
// code duplication!), we need to wrap this in a function - this ensures that
// we don't overwrite the actual, defined require function.
function getRequireConfig() {
  var require = {
    paths: {
      jquery: 'vendor/jquery-1.12.1',
      i18n: 'vendor/i18n',
      imagesloaded: 'vendor/plugins/imagesloaded',
      qtip: 'vendor/plugins/jquery.qtip',
      'eventie/eventie': 'vendor/plugins/eventie',
      'eventEmitter/EventEmitter': 'vendor/plugins/EventEmitter',
      duo: 'vendor/Duo-Web-v2',
      xdomain: 'vendor/xdomain-0.7.3',
      empty: 'widget/empty'
    },
    map: {
      '*': {
        'underscore': 'vendor/lib/underscore-wrapper',
        'handlebars': 'vendor/lib/handlebars-wrapper',
        'shared/util/Bundles': 'util/Bundles',

        // Override courage dependencies to not include modules we don't need.
        // Since this is a blacklist, we need to be vigilant about monitoring
        // files that are included in this build when courage is updated. To do
        // this, run `requirejs:dev --verbose` to see a list of all modules.
        'shared/views/datalist/DeadSimpleDataList': 'empty',
        'shared/views/Backbone.TableView': 'empty',
        'shared/util/TabbedRouter': 'empty',
        'shared/util/DataListController': 'empty',
        'shared/views/components/BaseFormDialog': 'empty',
        'shared/views/components/BaseModalDialog': 'empty',
        'shared/views/components/ConfirmationDialog': 'empty',
        'shared/views/components/MultiViewModalDialog': 'empty',
        // Currently using BaseDropDown - switch this out at some point:
        'shared/views/components/DropDown': 'empty',
        'shared/views/forms/inputs/TextArea': 'empty',
        'shared/views/forms/inputs/GroupPicker': 'empty',
        'shared/views/forms/inputs/AppPicker': 'empty',
        'shared/views/forms/inputs/AppInstancePicker': 'empty',
        'shared/views/forms/inputs/SUOrgsPicker': 'empty',
        'shared/views/forms/inputs/UserPicker': 'empty',
        'shared/views/forms/inputs/BasePicker': 'empty',
        'shared/views/forms/inputs/TextPlusSelect': 'empty',
        'shared/views/forms/inputs/DateBox': 'empty',
        'shared/views/forms/inputs/NumberBox': 'empty',
        'shared/views/forms/inputs/TextSelect': 'empty',
        'shared/views/forms/components/ReadModeBar': 'empty',
        'shared/util/markdownToHtml': 'empty',
        'moment': 'empty'
      },
      'shared/views/forms/helpers/InputFactory': {
        'shared/views/forms/inputs/TextBox': 'views/shared/TextBox'
      },
      'shared/util/StringUtil': {
        // due to _.template conflict
        'underscore': 'underscore'
      },
      'vendor/lib/underscore-wrapper': {
        'underscore': 'underscore'
      },
      'vendor/lib/handlebars-wrapper': {
        'handlebars': 'handlebars',
        // due to _.template conflict
        'underscore': 'underscore'
      }
    },
    config: {
      i18n: {
        locale: 'en'
      }
    }
  };
  return require;
}
