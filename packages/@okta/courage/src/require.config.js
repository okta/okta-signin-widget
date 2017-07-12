/* jshint -W079:false */
/* eslint no-undef: 0 */
/*exported require */
/*global okta */

var require = {
  paths: {
    okta: 'shared/util/Okta',
    jquery: 'vendor/lib/jquery-1.11.3',
    jqueryui: 'vendor/lib/jquery-ui-1.10.4.custom',
    jquerytree: 'vendor/plugins/jquery.fancytree',
    underscore: 'vendor/lib/underscore-1.8.3',
    backbone: 'vendor/lib/backbone-1.2.1',
    handlebars: 'vendor/lib/handlebars-v2.0.0',
    i18n: 'vendor/plugins/i18n',
    imagesloaded: 'vendor/plugins/imagesloaded',
    moment: 'vendor/lib/moment-with-locales',
    'moment-tz': 'vendor/lib/moment-timezone-with-data-2010-2020',
    enduserlib: 'enduser/lib',
    qtip: 'vendor/plugins/jquery.qtip',
    'eventie/eventie': 'vendor/plugins/eventie',
    'eventEmitter/EventEmitter': 'vendor/plugins/EventEmitter',
    mixpanel: 'vendor/lib/mixpanel-2.8.0.min',
    clipboard: 'vendor/lib/clipboard-1.5.16.min',
    selectize: 'vendor/lib/selectize'
  },
  map: {
    '*': {
      'okta/jquery': 'shared/util/jquery-wrapper',
      'okta/underscore': 'shared/util/underscore-wrapper',
      'okta/jqueryui': 'shared/util/jqueryui-wrapper',
      'okta/handlebars': 'shared/util/handlebars-wrapper',
      'okta/moment': 'shared/util/moment-wrapper',
      'okta/moment-tz': 'shared/util/moment-tz-wrapper'
    }
  },
  shim: {
    mixpanel: {
      deps: ['vendor/lib/mixpanel-snippet'],
      exports: 'mixpanel'
    }
  },
  config: {
    i18n: {
      locale: typeof okta != 'undefined' && (okta.locale || 'en')
    }
  }
};
