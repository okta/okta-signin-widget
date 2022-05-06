import _Handlebars2 from '../../../../../lib/handlebars/dist/cjs/handlebars.runtime.js';
import oktaJQueryStatic from '../../../util/jquery-wrapper.js';
import oktaUnderscore from '../../../util/underscore-wrapper.js';
import Keys from '../../../util/Keys.js';
import Util from '../../../util/Util.js';
import BaseView from '../../BaseView.js';
import '../../../vendor/plugins/jquery.custominput.js';
import BaseInput from '../BaseInput.js';

const isABaseView = Util.isABaseView;
const RadioRadioOption = BaseView.extend({
  template: _Handlebars2.template({
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

      return "<input type=\"radio\" name=\"" + alias4((helper = (helper = lookupProperty(helpers, "name") || (depth0 != null ? lookupProperty(depth0, "name") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
        "name": "name",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 26
          },
          "end": {
            "line": 1,
            "column": 34
          }
        }
      }) : helper)) + "\" data-se-name=\"" + alias4((helper = (helper = lookupProperty(helpers, "realName") || (depth0 != null ? lookupProperty(depth0, "realName") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
        "name": "realName",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 50
          },
          "end": {
            "line": 1,
            "column": 62
          }
        }
      }) : helper)) + "\" value=\"" + alias4((helper = (helper = lookupProperty(helpers, "value") || (depth0 != null ? lookupProperty(depth0, "value") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
        "name": "value",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 71
          },
          "end": {
            "line": 1,
            "column": 80
          }
        }
      }) : helper)) + "\" id=\"" + alias4((helper = (helper = lookupProperty(helpers, "optionId") || (depth0 != null ? lookupProperty(depth0, "optionId") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
        "name": "optionId",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 86
          },
          "end": {
            "line": 1,
            "column": 98
          }
        }
      }) : helper)) + "\"><label for=\"" + alias4((helper = (helper = lookupProperty(helpers, "optionId") || (depth0 != null ? lookupProperty(depth0, "optionId") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
        "name": "optionId",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 112
          },
          "end": {
            "line": 1,
            "column": 124
          }
        }
      }) : helper)) + "\" data-se-for-name=\"" + alias4((helper = (helper = lookupProperty(helpers, "realName") || (depth0 != null ? lookupProperty(depth0, "realName") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
        "name": "realName",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 144
          },
          "end": {
            "line": 1,
            "column": 156
          }
        }
      }) : helper)) + "\" class=\"radio-label\">" + alias4((helper = (helper = lookupProperty(helpers, "label") || (depth0 != null ? lookupProperty(depth0, "label") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
        "name": "label",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 178
          },
          "end": {
            "line": 1,
            "column": 187
          }
        }
      }) : helper)) + "</label>";
    },
    "useData": true
  }),
  initialize: function (options) {
    let explain;
    explain = options.explain;

    if (oktaUnderscore.isFunction(explain) && !isABaseView(explain)) {
      explain = oktaUnderscore.resultCtx(this.options, 'explain', this);
    }

    if (!explain) {
      return;
    }

    if (isABaseView(explain)) {
      this.add('<p class="o-form-explain"></p>', '.radio-label');
      this.add(explain, '.o-form-explain');
    } else {
      this.add(BaseView.extend({
        className: 'o-form-explain',
        tagName: 'p',
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

            return container.escapeExpression((helper = (helper = lookupProperty(helpers, "explain") || (depth0 != null ? lookupProperty(depth0, "explain") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
              "name": "explain",
              "hash": {},
              "data": data,
              "loc": {
                "start": {
                  "line": 1,
                  "column": 0
                },
                "end": {
                  "line": 1,
                  "column": 11
                }
              }
            }) : helper));
          },
          "useData": true
        })
      }), '.radio-label');
    }
  }
});
var Radio = BaseInput.extend({
  /**
   * @Override
   */
  events: {
    'change :radio': 'update',
    keyup: function (e) {
      if (Keys.isSpaceBar(e)) {
        oktaJQueryStatic(e.target).click();
      } else if (Keys.isEnter(e)) {
        this.model.trigger('form:save');
      }
    }
  },

  /**
   * @Override
   */
  editMode: function () {
    const templates = [];
    this.$el.empty();

    oktaUnderscore.each(this.options.options, function (value, key) {
      const options = {
        optionId: oktaUnderscore.uniqueId('option'),
        name: this.options.inputId,
        realName: this.options.name,
        value: key
      };

      if (!oktaUnderscore.isObject(value)) {
        value = {
          label: value
        };
      }

      oktaUnderscore.extend(options, value);

      templates.push(new RadioRadioOption(options).render().el);
    }, this);

    this.$el.append(templates);
    let value = this.getModelValue();

    if (value) {
      this.$(':radio[value=' + value + ']').prop('checked', true);
    }

    this.$('input').customInput();
    this.model.trigger('form:resize');

    if (this.getParam('inline') === true) {
      this.$('div.custom-radio').addClass('inline');
    }

    return this;
  },

  /**
   * @Override
   */
  readMode: function () {
    this.editMode();
    this.$(':radio').prop('disabled', true);
    return this;
  },

  /**
   * @Override
   */
  val: function () {
    return this.$(':radio:checked').val();
  },

  /**
   * @Override
   */
  focus: function () {
    return this.$('label:eq(0)').focus();
  }
});

export { Radio as default };
