import _Handlebars2 from '../../../../../lib/handlebars/dist/cjs/handlebars.runtime.js';
import oktaUnderscore from '../../../util/underscore-wrapper.js';
import SchemaUtils from '../../../util/SchemaUtil.js';
import StringUtil from '../../../util/StringUtil.js';
import Time from '../../../util/Time.js';
import BaseView from '../../BaseView.js';

const isVowel = function (string) {
  return /^[aeiou]/.test(string);
};

const getArticle = function (string) {
  return isVowel(string) ? 'an' : 'a';
};

const template = _Handlebars2.template({
  "compiler": [8, ">= 4.3.0"],
  "main": function (container, depth0, helpers, partials, data) {
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

    return "<div class=\"o-form-input-group-controls\"><span class=\"input-fix o-form-control\"><input type=\"text\" class=\"o-form-text\" name=\"" + alias4((helper = (helper = lookupProperty(helpers, "key") || (depth0 != null ? lookupProperty(depth0, "key") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
      "name": "key",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 125
        },
        "end": {
          "line": 1,
          "column": 132
        }
      }
    }) : helper)) + "\" id=\"" + alias4((helper = (helper = lookupProperty(helpers, "key") || (depth0 != null ? lookupProperty(depth0, "key") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
      "name": "key",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 138
        },
        "end": {
          "line": 1,
          "column": 145
        }
      }
    }) : helper)) + "\" value=\"" + alias4((helper = (helper = lookupProperty(helpers, "value") || (depth0 != null ? lookupProperty(depth0, "value") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
      "name": "value",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 154
        },
        "end": {
          "line": 1,
          "column": 163
        }
      }
    }) : helper)) + "\" placeholder=\"" + alias4((helper = (helper = lookupProperty(helpers, "placeholder") || (depth0 != null ? lookupProperty(depth0, "placeholder") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
      "name": "placeholder",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 178
        },
        "end": {
          "line": 1,
          "column": 193
        }
      }
    }) : helper)) + "\"/></span><a href=\"#\" class=\"link-button link-button-icon icon-only\"><span class=\"icon clear-input-16 \"></span></a></div><p class=\"o-form-input-error o-form-explain\"><span class=\"icon icon-16 error-16-small\"></span>" + alias4((helper = (helper = lookupProperty(helpers, "errorExplain") || (depth0 != null ? lookupProperty(depth0, "errorExplain") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
      "name": "errorExplain",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 408
        },
        "end": {
          "line": 1,
          "column": 424
        }
      }
    }) : helper)) + "</p>";
  },
  "useData": true
});

const errorClass = 'o-form-has-errors';
const updateArrayEvent = 'updateArray';
var DeletableBox = BaseView.extend({
  tagName: 'div',
  className: 'o-form-input-group',
  events: {
    'click a': function (e) {
      e.preventDefault();
      this.remove();
    },
    'keyup input': function () {
      this.update();
    }
  },
  isEditMode: function () {
    return !this.options.readOnly && (this.options.read !== true || this.model.get('__edit__') === true);
  },
  initialize: function () {
    this.template = template(oktaUnderscore.extend(this.options, {
      placeholder: this.getPlaceholderText(),
      errorExplain: this.getErrorExplainText()
    }));
    this.update = oktaUnderscore.debounce(this.update, this.options.debounceDelay || Time.DEBOUNCE_DELAY);
  },
  render: function () {
    if (this.isEditMode()) {
      this.$el.html(this.template);
    } else {
      this.$el.text(this.options.value);
      this.$('a').hide();
    }

    return this;
  },
  remove: function () {
    this.trigger(updateArrayEvent, null);
    this.$el.slideUp(() => {
      BaseView.prototype.remove.call(this, arguments);
    });
  },
  update: function () {
    let updatedValue = this.$('input').val();

    const parseFunc = oktaUnderscore.object([SchemaUtils.DATATYPE.number, SchemaUtils.DATATYPE.integer], [StringUtil.parseFloat, this.parseInt]);

    if (oktaUnderscore.has(parseFunc, this.options.itemType)) {
      updatedValue = parseFunc[this.options.itemType](updatedValue);
      !oktaUnderscore.isNumber(updatedValue) ? this.markInvalid() : this.clearInvalid();
    }

    this.trigger(updateArrayEvent, updatedValue);
  },
  markInvalid: function () {
    this.$el.addClass(errorClass);
  },
  clearInvalid: function () {
    this.$el.removeClass(errorClass);
  },
  getPlaceholderText: function () {
    const text = ['Enter'];
    text.push(getArticle(this.options.itemType));
    text.push(this.options.itemType.toLowerCase());
    return text.join(' ');
  },
  getErrorExplainText: function () {
    const text = ['Value must be'];
    text.push(getArticle(this.options.itemType));
    text.push(this.options.itemType.toLowerCase());
    return text.join(' ');
  },
  parseInt: function (string) {
    // native javascript parseInt is aggressive
    // there're cases we don't want a string to be parsed even though it is convertable
    // so that we don't convert a string silently before warning a user the potential error
    // this is to make sure the string is in an integer format before we parse it
    if (/^-?\d+$/.test(string)) {
      const num = parseInt(string, 10);
      return !oktaUnderscore.isNaN(num) ? num : string;
    }

    return string;
  }
});

export { DeletableBox as default };
