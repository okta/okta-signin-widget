import _Handlebars2 from '../../../../lib/handlebars/dist/cjs/handlebars.runtime.js';
import oktaJQueryStatic from '../../util/jquery-wrapper.js';
import oktaUnderscore from '../../util/underscore-wrapper.js';
import StringUtil from '../../util/StringUtil.js';
import BaseView from '../BaseView.js';
import ReadModeBar from './components/ReadModeBar.js';
import Toolbar from './components/Toolbar.js';
import ErrorBanner from './helpers/ErrorBanner.js';
import ErrorParser from './helpers/ErrorParser.js';
import FormUtil from './helpers/FormUtil.js';
import InputContainer from './helpers/InputContainer.js';
import InputFactory from './helpers/InputFactory.js';
import InputLabel from './helpers/InputLabel.js';
import InputWrapper from './helpers/InputWrapper.js';
import SettingsModel from '../../util/SettingsModel.js';

const template = _Handlebars2.template({
  "1": function (container, depth0, helpers, partials, data) {
    var helper,
        lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return "<h2 class=\"o-form-title-bar\" data-se=\"o-form-title-bar\">" + container.escapeExpression((helper = (helper = lookupProperty(helpers, "title") || (depth0 != null ? lookupProperty(depth0, "title") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
      "name": "title",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 75
        },
        "end": {
          "line": 1,
          "column": 84
        }
      }
    }) : helper)) + "</h2>";
  },
  "3": function (container, depth0, helpers, partials, data) {
    var stack1,
        lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return (stack1 = lookupProperty(helpers, "if").call(depth0 != null ? depth0 : container.nullContext || {}, depth0 != null ? lookupProperty(depth0, "title") : depth0, {
      "name": "if",
      "hash": {},
      "fn": container.program(4, data, 0),
      "inverse": container.noop,
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 192
        },
        "end": {
          "line": 1,
          "column": 288
        }
      }
    })) != null ? stack1 : "";
  },
  "4": function (container, depth0, helpers, partials, data) {
    var helper,
        lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return "<h2 data-se=\"o-form-head\" class=\"okta-form-title o-form-head\">" + container.escapeExpression((helper = (helper = lookupProperty(helpers, "title") || (depth0 != null ? lookupProperty(depth0, "title") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
      "name": "title",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 267
        },
        "end": {
          "line": 1,
          "column": 276
        }
      }
    }) : helper)) + "</h2>";
  },
  "6": function (container, depth0, helpers, partials, data) {
    var helper,
        lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return "<p class=\"okta-form-subtitle o-form-explain\" data-se=\"o-form-explain\">" + container.escapeExpression((helper = (helper = lookupProperty(helpers, "subtitle") || (depth0 != null ? lookupProperty(depth0, "subtitle") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
      "name": "subtitle",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 385
        },
        "end": {
          "line": 1,
          "column": 397
        }
      }
    }) : helper)) + "</p>";
  },
  "compiler": [8, ">= 4.3.0"],
  "main": function (container, depth0, helpers, partials, data) {
    var stack1,
        helper,
        alias1 = depth0 != null ? depth0 : container.nullContext || {},
        lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "hasReadMode") : depth0, {
      "name": "if",
      "hash": {},
      "fn": container.program(1, data, 0),
      "inverse": container.noop,
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 0
        },
        "end": {
          "line": 1,
          "column": 96
        }
      }
    })) != null ? stack1 : "") + "<div data-se=\"o-form-content\" class=\"o-form-content " + container.escapeExpression((helper = (helper = lookupProperty(helpers, "layout") || (depth0 != null ? lookupProperty(depth0, "layout") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(alias1, {
      "name": "layout",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 148
        },
        "end": {
          "line": 1,
          "column": 158
        }
      }
    }) : helper)) + " clearfix\">" + ((stack1 = lookupProperty(helpers, "unless").call(alias1, depth0 != null ? lookupProperty(depth0, "hasReadMode") : depth0, {
      "name": "unless",
      "hash": {},
      "fn": container.program(3, data, 0),
      "inverse": container.noop,
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 169
        },
        "end": {
          "line": 1,
          "column": 299
        }
      }
    })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "subtitle") : depth0, {
      "name": "if",
      "hash": {},
      "fn": container.program(6, data, 0),
      "inverse": container.noop,
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 299
        },
        "end": {
          "line": 1,
          "column": 408
        }
      }
    })) != null ? stack1 : "") + "<div class=\"o-form-error-container\" data-se=\"o-form-error-container\"></div><div class=\"o-form-fieldset-container\" data-se=\"o-form-fieldset-container\"></div></div>";
  },
  "useData": true
});

