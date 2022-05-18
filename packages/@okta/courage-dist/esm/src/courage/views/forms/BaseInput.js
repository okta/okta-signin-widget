import _Handlebars2 from '../../../../lib/handlebars/dist/cjs/handlebars.runtime.js';
import oktaJQueryStatic from '../../util/jquery-wrapper.js';
import oktaUnderscore from '../../util/underscore-wrapper.js';
import ButtonFactory from '../../util/ButtonFactory.js';
import StringUtil from '../../util/StringUtil.js';
import BaseView from '../BaseView.js';
import Callout from '../components/Callout.js';
import Keys from '../../util/Keys.js';

const props = {
  tagName: 'span',
  attributes: function () {
    return {
      'data-se': 'o-form-input-' + this.getNameString()
    };
  },

  /**
   * default placeholder text when options.placeholder is not defined
   */
  defaultPlaceholder: '',
  constructor: function (options) {
    /* eslint complexity: [2, 9] */
    options = oktaUnderscore.defaults(options || {}, {
      inputId: options.id || oktaUnderscore.uniqueId('input'),
      placeholder: this.defaultPlaceholder,
      inlineValidation: true,
      validateOnlyIfDirty: false
    });
    delete options.id; // decorate the `enable` and `disable` and toggle the `o-form-disabled` class.
    // so we wont need to worry about this when overriding the methods

    const self = this;

    oktaUnderscore.each({
      enable: 'removeClass',
      disable: 'addClass'
    }, function (method, action) {
      self[action] = oktaUnderscore.wrap(self[action], function (fn) {
        fn.apply(self, arguments);
        self.$el[method]('o-form-disabled');
      });
    });

    BaseView.call(this, options);

    if (oktaUnderscore.result(options, 'readOnly') !== true && oktaUnderscore.result(options, 'read') === true) {
      this.listenTo(this.model, 'change:__edit__', this.render);
    }

    if (oktaUnderscore.isFunction(this.focus)) {
      this.focus = oktaUnderscore.debounce(oktaUnderscore.bind(this.focus, this), 50);
    } // Enable inline validation if this is not the first field in the form.


    if (!oktaUnderscore.result(options, 'validateOnlyIfDirty')) {
      this.addInlineValidation();
    }

    this.addModelListeners();
    this.$el.addClass('o-form-input-name-' + this.getNameString());
  },
  addAriaLabel: function () {
    const ariaLabel = this.options.ariaLabel;

    if (ariaLabel) {
      this.$(':input').attr('aria-label', ariaLabel);
    }
  },
  addInlineValidation: function () {
    if (oktaUnderscore.result(this.options, 'inlineValidation')) {
      this.$el.on('focusout', ':input', oktaUnderscore.bind(this.validate, this));
    }
  },
  toModelValue: function () {
    let value = this.val();

    if (oktaUnderscore.isFunction(this.to)) {
      value = this.to.call(this, value);
    }

    if (oktaUnderscore.isFunction(this.options.to)) {
      value = this.options.to.call(this, value);
    }

    return value;
  },
  __getDependencyCalloutBtn: function (btnConfig) {
    const self = this;

    const btnOptions = oktaUnderscore.clone(btnConfig);

    const originalClick = btnOptions.click || function () {}; // add onfocus listener to re-evaluate depedency when callout button is clicked


    btnOptions.click = function () {
      oktaJQueryStatic(window).one('focus.dependency', function () {
        self.__showInputDependencies();
      });
      originalClick.call(self);
    };

    const BaseInputCalloutBtn = BaseView.extend({
      children: [ButtonFactory.create(btnOptions)]
    });
    return new BaseInputCalloutBtn();
  },
  getCalloutParent: function () {
    return this.$('input[value="' + this.getModelValue() + '"]').parent();
  },
  __getCalloutMsgContainer: function (calloutMsg) {
    return BaseView.extend({
      template: _Handlebars2.template({
        "compiler": [8, ">= 4.3.0"],
        "main": function (container, depth0, helpers, partials, data) {
          var helper,
              lookupProperty = container.lookupProperty || function (parent, propertyName) {
            if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
              return parent[propertyName];
            }

            return undefined;
          };

          return "<span class=\"o-form-explain\">" + container.escapeExpression((helper = (helper = lookupProperty(helpers, "msg") || (depth0 != null ? lookupProperty(depth0, "msg") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
            "name": "msg",
            "hash": {},
            "data": data,
            "loc": {
              "start": {
                "line": 1,
                "column": 29
              },
              "end": {
                "line": 1,
                "column": 36
              }
            }
          }) : helper)) + "</span>";
        },
        "useData": true
      }),
      getTemplateData: function () {
        return {
          msg: calloutMsg
        };
      }
    });
  },
  showCallout: function (calloutConfig, dependencyResolved) {
    const callout = oktaUnderscore.clone(calloutConfig);

    callout.className = 'dependency-callout';

    if (callout.btn) {
      callout.content = this.__getDependencyCalloutBtn(callout.btn);
      delete callout.btn;
    }

    const dependencyCallout = Callout.create(callout);

    if (!dependencyResolved) {
      dependencyCallout.add(this.__getCalloutMsgContainer(StringUtil.localize('dependency.callout.msg', 'courage')));
    }

    const calloutParent = this.getCalloutParent();
    calloutParent.append(dependencyCallout.render().el);

    if (callout.type === 'success') {
      oktaUnderscore.delay(function () {
        // fade out success callout
        dependencyCallout.$el.fadeOut(800);
      }, 1000);
    }
  },
  removeCallout: function () {
    this.$el.find('.dependency-callout').remove();
  },
  __evaluateCalloutObject: function (dependencyResolved, calloutTitle) {
    let defaultCallout;

    if (dependencyResolved) {
      defaultCallout = {
        title: StringUtil.localize('dependency.action.completed', 'courage'),
        size: 'large',
        type: 'success'
      };
    } else {
      defaultCallout = {
        title: StringUtil.localize('dependency.action.required', 'courage', [calloutTitle]),
        size: 'large',
        type: 'warning'
      };
    }

    return defaultCallout;
  },
  __handleDependency: function (result, callout) {
    const self = this;
    const calloutConfig = oktaUnderscore.isFunction(callout) ? callout(result) : oktaUnderscore.extend({}, callout, self.__evaluateCalloutObject(result.resolved, callout.title)); // remove existing callouts if any

    self.removeCallout();
    self.showCallout(calloutConfig, result.resolved);
  },
  __showInputDependencies: function () {
    const self = this;
    const fieldDependency = self.options.deps[self.getModelValue()];

    if (fieldDependency && oktaUnderscore.isFunction(fieldDependency.func)) {
      fieldDependency.func().done(function (data) {
        self.__handleDependency({
          resolved: true,
          data: data
        }, fieldDependency.callout);
      }).fail(function (data) {
        self.__handleDependency({
          resolved: false,
          data: data
        }, fieldDependency.callout);
      });
    } else {
      self.removeCallout();
    }
  },
  _isEdited: false,
  hasIMESupport: false,

  /**
   * updates the model with the input's value
   */
  update: function (e) {
    if (!this._isEdited && oktaUnderscore.result(this.options, 'validateOnlyIfDirty')) {
      this._isEdited = true;
      this.addInlineValidation();
    }

    this.model.set(this.options.name, this.toModelValue());

    if (this.options.deps) {
      // check for dependencies
      this.__showInputDependencies();
    }
    /*
      To add IME support for more components
      - Add hasIMESupport boolean flag and compositionend and compositionstart event listeners to the component
      - Supported components: TextBox.js, TextSelect.js
      - Additionally window.okta.enableIMESupport is an org level FF to toggle IME support
    */


    if (this.hasIMESupport && window?.okta?.enableIMESupport) {
      if (this.isComposing) {
        return;
      }

      if (e && Keys.isEnter(e)) {
        this.model.trigger('form:save');
      }
    }
  },

  /**
   * Is the input in edit mode
   * @return {Boolean}
   */
  isEditMode: function () {
    const ret = !oktaUnderscore.result(this.options, 'readOnly') && (oktaUnderscore.result(this.options, 'read') !== true || this.model.get('__edit__') === true);
    return ret;
  },

  /**
   * Renders the input
   * @readonly
   */
  render: function () {
    this.preRender();
    const params = this.options.params;
    this.options.params = oktaUnderscore.resultCtx(this.options, 'params', this);

    if (this.isEditMode()) {
      this.editMode();

      if (oktaUnderscore.resultCtx(this.options, 'disabled', this)) {
        this.disable();
      } else {
        this.enable();
      }
    } else {
      this.readMode();
    }

    this.options.params = params;
    this.addAriaLabel();
    this.postRender();
    return this;
  },

  /**
   * checks if the current value in the model is valid for this field
   */
  validate: function () {
    if (!this.model.get('__pending__') && this.isEditMode() && oktaUnderscore.isFunction(this.model.validateField)) {
      const validationError = this.model.validateField(this.options.name);

      if (validationError) {
        oktaUnderscore.delay(function () {
          this.model.trigger('form:clear-error:' + this.options.name);
          this.model.trigger('invalid', this.model, validationError, false);
        }.bind(this), 100);
      }
    }
  },

  /**
   * Add model event listeners
   */
  addModelListeners: function () {
    this.listenTo(this.model, 'form:field-error', function (name) {
      if (this.options.name === name) {
        this.__markError();
      }
    });
    this.listenTo(this.model, 'form:clear-errors change:' + this.options.name, this.__clearError);
    this.listenTo(this.model, 'form:clear-error:' + this.options.name, this.__clearError);
  },

  /**
   * The value of the input
   * @return {Mixed}
   */
  val: function () {
    throw new Error('val() is an abstract method');
  },

  /**
   * Set focus on the input
   */
  focus: function () {
    throw new Error('focus() is an abstract method');
  },

  /**
   * Default value in read mode
   * When model has no value for the field
   */
  defaultValue: function () {
    return '';
  },

  /**
   * Renders the input in edit mode
   */
  editMode: function () {
    const options = oktaUnderscore.extend({}, this.options, {
      value: this.getModelValue()
    });

    this.$el.html(this.template(options));
    this.options.multi && this.$el.removeClass('margin-r');
    return this;
  },

  /**
   * Renders the readable value of the input in read mode
   */
  readMode: function () {
    this.$el.text(this.getReadModeString());
    this.$el.removeClass('error-field');
    this.options.multi && this.$el.addClass('margin-r');
    return this;
  },
  getReadModeString: function () {
    const readModeStr = oktaUnderscore.resultCtx(this.options, 'readModeString', this);

    if (readModeStr) {
      return readModeStr;
    }

    return this.toStringValue();
  },

  /**
   * The model value off the field associated with the input
   * @return {Mixed}
   */
  getModelValue: function () {
    let value = this.model.get(this.options.name);

    if (oktaUnderscore.isFunction(this.from)) {
      value = this.from.call(this, value);
    }

    if (oktaUnderscore.isFunction(this.options.from)) {
      value = this.options.from.call(this, value);
    }

    return value;
  },

  /*
  * convenience method to get the textual value from the model
  * will return the textual label rather than value in case of select/radio
  * @return {String}
  */
  toStringValue: function () {
    let value = this.getModelValue();

    if (this.options.options) {
      // dropdown or radio
      value = this.options.options[value];
    }

    if (Number.isInteger(value) || typeof value === 'boolean') {
      value = String(value);
    }

    return value || this.defaultValue();
  },

  /**
   * Triggers a form:resize event in order to tell dialogs content size has changed
   */
  resize: function () {
    this.model.trigger('form:resize');
  },

  /**
   * Disable the input
   */
  disable: function () {
    this.$(':input').prop('disabled', true);
  },

  /**
   * Enable the input
   */
  enable: function () {
    this.$(':input').prop('disabled', false);
  },

  /**
   * Change the type of the input field. (e.g., text <--> password)
   * @param type
   */
  changeType: function (type) {
    this.$(':input').prop('type', type); // Update the options so that it keeps the uptodate state

    this.options.type = type;
  },
  getNameString: function () {
    if (oktaUnderscore.isArray(this.options.name)) {
      return this.options.name.join('-');
    }

    return this.options.name;
  },

  /**
   * Get parameters, computing _.result
   * @param  {[type]} options alternative options
   * @return {Object} the params
   */
  getParams: function (options) {
    const opts = options || this.options || {};
    return oktaUnderscore.clone(oktaUnderscore.resultCtx(opts, 'params', this) || {});
  },

  /**
   * get a parameter from options.params, compute _.result when needed.
   * @param  {String} key
   * @param  {Object} defaultValue
   * @return {Object} the params
   */
  getParam: function (key, defaultValue) {
    const result = oktaUnderscore.resultCtx(this.getParams(), key, this);

    return !oktaUnderscore.isUndefined(result) ? result : defaultValue;
  },

  /**
   * Get a parameter from options.params or if empty, object attribute.
   *
   * @param  {String} key
   * @return {Object} the param or attribute
   */
  getParamOrAttribute: function (key) {
    return this.getParam(key) || oktaUnderscore.result(this, key);
  },
  __markError: function () {
    this.$el.addClass('o-form-has-errors');
  },
  __clearError: function () {
    this.$el.removeClass('o-form-has-errors');
  }
};
/**
 * @class BaseInput
 * @private
 * An abstract object that defines an input for {@link Okta.Form}
 *
 * BaseInputs are typically not created directly, but being passed to {@link Okta.Form#addInput}
 * @extends Okta.View
 */

var BaseInput = BaseView.extend(props);

export { BaseInput as default };
