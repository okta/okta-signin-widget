import _Handlebars2 from '../../../../../lib/handlebars/dist/cjs/handlebars.runtime.js';
import oktaUnderscore from '../../../util/underscore-wrapper.js';
import BaseInput from '../BaseInput.js';
import StringUtil from '../../../util/StringUtil.js';

const template = _Handlebars2.template({
  "compiler": [8, ">= 4.3.0"],
  "main": function (container, depth0, helpers, data) {
    var helper,
        alias1 = depth0 != null ? depth0 : container.nullContext || {},
        alias2 = container.hooks.helperMissing,
        alias3 = "function",
        alias4 = container.escapeExpression,
        lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return "<select id=\"" + alias4((helper = (helper = lookupProperty(helpers, "inputId") || (depth0 != null ? lookupProperty(depth0, "inputId") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
      "name": "inputId",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 12
        },
        "end": {
          "line": 1,
          "column": 23
        }
      }
    }) : helper)) + "\" name=\"" + alias4((helper = (helper = lookupProperty(helpers, "name") || (depth0 != null ? lookupProperty(depth0, "name") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
      "name": "name",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 31
        },
        "end": {
          "line": 1,
          "column": 39
        }
      }
    }) : helper)) + "\"></select>";
  },
  "useData": true
});

const option = _Handlebars2.template({
  "compiler": [8, ">= 4.3.0"],
  "main": function (container, depth0, helpers, data) {
    var helper,
        alias1 = depth0 != null ? depth0 : container.nullContext || {},
        alias2 = container.hooks.helperMissing,
        alias3 = "function",
        alias4 = container.escapeExpression,
        lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return "<option value=\"" + alias4((helper = (helper = lookupProperty(helpers, "key") || (depth0 != null ? lookupProperty(depth0, "key") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
      "name": "key",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 15
        },
        "end": {
          "line": 1,
          "column": 22
        }
      }
    }) : helper)) + "\">" + alias4((helper = (helper = lookupProperty(helpers, "value") || (depth0 != null ? lookupProperty(depth0, "value") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
      "name": "value",
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
    }) : helper)) + "</option>";
  },
  "useData": true
});

var Select = BaseInput.extend({
  className: 'o-form-select',

  /**
   * @Override
   */
  events: {
    'change select': 'update',
  },
  constructor: function () {
    this.template = template;
    this.option = this.option || option;
    BaseInput.apply(this, arguments);
    this.params = this.options.params || {};
  },

  /**
   * @Override
   */
  editMode: function () {
    /* eslint max-statements: [2, 17] */
    this.$el.html(template(this.options));
    this.$select = this.$('select');
    this.appendOptions(); // Fix a regression in jQuery 1.x on Firefox
    // jQuery.val(value) prepends an empty option to the dropdown
    // if value doesnt exist in the dropdown.
    // http://bugs.jquery.com/ticket/13514

    const value = this.getModelValue();

    if (value) {
      this.$select.val(value);
    } else {
      this.$('option:first-child').prop('selected', true);
    }

    this.$el.addClass('o-form-control');

    return this;
  },
  appendOptions: function () {
    if (!this.getOptions()) {
      return;
    }

    const options = this.getOptions();
    const keys = Object.keys(options);
    this.applySortByKey(keys);
    keys.forEach(key => {
      // option with no value is a placeholder
      if (!key) {
        this.$select.prepend(this.option({
          key: '',
          value: StringUtil.localize('select.default_value', 'login')
        }));
      } else {
        this.$select.append(this.option({
          key: key,
          value: options[key]
        }));
      }
    });

    // manually trigger the update event when the select is loaded so the initial selected value is set in the model
    oktaUnderscore.defer(oktaUnderscore.bind(this.update, this));
  },
  applySortByKey: function (keys) {
    const sortByKey = this.options.sortByKey;

    if (!sortByKey) {
      return;
    }

    if (sortByKey instanceof Function) {
      keys.sort(sortByKey);
    }

    if (sortByKey === 'asc') {
      keys.sort();
    }

    if (sortByKey === 'desc') {
      keys.sort();
      keys.reverse();
    }
  },

  /**
   * @Override
   */
  val: function () {
    return this.$select && this.$select.val();
  },

  /**
   * @Override
   */
  focus: function () {
    if (this.$select) {
      return this.$select.focus();
    }
  },

  /**
   * @Override
   */
  toStringValue: function () {
    const selectedOption = this.getModelValue();
    let displayString = selectedOption;
    const options = this.getOptions();

    if (!oktaUnderscore.isEmpty(options)) {
      displayString = options[selectedOption];
    }

    if (oktaUnderscore.isUndefined(displayString)) {
      displayString = this.defaultValue();
    }

    return displayString || '';
  },

  /**
   * Convert options to an object
   * support input options that is a
   * 1. a static object such as {key1: val1, key2: val2...}
   * 2. a function to be called to return a static object
   * will return an object with key-value pairs or with empty content
   * @return {Object} The value
   */
  getOptions: function () {
    let options = this.options.options;

    if (oktaUnderscore.isFunction(options)) {
      options = options.call(this);
    }

    return oktaUnderscore.isObject(options) ? options : {};
  },
  remove: function () {
    if (this.$select) {
      this.$select.trigger('remove');
    }

    return BaseInput.prototype.remove.apply(this, arguments);
  },

  /**
   * Code to make the select/combobox component accessible with screen readers.
   *
   * @param {boolean} isComboBox - Is the select a combobox?
   * @param {object} params - params like aria label
   */
  // eslint-disable-next-line max-statements
  accessibilityUpdate: function (isComboBox, params) {
    const txtBoxId = this.$select.attr('id') + '_txt';
    const ariaDivId = this.$select.attr('id') + '_aria_div_id';
    const ulTagId = this.$select.attr('id') + '_ul'; // this is to fix(OKTA-506711) the accessibility issue due to partial support of aria-activedescendant
    // by Safari. Make use of aria-live to make screenReader announce the option selected by user as a workaround.

    if (isComboBox) {
      this.$('input[type=text]').attr('id', txtBoxId).attr('aria-autocomplete', 'list').attr('aria-activedescendant', '').attr('role', 'combobox').attr('aria-expanded', 'true').attr('aria-controls', ulTagId);
    } else {
      this.$('input[type=text]').attr('id', txtBoxId).attr('role', 'listbox');
    }

    if (params && params.aria && params.aria.label) {
      const ariaLabel = params.aria.label.trim();
      this.$('input[type=text]').attr('id', txtBoxId).attr('aria-label', ariaLabel);
    } else {
      const ariaLabel = this.$el.parent().prev('.o-form-label').find('label').text().trim();
      this.$('input[type=text]').attr('id', txtBoxId).attr('aria-label', ariaLabel);
    }
  }
});

export { Select as default };