const sectionTitleTemplate = _Handlebars2.template({
  "compiler": [8, ">= 4.3.0"],
  "main": function (container, depth0, helpers, partials, data) {
    var helper,
        lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return "<h2 class=\"o-form-head\">" + container.escapeExpression((helper = (helper = lookupProperty(helpers, "title") || (depth0 != null ? lookupProperty(depth0, "title") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
      "name": "title",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 24
        },
        "end": {
          "line": 1,
          "column": 33
        }
      }
    }) : helper)) + "</h2>";
  },
  "useData": true
});

const pointerEventsSupported = oktaJQueryStatic('<div>').css({
  'pointer-events': 'auto'
})[0].style.pointerEvents === 'auto'; // polyfill for `pointer-events: none;` in IE < 11
// Logic borrowed from https://github.com/kmewhort/pointer_events_polyfill (BSD)

function pointerEventsPolyfill(e) {
  if (!pointerEventsSupported && this.$el.hasClass('o-form-saving')) {
    const $el = oktaJQueryStatic(e.currentTarget);
    $el.css('display', 'none');
    const underneathElem = document.elementFromPoint(e.clientX, e.clientY);
    $el.css('display', 'block');
    e.target = underneathElem;
    oktaJQueryStatic(underneathElem).trigger(e);
    return false;
  }
}

const events = {
  submit: function (e) {
    e.preventDefault();

    this.__save();
  }
};

oktaUnderscore.each(['click', 'dblclick', 'mousedown', 'mouseup'], function (event) {
  events[event + ' .o-form-input'] = pointerEventsPolyfill;
});

const attributes = function (model) {
  model || (model = {});
  const collection = model && model.collection || {};
  return {
    method: 'POST',
    action: oktaUnderscore.result(model, 'urlRoot') || oktaUnderscore.result(collection, 'url') || window.location.pathname,
    'data-se': 'o-form',
    slot: 'content'
  };
};

const convertSavingState = function (rawSavingStateEvent, defaultEvent) {
  rawSavingStateEvent || (rawSavingStateEvent = '');
  let savingStateEvent = [];

  if (oktaUnderscore.isString(rawSavingStateEvent)) {
    savingStateEvent = rawSavingStateEvent.split(' ');
  }

  savingStateEvent = oktaUnderscore.union(savingStateEvent, defaultEvent);
  return savingStateEvent.join(' ');
};

const getErrorSummary = function (responseJSON = {}) {
  if (Array.isArray(responseJSON.errorCauses) && responseJSON.errorCauses.length > 0) {
    //set errorSummary from first errorCause which is not field specific error
    return responseJSON.errorCauses[0].errorSummary;
  } else {
    //set errorSummary from top level errorSummary
    return responseJSON.errorSummary;
  }
};
/**
 * A Form utility framework
 *
 * Okta.Form is a form that operates on one flat model
 * It exposes one main factory method, {@link module:Okta.Form#addInput|addInput}, which add inputs to the form,
 * and each input operates on one field in the model, identified by the `name` field.
 *
 * See:
 * [Basic O-Form Tutorial](https://github.com/okta/courage/wiki/Basic-O-Form)
 *
 * @class module:Okta.Form
 * @extends module:Okta.View
 * @param {Object} options options hash (See {@link module:Okta.View|View})
 * @param {Object} options.model the model this form operates on
 * @param {Boolean} [options.label-top=false] position label on top of inputs
 * @param {Boolean} [options.wide=false] Use a wide input layout for all input
 */

/**
 * Fired when the "Save" button is clicked
 * @event module:Okta.Form#save
 * @param {module:Okta.Model} model Model used in the form
 */

/**
 * Fired after the model is successfully saved - applies when {@link module:Okta.Form#autoSave|autoSave}
 * is set to true
 * @event module:Okta.Form#saved
 * @param {module:Okta.Model} model Model used in the form
 */

/**
 * Fired when the model fires an invalid event or an error event;
 * @event module:Okta.Form#error
 * @param {module:Okta.Model} model Model used in the form
 */

/**
 * Fired when the form layout is likely to be resized
 * @event module:Okta.Form#resize
 * @param {module:Okta.Model} model Model used in the form
 */

/**
 * Fired when the "Cancel" button is clicked
 * @event module:Okta.Form#cancel
 */


