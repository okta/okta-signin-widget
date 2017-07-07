/* eslint max-params: [2, 6] */
define([
  'okta/underscore',
  'shared/util/TemplateUtil',
  '../BaseInput',
  '../helpers/FormUtil',
  'shared/util/Keys',
  'vendor/plugins/chosen.jquery'
], function (_, TemplateUtil, BaseInput, FormUtil, Keys) {

  var INPUT_IN_GROUP_CLASSNAME = 'o-form-control',
      INPUT_ERROR_CLASSNAME = 'o-form-has-errors';

  var textTemplate = TemplateUtil.tpl('\
    <span class="okta-form-input-field input-fix">\
      <input id="{{inputId}}" type="text" name="{{textName}}" value="{{textValue}}" class="o-form-text" \
        placeholder="{{textPlaceholder}}">\
    </span>\
  ');
  var selectTemplate = TemplateUtil.tpl('\
    <select name="{{selectName}}">\
      {{#each options}}\
        <option value="{{@key}}">{{this}}</option>\
      {{/each}}\
    </select>\
  ');


  /**
   * @class TextPlusSelect
   * A component that shows a text box and a select side by side.
   * Order can be reversed. An input for {@link Okta.Form}
   */
  return BaseInput.extend({

    /**
    * @Override
    */
    className: 'o-form-input-group',

    /**
    * @Override
    */
    events: {
      'input input': 'update',
      'change input': 'update',
      'keydown input': 'update',
      'keyup input': function (e) {
        if (Keys.isEnter(e)) {
          this.model.trigger('form:save');
        }
        else if (Keys.isEsc(e)) {
          this.model.trigger('form:cancel');
        }
      },
      'change select': 'update'
    },

    /**
    * @Override
    * [0]: text box placeholder, [1]: select placeholder
    */
    defaultPlaceholder: ['', ''],

    /**
    * @Override
    * Example of how to add this input from BaseForm:
    * ```javascript
    * this.addInput({
    *   type: 'text+select',  // shows text input first, then select input
    *   name: ['weight', 'massUnit'], // model attribute names 0: text input, 1: select input
    *   placeholder: ['Enter the weight...', 'Choose a mass unit'], // placeholder text 0: text input, 1: select input
    *   options: { // select dropdown options
    *     'kg': 'kilograms',
    *     'lb': 'pounds'
    *   }
    * });
    *
    * this.addInput({
    *   type: 'select+text',  // shows select input first, then text input
    *   name: ['amount', 'currencySymbol'], // name array elements are in the same order as in type "text+select"
    *    // placeholder array elements are in the same order as in type "text+select"
    *   placeholder: ['Enter the amount...', 'Choose a currency symbol'],
    *   options: {
    *     'usd': '$',
    *     'euro': '€'
    *   }
    * });
    * ```
    */
    constructor: function (options) {
      if (!_.isArray(options.name) || options.name.length !== 2) {
        throw new Error('name has to be an array of length 2');
      }
      if (options.placeholder && !(_.isArray(options.placeholder) && options.placeholder.length === 2)) {
        throw new Error('placeholder has to be an array of length 2');
      }
      this.names = options.name;
      BaseInput.prototype.constructor.call(this, options);
    },

    /**
    * @Override
    * listens to both the text box and select attribute changes
    */
    addModelListeners: function () {
      this.listenTo(this.model, 'form:field-error', function (name) {
        if (_.contains(this.names, name)) {
          this.__markError(name);
        }
      });

      this.listenTo(this.model, 'form:clear-errors ' + FormUtil.changeEventString(this.names), this.__clearError);
    },

    /**
    * @Override
    */
    editMode: function () {
      /* eslint max-statements: [2, 11]*/
      var modelValues = this.__getModelValues(),
          textHtml = textTemplate({
            inputId: this.options.inputId,
            textName: this.names[0],
            textValue: modelValues[0],
            textPlaceholder: this.options.placeholder[0]
          }),
          selectHtml = selectTemplate({
            selectName: this.names[1],
            options: this.__getSelectOptions()
          });

      if (this.options.type === 'select+text') {
        this.$el.html(selectHtml + textHtml);
      } else {
        this.$el.html(textHtml + selectHtml);
      }

      this.$textContainer = this.$('span.input-fix');
      this.$textInput = this.$('input');
      this.$select = this.$('select');

      if (modelValues[1]) {
        // jQuery.val(value) prepends an empty option to the dropdown
        // if value doesnt exist in the dropdown.
        // http://bugs.jquery.com/ticket/13514
        // consistent with Select.js
        this.$select.val(modelValues[1]);
      }

      this.__applyChosen();
      return this;
    },

    /**
    * @Override
    */
    readMode: function () {
      this.$el.text(this.getReadModeString());
      return this;
    },

    toStringValue: function () {
      var displayString = this.__toStringValues();
      if (this.options.type === 'select+text') {
        return displayString[1] + ' ' + displayString[0];
      } else {
        return displayString[0] + ' ' + displayString[1];
      }
    },

    /**
    * @Override
    * update both the text box and select model attribute values
    */
    update: function () {
      var values = [this.$textInput.val(), this.$select.val() || undefined];
      if (_.isFunction(this.to)) {
        values = this.to.apply(this, values);
      }
      if (_.isFunction(this.options.to)) {
        values = this.options.to.apply(this, values);
      }
      this.model.set(_.object(this.names, values));
    },

    /**
    * @Override
    */
    focus: function () {
      return this.$textInput.focus();
    },

    __applyChosen: function () {
      _.defer(_.bind(function () {
        this.$select.chosen({
          'disable_search_threshold': 10,
          'placeholder_text': this.options.placeholder[1]
        });
        // chosen selects the first option by default
        // call update() here to set attribute value in the model
        this.update();
        this.$chosenContainer = this.$('.chzn-container');
        this.model.trigger('form:resize');

        // apply 'o-form-control' after chosen is applied to the select,
        // so that width on text and select input are calculated correctly
        _.defer(_.bind(function () {
          this.$textContainer.addClass(INPUT_IN_GROUP_CLASSNAME);
          this.$chosenContainer.addClass(INPUT_IN_GROUP_CLASSNAME);
        }, this));

      }, this));
    },

    /**
    * returns an array of [0] the text box and [1] select model attribute values
    * @private
    */
    __getModelValues: function () {
      var textInputValue = this.model.get(this.names[0]),
          selectValue = this.model.get(this.names[1]),
          values = [textInputValue, selectValue];

      if (_.isFunction(this.from)) {
        values = this.from.apply(this, values);
      }
      if (_.isFunction(this.options.from)) {
        values = this.options.from.apply(this, values);
      }
      if (!_.isArray(values)) {
        throw new Error('values are not in an array');
      }
      else if (values.length !== 2) {
        throw new Error('values array is not in length of 2');
      }
      return values;
    },

    __getSelectOptions: function () {
      var options = this.options.options;

      if (_.isFunction(options)) {
        options = options.call(this);
      }

      return _.isObject(options) ? options : {};
    },

    /**
    * @Override
    */
    __markError: function (name) {
      var errorInput = _.indexOf(this.names, name);
      if (errorInput === 0) {
        this.$textContainer.addClass(INPUT_ERROR_CLASSNAME);
      }
      else {
        this.$chosenContainer.addClass(INPUT_ERROR_CLASSNAME);
      }
    },

    __toStringValues: function () {
      var modelValues = this.__getModelValues();
      if (this.options.options) {
        modelValues[1] = this.options.options[modelValues[1]];
      }
      return modelValues || ['', ''];
    }
  });
});
