import _Handlebars2 from '../../../../../lib/handlebars/dist/cjs/handlebars.runtime.js';
import oktaUnderscore from '../../../util/underscore-wrapper.js';
import 'qtip';
import BaseView from '../../BaseView.js';

/**
 * @class InputLabel
 * @extends {Okta.View}
 * @private
 * The input's label.
 */
var InputLabel = BaseView.extend({
  className: 'okta-form-label o-form-label',
  attributes: {
    'data-se': 'o-form-label'
  },

  /**
   * @constructor
   * @param  {Object} options options hash
   * @param  {String} [options.type] Input type
   * @param  {String|Function} [options.label] Label text
   * @param  {String|Function} [options.sublabel] Sub label text
   * @param  {String|Function} [options.tooltip] Tooltip text
   * @param  {String|Function} [options.inputId] Id of the inputs
   * @param  {String|Function} [options.id] Id of the inputs
   */
  constructor: function (options) {
    /* eslint max-statements: [2, 16] complexity: [2, 7]*/
    oktaUnderscore.defaults(options, {
      inputId: options.id
    });

    delete options.id;
    BaseView.apply(this, arguments);
  },
  // standardLabel: space added in the end of the label to avoid selecting label text with double click in read mode
  template: _Handlebars2.template({
    "1": function (container, depth0, helpers, partials, data) {
      return "<legend>";
    },
    "3": function (container, depth0, helpers, partials, data) {
      var helper,
          lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return "<label for=\"" + container.escapeExpression((helper = (helper = lookupProperty(helpers, "inputId") || (depth0 != null ? lookupProperty(depth0, "inputId") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
        "name": "inputId",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 61
          },
          "end": {
            "line": 1,
            "column": 72
          }
        }
      }) : helper)) + "\"></label>";
    },
    "5": function (container, depth0, helpers, partials, data) {
      var helper,
          lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return container.escapeExpression((helper = (helper = lookupProperty(helpers, "label") || (depth0 != null ? lookupProperty(depth0, "label") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
        "name": "label",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 116
          },
          "end": {
            "line": 1,
            "column": 125
          }
        }
      }) : helper));
    },
    "7": function (container, depth0, helpers, partials, data) {
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

      return "<label for=\"" + alias4((helper = (helper = lookupProperty(helpers, "inputId") || (depth0 != null ? lookupProperty(depth0, "inputId") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
        "name": "inputId",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 167
          },
          "end": {
            "line": 1,
            "column": 178
          }
        }
      }) : helper)) + "\">" + alias4((helper = (helper = lookupProperty(helpers, "label") || (depth0 != null ? lookupProperty(depth0, "label") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
        "name": "label",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 180
          },
          "end": {
            "line": 1,
            "column": 189
          }
        }
      }) : helper)) + "&nbsp;</label>";
    },
    "9": function (container, depth0, helpers, partials, data) {
      var helper,
          lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return "<span class=\"o-form-explain\">" + container.escapeExpression((helper = (helper = lookupProperty(helpers, "sublabel") || (depth0 != null ? lookupProperty(depth0, "sublabel") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
        "name": "sublabel",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 256
          },
          "end": {
            "line": 1,
            "column": 268
          }
        }
      }) : helper)) + "</span>";
    },
    "11": function (container, depth0, helpers, partials, data) {
      var stack1,
          lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return "<span class=\"o-form-tooltip icon-16 icon-only form-help-16\" title=\"" + container.escapeExpression(container.lambda((stack1 = depth0 != null ? lookupProperty(depth0, "tooltip") : depth0) != null ? lookupProperty(stack1, "text") : stack1, depth0)) + "\"></span>";
    },
    "13": function (container, depth0, helpers, partials, data) {
      return "</legend>";
    },
    "compiler": [8, ">= 4.3.0"],
    "main": function (container, depth0, helpers, partials, data) {
      var stack1,
          alias1 = depth0 != null ? depth0 : container.nullContext || {},
          lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "group") : depth0, {
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
            "column": 28
          }
        }
      })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "_isLabelView") : depth0, {
        "name": "if",
        "hash": {},
        "fn": container.program(3, data, 0),
        "inverse": container.noop,
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 28
          },
          "end": {
            "line": 1,
            "column": 89
          }
        }
      })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "_isRadioOrCheckbox") : depth0, {
        "name": "if",
        "hash": {},
        "fn": container.program(5, data, 0),
        "inverse": container.noop,
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 89
          },
          "end": {
            "line": 1,
            "column": 132
          }
        }
      })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "_standardLabel") : depth0, {
        "name": "if",
        "hash": {},
        "fn": container.program(7, data, 0),
        "inverse": container.noop,
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 132
          },
          "end": {
            "line": 1,
            "column": 210
          }
        }
      })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "sublabel") : depth0, {
        "name": "if",
        "hash": {},
        "fn": container.program(9, data, 0),
        "inverse": container.noop,
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 210
          },
          "end": {
            "line": 1,
            "column": 282
          }
        }
      })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "tooltip") : depth0, {
        "name": "if",
        "hash": {},
        "fn": container.program(11, data, 0),
        "inverse": container.noop,
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 282
          },
          "end": {
            "line": 1,
            "column": 397
          }
        }
      })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "group") : depth0, {
        "name": "if",
        "hash": {},
        "fn": container.program(13, data, 0),
        "inverse": container.noop,
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 397
          },
          "end": {
            "line": 1,
            "column": 426
          }
        }
      })) != null ? stack1 : "");
    },
    "useData": true
  }),
  getTemplateData: function () {
    const options = {
      label: ''
    };

    oktaUnderscore.each(['inputId', 'label', 'sublabel', 'tooltip', 'group'], function (option) {
      options[option] = oktaUnderscore.resultCtx(this.options, option, this);
    }, this);

    if (this._isLabelView(options.label)) {
      options._isLabelView = true;
    } else if (oktaUnderscore.contains(['radio', 'checkbox'], this.options.type) || !options.label) {
      options._isRadioOrCheckbox = true;
    } else {
      options._standardLabel = true;
    }

    if (options.tooltip) {
      if (oktaUnderscore.isString(options.tooltip)) {
        options.tooltip = {
          text: options.tooltip
        };
      }
    }

    return options;
  },
  _isLabelView: function (label) {
    return !oktaUnderscore.isUndefined(label) && label instanceof BaseView;
  },
  postRender: function () {
    const options = this.getTemplateData();

    if (this._isLabelView(options.label)) {
      this.removeChildren();
      this.add(options.label, 'label');
    }

    if (options.tooltip) {
      this.$('.o-form-tooltip').qtip(oktaUnderscore.extend({
        style: {
          classes: 'qtip-custom qtip-shadow'
        },
        position: {
          my: window.okta && window.okta.theme === 'dstheme' ? 'bottom center' : 'bottom left',
          at: 'top center'
        },
        hide: {
          fixed: true
        },
        show: {
          delay: 0
        }
      }, options.tooltip.options));
    }
  }
});

export { InputLabel as default };