var BaseForm = BaseView.extend(
/** @lends module:Okta.Form.prototype */
{
  /**
   * Specifies how to validate form:
   * - In case "local" string provided as a value of the property,
   * the form will validate only fields added as inputs to the form;
   * - In case array is provided, the validation will be performed only for fields specified in array;
   * - In case function is provided, provided function will be used as a validation function,
   * it must return an error object with the format {fieldName: 'error text'} with as many fields as you need.
   * @name validate
   * @memberof module:Okta.Form
   * @type {String|Array|Function}
   * @instance
   */
  constructor: function (options) {
    /* eslint max-statements: 0, complexity: 0 */
    options || (options = {});
    this.options = options;

    if (options.settings) {
      this.settings = options.settings;
    } else {
      this.settings = options.settings = new SettingsModel();
    }

    this.id = oktaUnderscore.uniqueId('form');
    this.tagName = 'form';

    oktaUnderscore.defaults(this.events, events);

    oktaUnderscore.defaults(this.attributes, attributes(options.model));

    this.__buttons = [];
    this.__errorFields = {};

    this.__saveModelState(options.model);

    const step = oktaUnderscore.result(this, 'step');

    if (step) {
      // checking exists of `this.save` hence don't have to change to
      // `_.result(this, 'save')` which will execute the function and
      // is not the intent.
      if (!this.save) {
        const totalStep = oktaUnderscore.result(this, 'totalSteps');

        this.save = !totalStep || step === totalStep ? StringUtil.localize('oform.button.finish', 'courage') : StringUtil.localize('oform.button.next', 'courage');
      }

      this.className = oktaUnderscore.result(this, 'className') + ' wizard';
    }

    this.className = oktaUnderscore.result(this, 'className') + ' o-form';
    this.__toolbar = this.__createToolbar(options);
    BaseView.call(this, options);

    oktaUnderscore.each(oktaUnderscore.result(this, 'inputs') || [], function (input) {
      // to ingore extra argumests from `each` iteratee function
      // http://underscorejs.org/#each
      this.__addLayoutItem(input);
    }, this);

    this.add(this.__toolbar, ''); // NOTES: this.model shall be initialized after calling
    // super (BaseView.call(this, options)) above.
    //

    this.listenTo(this.model, 'change:__edit__', this.__applyMode);
    this.listenTo(this.model, 'invalid error', oktaUnderscore.throttle(function (model, resp, showBanner) {
      this.__showErrors(model, resp, showBanner !== false);
    }, 100, {
      trailing: false
    }));
    this.listenTo(this.model, 'form:resize', function () {
      this.trigger('resize');
    });
    this.listenTo(this.model, 'form:cancel', oktaUnderscore.throttle(this.__cancel, 100, {
      trailing: false
    }));
    this.listenTo(this.model, 'form:previous', oktaUnderscore.throttle(this.__previous, 100, {
      trailing: false
    }));
    this.__save = oktaUnderscore.throttle(this.__save, 200, {
      trailing: false
    });
    this.listenTo(this.model, 'form:save', function () {
      this.$el.submit();
    });
    this.listenTo(this.model, 'sync', function () {
      if (this.model.get('__edit__')) {
        this.model.set('__edit__', false, {
          silent: true
        });
      }

      this.__saveModelState(this.model);

      this.render();
    });
    let hasSavingState = this.getAttribute('hasSavingState');

    if (this.getAttribute('autoSave')) {
      this.listenTo(this, 'save', function (model) {
        const xhr = model.save();

        if (xhr && xhr.done) {
          xhr.done(() => {
            this.trigger('saved', model);
          });
        }
      });

      if (oktaUnderscore.isUndefined(hasSavingState)) {
        hasSavingState = true;
      }
    }
    /*
    * Attach model event listeners
    * by default, model's request event starts the form saving state,
    * error and sync event stops it
    * you can define customized saving start and stop state, like
    * customSavingState: {start: 'requestingAdditionalInfo', stop: 'retrievedAdditionalInfo'}
    * doing this does not override the default events
    */


    if (hasSavingState) {
      const customSavingState = this.getAttribute('customSavingState', {});
      this.listenTo(this.model, convertSavingState(customSavingState.start || '', ['request']), this.__setSavingState);
      this.listenTo(this.model, convertSavingState(customSavingState.stop || '', ['error', 'sync']), this.__clearSavingState);
    }
  },

  /**
   * Create the bottom button bar
   * @param  {Object} options options h
   * @return {Okta.View} The toolbar
   * @private
   */
  __createToolbar: function (options) {
    const danger = this.getAttribute('danger');
    const saveBtnClassName = danger === true ? 'button-error' : 'button-primary';

    const step = oktaUnderscore.result(this, 'step');

    const toolbar = new Toolbar(oktaUnderscore.extend({
      save: this.save || StringUtil.localize('oform.save', 'courage'),
      saveId: this.saveId,
      saveClassName: saveBtnClassName,
      cancel: this.cancel || StringUtil.localize('oform.cancel', 'courage'),
      noCancelButton: this.noCancelButton || false,
      noSubmitButton: this.noSubmitButton || false,
      buttonOrder: this.buttonOrder,
      hasPrevStep: step && step > 1
    }, options || this.options));

    oktaUnderscore.each(this.__buttons, function (args) {
      toolbar.addButton.apply(toolbar, args);
    });

    return toolbar;
  },
  className: '',
  attributes: {},
  events: {},

  /**
   * An array of input configurations to render in the form
   * @type {Array}
   */
  inputs: [],
  template: null,

  /**
   * Does the form support read/edit toggle.
   * @type {Boolean|Function}
   * @default false
   */
  read: false,

  /**
   * Is the form in readOnly mode.
   * @type {Boolean|Function}
   * @default false
   */
  readOnly: false,

  /**
   * Should we not render the button bar
   * @type {Boolean|Function}
   * @default false
   */
  noButtonBar: false,

  /**
   * Should we not render a cancel button
   * @type {Boolean|Function}
   * @default false
   */
  noCancelButton: false,

  /**
   * Should we not render a save button
   * @type {Boolean}
   * @default false
   */
  noSubmitButton: false,

  /**
   * Set the order of the save, cancel and previous buttons (left to right).
   * @type {Array.<string>}
   * @default ['previous', 'save', 'cancel']
   */
  buttonOrder: ['previous', 'save', 'cancel'],

  /**
   * The text on the save button
   * @type {String}
   * @default "Save"
   */
  save: null,

  /**
   * The text on the cancel button
   * @type {String}
   * @default "Cancel"
   */
  cancel: null,

  /**
   * To use button-error to style the submit button instead of button-primary.
   * @type {Boolean|Function}
   * @default false
   */
  danger: false,

  /**
   * A layout CSS class to add to the form
   * @type {String|Function}
   * @default ""
   */
  layout: '',

  /**
   * The step this form is in the context of a wizard
   * @type {Number}
   */
  step: undefined,

  /**
   * The total numbers of steps the wizard this form is a part of has
   * @type {Number}
   */
  totalSteps: undefined,

  /**
   * The form's title
   * @type {String|Function}
   */
  title: null,

  /**
   * The form's subtitle
   * @type {String|Function}
   */
  subtitle: null,

  /**
   * Auto-save the model when hitting save. Triggers a `saved` event when done
   * @type {Boolean}
   * @default false
   */
  autoSave: false,

  /**
   * Scroll to the top of the form on error
   * @type {Boolean|Function}
   * @default true
   */
  scrollOnError: true,

  /**
   * Show the error banner upon error
   * @type {Boolean|Function}
   * @default true
   */
  showErrors: true,

  /**
   * The form's scrollable area
   * @type {String}
   * @default ".o-form-content"
   */
  resizeSelector: '.o-form-content',

  /**
   * Sets whether or not the form shows the saving state when
   * the model is saved.  Has no effect on setSavingState and clearSavingState as those are manual calls
   * to trigger/clear the saving state.
   * @name hasSavingState
   * @memberof module:Okta.Form
   * @type {Boolean}
   * @default false
   * @instance
   */

  /**
   * Get an attribute value from options or instance.
   * Prefer options value over instance value
   * @param  {String} name Name of the attribute
   * @param  {Object} defaultValue the default value to return if the attribute is not found
   * @return {Object} The value
   */
  getAttribute: function (name, defaultValue) {
    let value = oktaUnderscore.resultCtx(this.options, name, this);

    if (oktaUnderscore.isUndefined(value)) {
      value = oktaUnderscore.result(this, name);
    }

    return !oktaUnderscore.isUndefined(value) ? value : defaultValue;
  },

  /**
   * Does this form have a "read" mode
   * @return {Boolean}
   */
  hasReadMode: function () {
    return !!this.getAttribute('read');
  },

  /**
   * Is this form in "read only" mode
   * @return {Boolean}
   */
  isReadOnly: function () {
    return !!this.getAttribute('readOnly');
  },

  /**
   * Does this form have a button bar
   * @return {Boolean}
   */
  hasButtonBar: function () {
    return !(this.getAttribute('noButtonBar') || this.isReadOnly());
  },
  render: function () {
    this.__readModeBar && this.__readModeBar.remove();

    if (this.hasReadMode() && !this.isReadOnly()) {
      const readModeBar = ReadModeBar.extend({
        formTitle: this.getAttribute('title', '')
      });
      this.__readModeBar = this.add(readModeBar, '.o-form-title-bar').last();
    }

    const html = template({
      layout: this.getAttribute('layout', ''),
      title: this.getAttribute('title', '', true),
      subtitle: this.getAttribute('subtitle', '', true),
      hasReadMode: this.hasReadMode()
    });
    this.$el.html(html);
    delete this.template;
    BaseView.prototype.render.apply(this, arguments);

    this.__applyMode();

    return this;
  },

  /**
   * Changes form UI to indicate saving.  Disables all inputs and buttons.  Use this function if you have set
   * hasSavingState to false on the the form
   * @private
   */
  __setSavingState: function () {
    this.model.trigger('form:set-saving-state');
    this.$el.addClass('o-form-saving');
  },

  /**
   * Changes form UI back to normal from the saving state.  Use this function if you are have set hasSavingState
   * to false on the form
   * @private
   */
  __clearSavingState: function () {
    this.model.trigger('form:clear-saving-state');
    this.$el.removeClass('o-form-saving');
  },

  /**
   * Toggles the visibility of the bottom button bar
   * @private
   */
  __toggleToolbar: function () {
    this.__toolbar && this.__toolbar.remove();

    if (this.hasButtonBar() && this._editMode()) {
      this.__toolbar = this.__createToolbar();
      this.add(this.__toolbar, '');
    }

    this.trigger('resize');
  },

  /**
   * Cancels this form
   * - Reset the model to the previous state
   * - Clears all errors
   * - Triggers a `cancel` event
   * - Sets the model to read mode (if applicable)
   * @private
   * @fires cancel
   */
  __cancel: function () {
    const edit = this.model.get('__edit__');
    /* eslint max-statements: [2, 12] */

    this.model.clear({
      silent: true
    });
    let data;

    if (this.model.sanitizeAttributes) {
      data = this.model.sanitizeAttributes(this.__originalModel);
    } else {
      data = oktaUnderscore.clone(this.__originalModel);
    }

    this.model.set(data, {
      silent: true
    });
    this.trigger('cancel', this.model);
    this.model.trigger('cache:clear');

    if (edit) {
      this.model.set('__edit__', false, {
        silent: true
      });
      this.model.trigger('change:__edit__', this.model, false);
    }

    this.clearErrors();
  },

  /**
   * Runs {@link module:Okta.Form#validate|validate} to check the model state.
   * Triggers an "invalid" event on the model if validation fails
   * @returns {Boolean}
   */
  isValid: function () {
    let res;
    const self = this;

    function validateArray(arr) {
      return oktaUnderscore.reduce(arr, function (memo, fieldName) {
        return oktaUnderscore.extend(memo, self.model.validateField(fieldName));
      }, {});
    }

    if (oktaUnderscore.isUndefined(this.validate)) {
      return this.model.isValid();
    } else if (oktaUnderscore.isFunction(this.validate)) {
      res = this.validate();
    } else if (oktaUnderscore.isArray(this.validate)) {
      res = validateArray(this.validate);
    } else if (this.validate === 'local') {
      res = validateArray(this.getInputs().map(function (input) {
        return input.options.name;
      }));
    }

    if (!oktaUnderscore.isEmpty(res)) {
      this.model.trigger('invalid', this.model, res);
      return false;
    } else {
      return true;
    }
  },

  /**
   * A throttled function that saves the form not more than once every 100 ms
   * Basically all this method does is trigger a `save` event
   * @fires save
   * @private
   */
  __save: function () {
    this.clearErrors();

    if (this.isValid()) {
      this.trigger('save', this.model);
    }
  },

  /**
   * In the context of a wizard, go to previous state
   * Technically all this method does is trigger a `previous` event
   * @param  {Event} e
   * @private
   */
  __previous: function () {
    this.trigger('previous', this.model);
  },

  /**
   * Renders the form in the correct mode based on the model.
   * @private
   */
  __applyMode: function () {
    this.clearErrors();

    this.__toggleToolbar();

    if (this._editMode()) {
      this.$el.addClass('o-form-edit-mode');
      this.$el.removeClass('o-form-read-mode');
      this.$('.o-form-content').removeClass('rounded-btm-4');
      this.focus();
    } else {
      this.$el.removeClass('o-form-edit-mode');
      this.$el.addClass('o-form-read-mode');
      this.$('.o-form-content').addClass('rounded-btm-4');
    }
  },

  /**
   * Is the form in edit mode
   * @return {Boolean}
   * @private
   */
  _editMode: function () {
    return this.model.get('__edit__') || !this.hasReadMode();
  },

  /**
   * Function can be overridden to alter top level error summary.
   * @param {Object} responseJSON
   *
   * @example
   * // responseJSON object
   * {
   *  errorCauses: [{errorSummary: "At least one of Proxy Status, Location, or ASN should be configured."}]
   *  errorSummary: "At least one of Proxy Status, Location, or ASN should be configured."
   *  errorCode: "E0000001"
   *  errorId: "oaepsrTCHrhT-eIi8XTm6KWWg"
   *  errorLink: "E0000001"
   *  errorSummary: "Api validation failed: networkZone"
   * }
   *
   * @method
   * @default _.identity
   */
  parseErrorMessage: oktaUnderscore.identity,
  _handleErrorScroll: function () {
    if (!this.getAttribute('scrollOnError')) {
      return;
    }

    const $el = oktaJQueryStatic('#' + this.id + ' .o-form-error-container');

    if ($el.length) {
      let $scrollContext = $el.scrollParent();
      let scrollTop; // scrollParent was almost awesome...
      // but it returns document if there are no other scrollable parents
      // document does not have offset, so here we have to replace with html, body
      // Additionally when the scroll context is html, body, $el.offset().top is fixed
      // versus when it has a different scroll context it's dynamic and requires the
      // calculation below.

      if ($scrollContext[0] === document) {
        $scrollContext = oktaJQueryStatic('html, body');
        scrollTop = $el.offset().top;
      } else {
        scrollTop = $scrollContext.scrollTop() + $el.offset().top - $scrollContext.offset().top;
      }

      $scrollContext.animate({
        scrollTop: scrollTop
      }, 400);
    }
  },

  /**
   * Show an error message based on an XHR error
   * @param  {Okta.BaseModel} model the model
   * @param  {jqXHR} xhr The jQuery XmlHttpRequest Object
   * @private
   */
  __showErrors: function (model, resp, showBanner) {
    this.trigger('error', model);
    /* eslint max-statements: 0 */

    if (!this.getAttribute('showErrors')) {
      return;
    }

    let errorSummary;
    let responseJSON = ErrorParser.getResponseJSON(resp);
    const validationErrors = ErrorParser.parseFieldErrors(resp); // trigger events for field validation errors

    if (oktaUnderscore.size(validationErrors)) {
      oktaUnderscore.each(validationErrors, function (errors, field) {
        this.model.trigger('form:field-error', this.__errorFields[field] || field, oktaUnderscore.map(errors, function (error) {
          return /^model\.validation/.test(error) ? StringUtil.localize(error, 'courage') : error;
        }));
      }, this);
    } else {
      responseJSON = this.parseErrorMessage(responseJSON);
      errorSummary = getErrorSummary(responseJSON);
    } // show the error message


    if (showBanner) {
      this.$('.o-form-error-container').addClass('o-form-has-errors');
      this.add(ErrorBanner, '.o-form-error-container', {
        options: {
          errorSummary: errorSummary
        }
      });
    } // slide to and focus on the error message


    this._handleErrorScroll();

    this.model.trigger('form:resize');
  },

  /**
   * Clears the error banner
   * @private
   */
  clearErrors: function () {
    this.$('.o-form-error-container').removeClass('o-form-has-errors');
    this.model.trigger('form:clear-errors');
    this.model.trigger('form:resize');
  },

  /**
   * Toggles between edit and read mode
   */
  toggle: function () {
    this.model.set('__edit__', !this.hasReadMode() || !this.model.get('__edit__'));
    return this;
  },
  __addLayoutItem: function (input) {
    if (InputFactory.supports(input)) {
      this.addInput(input);
    } else {
      this.__addNonInputLayoutItem(input);
    }
  },
  __addNonInputLayoutItem: function (item) {
    const itemOptions = oktaUnderscore.omit(item, 'type');

    switch (item.type) {
      case 'sectionTitle':
        this.addSectionTitle(item.title, oktaUnderscore.omit(itemOptions, 'title'));
        break;

      case 'divider':
        this.addDivider(itemOptions);
        break;

      default:
        throw new Error('unknown input: ' + item.type);
    }
  },

  /**
   * Adds a view to the buttons tool bar
   * @param {Object} params parameterized button options
   * @param {Object} options options to send to {@link module:Okta.View#add|View.add}
   */
  addButton: function (params, options) {
    this.__toolbar && this.__toolbar.addButton(params, options);

    this.__buttons.push([params, options]);
  },

  /**
   * Adds a divider
   */
  addDivider: function (options) {
    this.add('<div class="okta-form-divider form-divider"></div>');
    FormUtil.applyShowWhen(this.last(), options && options.showWhen);
    FormUtil.applyToggleWhen(this.last(), options && options.toggleWhen);
    return this;
  },

  /**
   * Adds section header
   * @param {String} title
   */
  addSectionTitle: function (title, options) {
    this.add(sectionTitleTemplate({
      title: title
    }));
    FormUtil.applyShowWhen(this.last(), options && options.showWhen);
    FormUtil.applyToggleWhen(this.last(), options && options.toggleWhen);
    return this;
  },

  /**
   * Add a form input
   * @param {Object} options Options to describe the input
   * @param {String} options.type The input type.
   * The options are: `text`, `textarea`, `select`, `checkbox`, `radio`, `switch`,
   * `password`, `number`, `textselect`, `date`, `grouppicker`, `admingrouppicker`, `su-orgspicker`
   * `file/image`, `file/cert`, `checkboxset`, `list`, `group`, `zonepicker`
   * @param {String} options.name The name of the model field this input mutates
   * @param {String|Function} [options.label]
   * The input label text.
   * When passed as a function, will invoke the function (in the context of the {@link InputLabel})
   * on render time, and use the returned value.
   * @param {String} [options.sublabel] The input sub label text
   * @param {String} [options.tooltip] A popover tooltip to be displayed next to the label
   * @param {String} [options.placeholder] Placeholder text.
   * @param {String} [options.explain] Explanation text to render below the input
   * @param {Okta.View} [options.customExplain] A custom view to render below the input (deprecated)
   * @param {Boolean} [options.disabled=false] Make this input disabled
   * @param {Boolean} [options.wide=false] Use a wide input layout
   * @param {Boolean} [options.label-top=false] position label on top of an input
   * @param {Boolean} [options.explain-top=false] position explain on top of an input (requires label-top=true)
   * @param {Number} [options.multi] have multiple in-line inputs. useful when `input` is passed as an array of inputs
   * @param {String} [options.errorField] The API error field here that maps to this input
   * @param {Boolean} [options.inlineValidation=true] Validate input on focusout
   * @param {String} [options.ariaLabel] Used to add aria-label attribute to the input when label is not present.
   * @param {Boolean} [options.group=false] Grouping set of inputs using fieldset and legend. Mainly for radio
   * @param {Object} [options.options]
   * In the context of `radio` and `select`, a key/value set of options
   *
   * @param {Object} [options.params]
   * Widget specific parameters. Varies per input.
   *
   * @param {BaseInput|Object[]} [options.input]
   * - A custom input "class" or instance - preferably a **class**, so we can automagically assign the right
   * parameters when initializing it
   * - An array of input definition object literals (such as this one)
   *
   * @param {Object} [options.showWhen]
   * Setting to define when to show (or hide) the input. The input is visible by default.
   *
   * @param {Object} [options.bindings]
   * Bind a certain model attribute to a callback function, so the function is being called on render,
   * and any time this model field changes.
   * This is similar to `showWhen` but is not limited to toggling.
   *
   * @param {Function} [options.render]
   * A post-render hook that will run upon render on InputWrapper
   *
   * @param {String|Function} className   A className to apply on the {@link InputWrapper}
   *
   * @param {Function} [options.initialize]
   * An `initialize` function to run when initializing the {@link InputWrapper}
   * Useful for state mutation on start time, and complex state logic
   *
   * @example
   * // showhen: the field will be visible when `advanced` is set to `true`
   * // and `mode` is set to `"ON"`.
   * showWhen: {
   *   'advanced': true,
   *   'mode': function (value) {
   *     return value == 'ON'; // this is identical to this.model.get('mode') == 'ON'
   *   }
   * }
   *
   * @example
   * // bindings
   * bindings: {
   *   'status mode': function (status, mode) {
   *      var labelView = this.getLabel();
   *      if (status == 1) {
   *        labelView.options.label = 'Something';
   *      }
   *      else {
   *        labelView.options.label = mode;
   *      }
   *      labelView.render();
   *   }
   * }
   */
  addInput: function (_options) {
    _options = oktaUnderscore.clone(_options);
    FormUtil.validateInput(_options, this.model);
    const inputsOptions = FormUtil.generateInputOptions(_options, this, this.__createInput).reverse(); // We need a local variable here to keep track
    // as addInput can be called either directy or through the inputs array.

    if (oktaUnderscore.isEmpty(this.getInputs().toArray())) {
      oktaUnderscore.extend(inputsOptions[0], {
        validateOnlyIfDirty: true
      });
    }

    const inputs = oktaUnderscore.map(inputsOptions, this.__createInput, this);

    oktaUnderscore.each(inputsOptions, function (input) {
      if (input.errorField) {
        this.__errorFields[input.errorField] = input.name;
      }
    }, this);

    const options = {
      inputId: oktaUnderscore.last(inputs).options.inputId,
      input: inputs,
      multi: inputsOptions.length > 1 ? inputsOptions.length : undefined
    };

    oktaUnderscore.extend(options, oktaUnderscore.omit(this.options, 'input'), oktaUnderscore.omit(_options, 'input'));

    const inputWrapper = this.__createWrapper(options);

    if (options.label !== false) {
      inputWrapper.add(this.__createLabel(options));
    }

    inputWrapper.add(this._createContainer(options)); // TODO: there may be a bug here.
    // options.input will always be an array, so options.input.type will always be undefined
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    /// @ts-ignore

    inputWrapper.type = options.type || options.input.type || 'custom';
    const args = [inputWrapper].concat(oktaUnderscore.rest(arguments));
    return this.add.apply(this, args);
  },

  /**
   * @private
   */
  __createInput: function (options) {
    options = oktaUnderscore.pick(options, FormUtil.INPUT_OPTIONS);
    return InputFactory.create(options);
  },

  /**
   * @private
   */
  __createWrapper: function (options) {
    options = oktaUnderscore.pick(options, FormUtil.WRAPPER_OPTIONS);
    return new InputWrapper(options);
  },

  /**
   * @private
   */
  __createLabel: function (options) {
    options = oktaUnderscore.pick(options, FormUtil.LABEL_OPTIONS);
    return new InputLabel(options);
  },

  /**
   * @private
   */
  _createContainer: function (options) {
    options = oktaUnderscore.pick(options, FormUtil.CONTAINER_OPTIONS);
    return new InputContainer(options);
  },

  /**
   * Stores the current attributes of the model to a private property
   * @param  {Okta.BaseModel} model The model
   * @private
   */
  __saveModelState: function (model) {
    this.__originalModel = oktaJQueryStatic.extend(true, {}, model.attributes);
  },

  /**
   * @override
   * @ignore
   */
  add: function (...args) {
    // sets a default element selector
    typeof args[1] === 'undefined' && (args[1] = '> div.o-form-content > .o-form-fieldset-container');
    return BaseView.prototype.add.apply(this, args);
  },

  /**
   * Set the focus on the first input in the form
   */
  focus: function () {
    const first = this.getInputs().first();

    if (first && first.focus) {
      first.focus();
    }

    return this;
  },

  /**
   * Disable all inputs in the form
   * @deprecated not currently in use
   */
  disable: function () {
    this.invoke('disable');
    return this;
  },

  /**
   * Enable all inputs in the form
   * @deprecated not currently in use
   */
  enable: function () {
    this.invoke('enable');
  },

  /**
   * Set the max-height for o-form-content class container within the form if a height is provided,
   * otherwise, get its computed inner height
   * @param {Number} the height in pixel to set for class o-form-content
   * @return {Number}
   */
  contentHeight: function (height) {
    const content = this.$('.o-form-content');

    if (oktaUnderscore.isNumber(height)) {
      content.css('max-height', height);
    } else {
      return content.height();
    }
  },

  /**
   * Get only the input children
   * @return {InputWrapper[]} An underscore wrapped array of {@link InputWrapper} instances
   */
  getInputs: function () {
    return oktaUnderscore(this.filter(function (view) {
      return view instanceof InputWrapper;
    }));
  }
});

export { BaseForm as default };
