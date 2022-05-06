import _Handlebars2 from '../../../../../lib/handlebars/dist/cjs/handlebars.runtime.js';
import oktaJQueryStatic from '../../../util/jquery-wrapper.js';
import 'qtip';
import Keys from '../../../util/Keys.js';
import '../../../vendor/plugins/jquery.placeholder.js';
import BaseInput from '../BaseInput.js';

const className = 'okta-form-input-field input-fix';

function hasTitleAndText(options) {
  const title = options.title;
  const text = options.text;
  return title && text && title !== text;
} // options may be a string or an object.


function createQtipContent(options) {
  if (hasTitleAndText(options)) {
    return options;
  }

  return {
    text: options.text || options
  };
}

var TextBox = BaseInput.extend({
  template: _Handlebars2.template({
    "1": function (container, depth0, helpers, partials, data) {
      return "<span class=\"input-tooltip icon form-help-16\"></span>";
    },
    "3": function (container, depth0, helpers, partials, data) {
      var stack1,
          lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return "<span class=\"icon input-icon " + container.escapeExpression(container.lambda((stack1 = depth0 != null ? lookupProperty(depth0, "params") : depth0) != null ? lookupProperty(stack1, "icon") : stack1, depth0)) + "\"></span>";
    },
    "5": function (container, depth0, helpers, partials, data) {
      var helper,
          lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return container.escapeExpression((helper = (helper = lookupProperty(helpers, "autoComplete") || (depth0 != null ? lookupProperty(depth0, "autoComplete") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
        "name": "autoComplete",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 333
          },
          "end": {
            "line": 1,
            "column": 349
          }
        }
      }) : helper));
    },
    "7": function (container, depth0, helpers, partials, data) {
      return "off";
    },
    "9": function (container, depth0, helpers, partials, data) {
      return "<span class=\"input-icon-divider\"></span>";
    },
    "compiler": [8, ">= 4.3.0"],
    "main": function (container, depth0, helpers, partials, data) {
      var stack1,
          helper,
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

      return ((stack1 = lookupProperty(helpers, "if").call(alias1, (stack1 = depth0 != null ? lookupProperty(depth0, "params") : depth0) != null ? lookupProperty(stack1, "innerTooltip") : stack1, {
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
            "column": 87
          }
        }
      })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, (stack1 = depth0 != null ? lookupProperty(depth0, "params") : depth0) != null ? lookupProperty(stack1, "icon") : stack1, {
        "name": "if",
        "hash": {},
        "fn": container.program(3, data, 0),
        "inverse": container.noop,
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 87
          },
          "end": {
            "line": 1,
            "column": 166
          }
        }
      })) != null ? stack1 : "") + "<input type=\"" + alias4((helper = (helper = lookupProperty(helpers, "type") || (depth0 != null ? lookupProperty(depth0, "type") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
        "name": "type",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 179
          },
          "end": {
            "line": 1,
            "column": 187
          }
        }
      }) : helper)) + "\" placeholder=\"" + alias4((helper = (helper = lookupProperty(helpers, "placeholder") || (depth0 != null ? lookupProperty(depth0, "placeholder") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
        "name": "placeholder",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 202
          },
          "end": {
            "line": 1,
            "column": 217
          }
        }
      }) : helper)) + "\" name=\"" + alias4((helper = (helper = lookupProperty(helpers, "name") || (depth0 != null ? lookupProperty(depth0, "name") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
        "name": "name",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 225
          },
          "end": {
            "line": 1,
            "column": 233
          }
        }
      }) : helper)) + "\" id=\"" + alias4((helper = (helper = lookupProperty(helpers, "inputId") || (depth0 != null ? lookupProperty(depth0, "inputId") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
        "name": "inputId",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 239
          },
          "end": {
            "line": 1,
            "column": 250
          }
        }
      }) : helper)) + "\" value=\"" + alias4((helper = (helper = lookupProperty(helpers, "value") || (depth0 != null ? lookupProperty(depth0, "value") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
        "name": "value",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 259
          },
          "end": {
            "line": 1,
            "column": 268
          }
        }
      }) : helper)) + "\" aria-label=\"" + alias4((helper = (helper = lookupProperty(helpers, "placeholder") || (depth0 != null ? lookupProperty(depth0, "placeholder") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
        "name": "placeholder",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 282
          },
          "end": {
            "line": 1,
            "column": 297
          }
        }
      }) : helper)) + "\" autocomplete=\"" + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "autoComplete") : depth0, {
        "name": "if",
        "hash": {},
        "fn": container.program(5, data, 0),
        "inverse": container.program(7, data, 0),
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 313
          },
          "end": {
            "line": 1,
            "column": 367
          }
        }
      })) != null ? stack1 : "") + "\" />" + ((stack1 = lookupProperty(helpers, "if").call(alias1, (stack1 = depth0 != null ? lookupProperty(depth0, "params") : depth0) != null ? lookupProperty(stack1, "iconDivider") : stack1, {
        "name": "if",
        "hash": {},
        "fn": container.program(9, data, 0),
        "inverse": container.noop,
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 371
          },
          "end": {
            "line": 1,
            "column": 444
          }
        }
      })) != null ? stack1 : "");
    },
    "useData": true
  }),

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
      } else if (Keys.isEsc(e)) {
        this.model.trigger('form:cancel');
      }
    }
  },
  constructor: function () {
    BaseInput.apply(this, arguments);
    this.$el.addClass('o-form-control');
  },

  /**
   * @Override
   */
  editMode: function () {
    this.$el.addClass(className);
    BaseInput.prototype.editMode.apply(this, arguments);
    this.$('input').placeholder();
  },

  /**
   * @Override
   */
  readMode: function () {
    BaseInput.prototype.readMode.apply(this, arguments);

    if (this.options.type === 'password') {
      this.$el.text('********');
    }

    this.$el.removeClass(className);
  },

  /**
   * @Override
   */
  val: function () {
    let inputValue = this.$('input[type="' + this.options.type + '"]').val(); //IE will only read clear text pw if type="password" is explicitly in selector

    if (this.options.type !== 'password') {
      inputValue = oktaJQueryStatic.trim(inputValue);
    }

    return inputValue;
  },

  /**
   * @Override
   */
  focus: function () {
    return this.$('input').focus();
  },
  postRender: function () {
    const {
      params: params
    } = this.options;

    if (params && params.innerTooltip) {
      const content = createQtipContent(params.innerTooltip);
      this.$('.input-tooltip').qtip({
        content: content,
        style: {
          classes: 'okta-tooltip qtip-custom qtip-shadow'
        },
        position: {
          my: 'bottom left',
          // Note: qTip2 has a known issue calculating the tooltip offset when:
          // 1. A container element has both:
          //    a) position: relative/absolute
          //    b) overlay: value other than 'visible'
          // 2. The page is scrolled
          //
          // We set position:relative and overlay:auto on the body element,
          // where both are required for:
          // - Positioning the footer correctly
          // - Displaying long pages in embedded browsers
          //
          // The original design called for a fixed position relative to the
          // tooltip icon - this has been switched to "relative to mouse, and
          // update position when mouse moves" because of this constraint.
          target: 'mouse',
          adjust: {
            method: 'flip',
            mouse: true,
            y: -5,
            x: 5
          },
          viewport: oktaJQueryStatic('body')
        }
      });
    }
  }
});

export { TextBox as default };
