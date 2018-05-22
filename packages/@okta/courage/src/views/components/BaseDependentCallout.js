/* eslint max-params: [2, 7] */
define([
  'okta/underscore',
  'okta/jquery',
  'shared/views/BaseView',
  'shared/views/components/BaseSpinner',
  'shared/views/components/Callout',
  'shared/util/ButtonFactory',
  'shared/util/StringUtil'
], function (_, $, BaseView, BaseSpinner, Callout, ButtonFactory, StringUtil) {

  var Spinner = BaseSpinner.extend({ 
    className: 'spinner',
    spinAtRender: true,
    spinOptions: {
      zIndex: 'auto',
      left: '25px',
      top: '25px'
    }
  });

  const STATE = {
    SUCCESS: 'success',
    INVALID: 'invalid',
    WARNING: 'warning',
    ERROR: 'error',
    FAILED: 'failed',
    LOADING: 'loading'
  };

  const CALLOUT_SETTINGS = {
    success: {
      title: { i18n: 'dependency.action.completed' },
      type: 'success',
      config: ['SUCCESS'],
      noButton: true
    },
    invalid: {
      title: { i18n: 'dependency.action.required', arg: 'title' },
      type: 'warning',
      config: ['DEFAULT']
    },
    warning: {
      title: { i18n: 'dependency.action.not.completed' },
      type: 'warning',
      config: ['DEFAULT', 'WARNING']
    },
    error: {
      title: { i18n: 'dependency.action.not.completed' },
      type: 'error',
      config: ['DEFAULT', 'WARNING', 'ERROR']
    },
    failed: {
      title: { i18n: 'dependency.action.failed' },
      subtitle: { i18n: 'dependency.action.failed.subtitle' },
      type: 'error',
      noButton: true
    },
    loading: {
      title: { i18n: 'dependency.check.required.action' },
      type: 'warning',
      showSpinner: true,
      noButton: true
    }
  };

  /**
   * A Dependent Flow callout 
   * @class module:Okta.DependentCallout
   * @extends module:Okta.View
   * @param {Object} define callout title and button
   *
   * @example
   * var View = Okta.DependentCallout.extend({
   *   callout: {
   *     title: 'Default Title',
   *     subtitle: 'Default Subtitle',
   *     button: {
   *       title: 'Button title',
   *       href: 'http://www.okta.com'
   *     },
   *     WARNING: {
   *       subtitle: 'Overwrite subtitle for warning'
   *     }
   *   }
   * });
   *
   * Fired when it requires to re-evaluate
   * @event module:Okta.DependentCallout#validate
   */

  return BaseView.extend({

    __currentState: STATE.SUCCESS,

    /**
     * Callout configuration settings
     * @type {Object}
     */
    callout: {},

    constructor: function (options) {
      this.options = options || {};

      if (this.options.callout) {
        this.callout = this.options.callout;
      }

      BaseView.prototype.constructor.call(this, options);
    },

    isValid: function () {
      return this.__currentState === STATE.SUCCESS;
    },

    showSuccess: function () {
      if (this.isValid()) {
        return;
      }

      this.__currentState = STATE.SUCCESS;
      this.execCallout();
    },

    showInvalid: function () {
      this.__currentState = STATE.INVALID;
      this.execCallout();
    },

    showWarning: function () {
      this.__currentState = STATE.WARNING;
      this.execCallout();
    },

    showError: function () {
      this.__currentState = STATE.ERROR;
      this.execCallout();
    },

    showFailed: function () {
      this.__currentState = STATE.FAILED;
      this.execCallout();
    },

    showLoading: function () {
      this.__currentState = STATE.LOADING;
      this.execCallout();
    },

    removeCallout: function () {
      this.lastView && this.lastView.remove();
    },

    execCallout: function () {
      var calloutConfig = this.__buildCalloutConfig();

      var buttonConfig = this.__getButtonConfig(calloutConfig);

      if (buttonConfig && !calloutConfig.content) {
        calloutConfig.content = this.__getDependencyCalloutBtn(buttonConfig);
      } 

      this.__showCallout(calloutConfig); 
    },

    __getCalloutConfig: function (type) {
      var config;
      
      if (this.callout[type]) {
        config = this.callout[type];
      } else if (type === 'DEFAULT') {
        config = this.callout;
      }

      return config ? _.pick(config, 'icon', 'title', 'subtitle', 'bullets', 'button', 'className') : {};
    },

    __getButtonConfig: function (calloutConfig) {
      var config;
      if (calloutConfig && calloutConfig.button) {
        config = calloutConfig.button;
      }
      return config;
    },

    __buildCalloutConfig: function () {
      var baseConfigs = CALLOUT_SETTINGS[this.__currentState],
          configs = _.reduce(baseConfigs.config || [], function (combined, config) { 
            return _.extend({}, combined, this.__getCalloutConfig(config));
          }, {}, this);

      configs = this.__configOverwrite(baseConfigs, configs);

      if (baseConfigs.showSpinner) {
        this.spinner && this.spinner.remove();
        this.spinner = new Spinner();
        configs.content = this.spinner;
      }

      _.each(['title', 'subtitle', 'bullets'], function (attr) {
        configs[attr] = _.resultCtx(configs, attr, this);
      }, this);

      return configs;
    },

    __configOverwrite: function (baseConfigs, configs) {
      if (baseConfigs.title.arg) {
        configs.title = StringUtil.localize(baseConfigs.title.i18n, 'courage', [configs[baseConfigs.title.arg]]);
      } else {
        configs.title = StringUtil.localize(baseConfigs.title.i18n, 'courage');
      }

      if (baseConfigs.subtitle) {
        configs.subtitle = StringUtil.localize(baseConfigs.subtitle.i18n, 'courage');
      }

      if (baseConfigs.noButton) {
        configs = _.omit(configs, 'button');
      }

      configs = _.extend({}, _.pick(baseConfigs, 'type'), configs);
      configs.className = [(configs.className ? configs.className : ''), 'dependency-callout'].join(' ');

      return configs;
    },

    __showCallout: function (calloutConfig) {
      var dependencyCallout = Callout.create(calloutConfig);
      if (calloutConfig.button) {
        var message = StringUtil.localize('dependency.callout.msg', 'courage');
        dependencyCallout.add(`<span class="o-form-explain">${message}</span>`);
      }

      this.removeCallout();
      this.lastView = this.add(dependencyCallout).last();
    },

    __getDependencyCalloutBtn: function (btnConfig) {
      var btnOptions = _.clone(btnConfig);
      // add onfocus listener to re-evaluate depedency when callout button is clicked
      var originalClick = btnOptions.click || function () {};

      // Assign a default icon
      if (!btnOptions.icon) {
        btnOptions.icon = 'openinnewtab-16';
      }

      btnOptions.attributes = _.extend({}, btnOptions.attributes || {}, { target: '_blank' });

      // Append 'open' in the front of button label
      btnOptions.title = StringUtil.localize('dependency.button.action.open', 'courage', [btnOptions.title]);

      btnOptions.className = [(btnOptions.className ? btnOptions.className : ''), 'link-button-icon-right'].join(' ');

      btnOptions.click = _.bind(function () {
        $(window).one('focus', _.bind(function () {
          this.trigger('validate');
        }, this));
        originalClick.call(this);
      }, this);

      var CalloutBtn = BaseView.extend({
        children: [
          ButtonFactory.create(btnOptions)
        ]
      });
      return new CalloutBtn();
    }
  });
});
