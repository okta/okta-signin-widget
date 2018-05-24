/* eslint max-params: [2, 14], max-statements: [2, 11] */
define([
  'okta/underscore',
  'okta/jquery',
  'shared/util/TemplateUtil',
  'shared/util/StringUtil',
  'shared/views/BaseView',
  './helpers/InputFactory',
  './helpers/InputLabel',
  './helpers/InputContainer',
  './helpers/InputWrapper',
  './helpers/ErrorBanner',
  './helpers/ErrorParser',
  './helpers/FormUtil',
  './components/ReadModeBar',
  './components/Toolbar'
],
function (_, $, TemplateUtil, StringUtil, BaseView,
          InputFactory, InputLabel, InputContainer, InputWrapper,
          ErrorBanner, ErrorParser, FormUtil, ReadModeBar, Toolbar) {

  var template = '\
    {{#if hasReadMode}}\
      <h2 class="o-form-title-bar" data-se="o-form-title-bar">\
        {{title}}\
      </h2>\
    {{/if}}\
    <div data-se="o-form-content" class="o-form-content {{layout}} clearfix">\
      {{#unless hasReadMode}}\
        {{#if title}}\
          <h2 data-se="o-form-head" class="okta-form-title o-form-head">{{title}}</h2>\
        {{/if}}\
      {{/unless}}\
      {{#if subtitle}}\
        <p class="okta-form-subtitle o-form-explain" data-se="o-form-explain">{{subtitle}}</p>\
      {{/if}}\
      <div class="o-form-error-container" data-se="o-form-error-container"></div>\
      <div class="o-form-fieldset-container" data-se="o-form-fieldset-container"></div>\
    </div>\
  ';

  // polyfill for `pointer-events: none;` in IE < 11
  // Logic borrowed from https://github.com/kmewhort/pointer_events_polyfill (BSD)
  var pointerEventsSupported = ($('<div>').css({'pointer-events': 'auto'})[0].style.pointerEvents === 'auto');
  function pointerEventsPolyfill(e) {
    if (!pointerEventsSupported && this.$el.hasClass('o-form-saving')) {
      var $el = $(e.currentTarget);

      $el.css('display', 'none');
      var underneathElem = document.elementFromPoint(e.clientX, e.clientY);
      $el.css('display', 'block');

      e.target = underneathElem;
      $(underneathElem).trigger(e);

      return false;
    }
  }


  var events = {
    submit: function (e) {
      e.preventDefault();
      this.__save();
    }
  };

  _.each(['click', 'dblclick', 'mousedown', 'mouseup'], function (event) {
    events[event + ' .o-form-input'] = pointerEventsPolyfill;
  });

  var attributes = function (model) {
    model || (model = {});
    var collection = model && model.collection || {};
    return {
      method: 'POST',
      action: _.result(model, 'urlRoot') || _.result(collection, 'url') || window.location.pathname,
      'data-se': 'o-form'
    };
  };

  var convertSavingState = function (rawSavingStateEvent, defaultEvent) {
    rawSavingStateEvent || (rawSavingStateEvent = '');
    var savingStateEvent = [];
    if (_.isString(rawSavingStateEvent)) {
      savingStateEvent = rawSavingStateEvent.split(' ');
    }
    savingStateEvent = _.union(savingStateEvent, defaultEvent);
    return savingStateEvent.join(' ');
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

  return BaseView.extend(/** @lends module:Okta.Form.prototype */ {

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

      this.id = _.uniqueId('form');
      this.tagName = 'form';

      _.defaults(this.events, events);
      _.defaults(this.attributes, attributes(options.model));

      this.__buttons = [];
      this.__errorFields = {};

      this.__saveModelState(options.model);

      if (this.step) {
        if (!this.save) {
          this.save = (!this.totalSteps || this.step === this.totalSteps) ? 'Finish' : 'Next';
        }
        this.className += ' wizard';
      }
      this.className += ' o-form';

      this.__toolbar = this.__createToolbar(options);

      BaseView.call(this, options);

      _.each(_.result(this, 'inputs') || [], function (input) {
        // to ingore extra argumests from `each` iteratee function
        // http://underscorejs.org/#each
        this.__addLayoutItem(input);
      }, this);

      this.add(this.__toolbar, '');

      this.listenTo(this.model, 'change:__edit__', this.__applyMode);

      this.listenTo(this.model, 'invalid error', _.throttle(function (model, resp, showBanner) {
        this.__showErrors(model, resp, showBanner !== false);
      }, 100, {trailing: false}));

      this.listenTo(this.model, 'form:resize', function () {
        this.trigger('resize');
      });

      this.listenTo(this.model, 'form:cancel', _.throttle(this.__cancel, 100, {trailing: false}));
      this.listenTo(this.model, 'form:previous', _.throttle(this.__previous, 100, {trailing: false}));

      this.__save = _.throttle(this.__save, 200, {trailing: false});
      this.listenTo(this.model, 'form:save', function () {
        this.$el.submit();
      });

      this.listenTo(this.model, 'sync', function () {
        if (this.model.get('__edit__')) {
          this.model.set('__edit__', false, {silent: true});
        }
        this.__saveModelState(this.model);
        this.render();
      });

      var hasSavingState = this.getAttribute('hasSavingState');

      if (this.getAttribute('autoSave')) {
        this.listenTo(this, 'save', function (model) {
          var xhr = model.save();
          if (xhr && xhr.done) {
            xhr.done(_.bind(function () {
              this.trigger('saved', model);
            }, this));
          }
        });
        if (_.isUndefined(hasSavingState)) {
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
        var customSavingState = this.getAttribute('customSavingState', {});
        this.listenTo(
          this.model,
          convertSavingState(customSavingState.start || '', ['request']),
          this.__setSavingState
        );
        this.listenTo(
          this.model,
          convertSavingState(customSavingState.stop || '', ['error', 'sync']),
          this.__clearSavingState
        );
      }
    },

    /**
     * Create the bottom button bar
     * @param  {Object} options options h
     * @return {Okta.View} The toolbar
     * @private
     */
    __createToolbar: function (options) {

      var danger = this.getAttribute('danger'),
          saveBtnClassName = danger === true ? 'button-error' : 'button-primary';

      var toolbar = new Toolbar(_.extend({
        save: this.save || StringUtil.localize('oform.save', 'courage'),
        saveId: this.saveId,
        saveClassName: saveBtnClassName,
        cancel: this.cancel || StringUtil.localize('oform.cancel', 'courage'),
        noCancelButton: this.noCancelButton || false,
        hasPrevStep: this.step && this.step > 1
      }, options || this.options));

      _.each(this.__buttons, function (args) {
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
      var value = _.resultCtx(this.options, name, this);
      if (_.isUndefined(value)) {
        value = _.result(this, name);
      }
      return !_.isUndefined(value) ? value : defaultValue;
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
        var readModeBar = ReadModeBar.extend({
          formTitle: this.getAttribute('title', '')
        });
        this.__readModeBar = this.add(readModeBar, '.o-form-title-bar').last();
      }

      var html = TemplateUtil.tpl(template)({
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
      /* eslint max-statements: [2, 12] */
      var edit = this.model.get('__edit__');
      this.model.clear({silent: true});
      var data;
      if (this.model.sanitizeAttributes) {
        data = this.model.sanitizeAttributes(this.__originalModel);
      }
      else {
        data = _.clone(this.__originalModel);
      }
      this.model.set(data, {silent: true});
      this.trigger('cancel', this.model);
      this.model.trigger('cache:clear');
      if (edit) {
        this.model.set('__edit__', false, {silent: true});
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
      var res,
          self = this;

      function validateArray(arr) {
        return _.reduce(arr, function (memo, fieldName) {
          return _.extend(memo, self.model.validateField(fieldName));
        }, {});
      }

      if (_.isUndefined(this.validate)) {
        return this.model.isValid();
      }
      else if (_.isFunction(this.validate)) {
        res = this.validate();
      }
      else if (_.isArray(this.validate)) {
        res = validateArray(this.validate);
      }
      else if (this.validate === 'local') {
        res = validateArray(this.getInputs().map(function (input) {
          return input.options.name;
        }));
      }

      if (!_.isEmpty(res)) {
        this.model.trigger('invalid', this.model, res);
        return false;
      }
      else {
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
      }
      else {
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
     * Function can be overridden to alter error summary
     * @param {Object} responseJSON
     * @method
     * @default _.identity
     */
    parseErrorMessage: _.identity,

    /**
     * Show an error message based on an XHR error
     * @param  {Okta.BaseModel} model the model
     * @param  {jqXHR} xhr The jQuery XmlHttpRequest Object
     * @private
     */
    __showErrors: function (model, resp, showBanner) {
      this.trigger('error', model);

      /* eslint max-statements: 0 */
      if (this.getAttribute('showErrors')) {

        var errorSummary;
        var responseJSON = ErrorParser.getResponseJSON(resp);

        // trigger events for field validation errors
        var validationErrors = ErrorParser.parseFieldErrors(resp);
        if (_.size(validationErrors)) {
          _.each(validationErrors, function (errors, field) {
            this.model.trigger('form:field-error', this.__errorFields[field] || field, _.map(errors, function (error) {
              return (/^model\.validation/).test(error) ? StringUtil.localize(error, 'courage') : error;
            }));
          }, this);
        }
        else if (responseJSON && Array.isArray(responseJSON.errorCauses) && responseJSON.errorCauses.length > 0){
          //set errorSummary from first errorCause which is not field specific error
          errorSummary = responseJSON.errorCauses[0].errorSummary;
        } else {
          //set errorSummary from top level errorSummary
          responseJSON = this.parseErrorMessage(responseJSON);
          errorSummary = responseJSON && responseJSON.errorSummary;
        }

        // show the error message
        if (showBanner) {
          this.$('.o-form-error-container').addClass('o-form-has-errors');
          this.add(ErrorBanner, '.o-form-error-container', {options: {errorSummary: errorSummary}});
        }

        // slide to and focus on the error message
        if (this.getAttribute('scrollOnError')) {
          var $el = $('#' + this.id + ' .o-form-error-container');
          $el.length && $('html, body').animate({scrollTop: $el.offset().top}, 400);
        }

        this.model.trigger('form:resize');

      }
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
      }
      else {
        this.__addNonInputLayoutItem(input);
      }
    },

    __addNonInputLayoutItem: function (item) {
      var itemOptions = _.omit(item, 'type');
      switch (item.type) {
      case 'sectionTitle':
        this.addSectionTitle(item.title, _.omit(itemOptions, 'title'));
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
      this.add(TemplateUtil.tpl('<h2 class="o-form-head">{{title}}</h2>')({title: title}));
      FormUtil.applyShowWhen(this.last(), options && options.showWhen);
      FormUtil.applyToggleWhen(this.last(), options && options.toggleWhen);
      return this;
    },

    /**
     * Add a form input
     * @param {Object} options Options to describe the input
     * @param {String} options.type The input type.
     * The options are: `text`, `textarea`, `select`, `checkbox`, `radio`,
     * `password`, `number`, `textselect`, `date`, `grouppicker`, `su-orgspicker`
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
     * @param {Number} [options.multi] have multiple in-line inputs. useful when `input` is passed as an array of inputs
     * @param {String} [options.errorField] The API error field here that maps to this input
     * @param {Boolean} [options.inlineValidation=true] Validate input on focusout
     * @param {String} [options.ariaLabel] Used to add aria-label attribute to the input when label is not present.

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

      _options = _.clone(_options);

      FormUtil.validateInput(_options, this.model);

      var inputsOptions = FormUtil.generateInputOptions(_options, this, this.__createInput).reverse();

      // We need a local variable here to keep track
      // as addInput can be called either directy or through the inputs array.
      if (_.isEmpty(this.getInputs().toArray())) {
        _.extend(inputsOptions[0], {validateOnlyIfDirty: true});
      }
      var inputs = _.map(inputsOptions, this.__createInput, this);

      _.each(inputsOptions, function (input) {
        if (input.errorField) {
          this.__errorFields[input.errorField] = input.name;
        }
      }, this);

      var options = {
        inputId: _.last(inputs).options.inputId,
        input: inputs,
        multi: inputsOptions.length > 1 ? inputsOptions.length : undefined
      };
      _.extend(options, _.omit(this.options, 'input'), _.omit(_options, 'input'));

      var inputWrapper = this.__createWrapper(options);
      if (options.label !== false) {
        inputWrapper.add(this.__createLabel(options));
      }
      inputWrapper.add(this._createContainer(options));
      inputWrapper.type = options.type || options.input.type || 'custom';

      var args = [inputWrapper].concat(_.drop(arguments, 1));
      return this.add.apply(this, args);
    },

    /**
     * @private
     */
    __createInput: function (options) {
      options = _.pick(options, FormUtil.INPUT_OPTIONS);
      return InputFactory.create(options);
    },

    /**
     * @private
     */
    __createWrapper: function (options) {
      options = _.pick(options, FormUtil.WRAPPER_OPTIONS);
      return new InputWrapper(options);
    },

    /**
     * @private
     */
    __createLabel: function (options) {
      options = _.pick(options, FormUtil.LABEL_OPTIONS);
      return new InputLabel(options);
    },

    /**
     * @private
     */
    _createContainer: function (options) {
      options = _.pick(options, FormUtil.CONTAINER_OPTIONS);
      return new InputContainer(options);
    },

    /**
     * Stores the current attributes of the model to a private property
     * @param  {Okta.BaseModel} model The model
     * @private
     */
    __saveModelState: function (model) {
      this.__originalModel = model.clone().attributes;
    },

    /**
     * @override
     * @ignore
     */
    add: function () {
      var args = _.toArray(arguments);
      typeof args[1] === 'undefined' && (args[1] = '> div.o-form-content > .o-form-fieldset-container');
      return BaseView.prototype.add.apply(this, args);
    },

    /**
     * Set the focus on the first input in the form
     */
    focus: function () {
      var first = this.getInputs().first();
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
      var content = this.$('.o-form-content');
      if (_.isNumber(height)) {
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
      return _(this.filter(function (view) {
        return view instanceof InputWrapper;
      }));
    }

  });

});
