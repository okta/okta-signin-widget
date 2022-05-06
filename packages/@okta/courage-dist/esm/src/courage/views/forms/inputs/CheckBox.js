import _Handlebars2 from '../../../../../lib/handlebars/dist/cjs/handlebars.runtime.js';
import oktaUnderscore from '../../../util/underscore-wrapper.js';
import Keys from '../../../util/Keys.js';
import '../../../vendor/plugins/jquery.custominput.js';
import BaseInput from '../BaseInput.js';

var CheckBox = BaseInput.extend({
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

      return "<input type=\"checkbox\" name=\"" + alias4((helper = (helper = lookupProperty(helpers, "name") || (depth0 != null ? lookupProperty(depth0, "name") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
        "name": "name",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 29
          },
          "end": {
            "line": 1,
            "column": 37
          }
        }
      }) : helper)) + "\" id=\"" + alias4((helper = (helper = lookupProperty(helpers, "inputId") || (depth0 != null ? lookupProperty(depth0, "inputId") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
        "name": "inputId",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 43
          },
          "end": {
            "line": 1,
            "column": 54
          }
        }
      }) : helper)) + "\"/><label for=\"" + alias4((helper = (helper = lookupProperty(helpers, "inputId") || (depth0 != null ? lookupProperty(depth0, "inputId") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
        "name": "inputId",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 69
          },
          "end": {
            "line": 1,
            "column": 80
          }
        }
      }) : helper)) + "\" data-se-for-name=\"" + alias4((helper = (helper = lookupProperty(helpers, "name") || (depth0 != null ? lookupProperty(depth0, "name") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
        "name": "name",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 100
          },
          "end": {
            "line": 1,
            "column": 108
          }
        }
      }) : helper)) + "\">" + alias4((helper = (helper = lookupProperty(helpers, "placeholder") || (depth0 != null ? lookupProperty(depth0, "placeholder") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
        "name": "placeholder",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 110
          },
          "end": {
            "line": 1,
            "column": 125
          }
        }
      }) : helper)) + "</label>";
    },
    "useData": true
  }),

  /**
   * @Override
   */
  events: {
    'change :checkbox': 'update',
    keyup: function (e) {
      e.preventDefault();

      if (Keys.isSpaceBar(e)) {
        this.$(':checkbox').click();
      } else if (Keys.isEnter(e)) {
        this.model.trigger('form:save');
      }
    }
  },

  /**
   * @Override
   */
  editMode: function () {
    let placeholder = oktaUnderscore.resultCtx(this.options, 'placeholder', this);

    if (placeholder === '') {
      placeholder = oktaUnderscore.resultCtx(this.options, 'label', this);
    } else if (placeholder === false) {
      placeholder = '';
    }

    this.$el.html(this.template(oktaUnderscore.extend(oktaUnderscore.omit(this.options, 'placeholder'), {
      placeholder: placeholder
    })));
    const $input = this.$(':checkbox');
    $input.prop('checked', this.getModelValue() || false);
    this.$('input').customInput();
    this.model.trigger('form:resize');
    return this;
  },

  /**
   * @Override
   */
  readMode: function () {
    this.editMode();
    this.$(':checkbox').prop('disabled', true);
    return this;
  },

  /**
   * @Override
   */
  val: function () {
    return this.$(':checkbox').prop('checked');
  },

  /**
   * @Override
   */
  focus: function () {
    return this.$(':checkbox').focus();
  }
});

export { CheckBox as default };
