import _Handlebars2 from '../../../../lib/handlebars/dist/cjs/handlebars.runtime.js';
import oktaJQueryStatic from '../../util/jquery-wrapper.js';
import oktaUnderscore from '../../util/underscore-wrapper.js';
import BaseView from '../BaseView.js';

const optionsTemplate = _Handlebars2.template({
  "1": function (container, depth0, helpers, partials, data) {
    var helper,
        lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return "<span class=\"icon " + container.escapeExpression((helper = (helper = lookupProperty(helpers, "icon") || (depth0 != null ? lookupProperty(depth0, "icon") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
      "name": "icon",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 96
        },
        "end": {
          "line": 1,
          "column": 104
        }
      }
    }) : helper)) + "\"></span>";
  },
  "3": function (container, depth0, helpers, partials, data) {
    var helper,
        lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return container.escapeExpression((helper = (helper = lookupProperty(helpers, "title") || (depth0 != null ? lookupProperty(depth0, "title") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
      "name": "title",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 133
        },
        "end": {
          "line": 1,
          "column": 142
        }
      }
    }) : helper));
  },
  "5": function (container, depth0, helpers, partials, data) {
    var helper,
        lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return "<p class=\"option-subtitle\">" + container.escapeExpression((helper = (helper = lookupProperty(helpers, "subtitle") || (depth0 != null ? lookupProperty(depth0, "subtitle") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
      "name": "subtitle",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 192
        },
        "end": {
          "line": 1,
          "column": 204
        }
      }
    }) : helper)) + "</p>";
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

    return "<a href=\"\" class=\"icon-16 " + alias4((helper = (helper = lookupProperty(helpers, "className") || (depth0 != null ? lookupProperty(depth0, "className") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
      "name": "className",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 26
        },
        "end": {
          "line": 1,
          "column": 39
        }
      }
    }) : helper)) + "\" data-se=\"" + alias4((helper = (helper = lookupProperty(helpers, "seleniumId") || (depth0 != null ? lookupProperty(depth0, "seleniumId") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
      "name": "seleniumId",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 50
        },
        "end": {
          "line": 1,
          "column": 64
        }
      }
    }) : helper)) + "\">" + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "icon") : depth0, {
      "name": "if",
      "hash": {},
      "fn": container.program(1, data, 0),
      "inverse": container.noop,
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 66
        },
        "end": {
          "line": 1,
          "column": 120
        }
      }
    })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "title") : depth0, {
      "name": "if",
      "hash": {},
      "fn": container.program(3, data, 0),
      "inverse": container.noop,
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 120
        },
        "end": {
          "line": 1,
          "column": 149
        }
      }
    })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "subtitle") : depth0, {
      "name": "if",
      "hash": {},
      "fn": container.program(5, data, 0),
      "inverse": container.noop,
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 149
        },
        "end": {
          "line": 1,
          "column": 215
        }
      }
    })) != null ? stack1 : "") + "</a>";
  },
  "useData": true
});

const BaseDropDownDropDownOption = BaseView.extend({
  tagName: 'li',
  events: {
    click: function (e) {
      e.preventDefault();
      this.action && this.action.call(this);
    }
  },
  constructor: function () {
    BaseView.apply(this, arguments);
    this.$el.addClass('okta-dropdown-option option');
  },
  render: function () {
    this.$el.html(optionsTemplate({
      icon: oktaUnderscore.result(this, 'icon'),
      className: oktaUnderscore.result(this, 'className') || '',
      title: oktaUnderscore.result(this, 'title'),
      subtitle: oktaUnderscore.result(this, 'subtitle'),
      seleniumId: oktaUnderscore.result(this, 'seleniumId')
    }));

    if (oktaUnderscore.result(this, 'disabled')) {
      this.disable();
    }

    return this;
  },
  disable: function () {
    this.$el.addClass('option-disabled');
    this.$el.find('a').attr('tabindex', '-1');
  }
});
var BaseDropDown = BaseView.extend({
  events: {
    'click a.option-selected': function (e) {
      e.preventDefault();

      if (oktaUnderscore.result(this, 'disabled')) {
        e.stopPropagation();
      }
    },
    'click .dropdown-disabled': function (e) {
      e.preventDefault();
      e.stopPropagation();
    }
  },
  items: [],
  constructor: function () {
    const className = this.className; // In this very specific case we want to NOT append className to $el
    // but to the <a> tag in the template
    // so we want to disable backbone default functionality.

    this.className = null;
    BaseView.apply(this, arguments);
    this.className = className;
    this.$el.addClass('dropdown more-actions float-l');

    oktaUnderscore.each(oktaUnderscore.result(this, 'items'), function (option) {
      this.addOption(option, this.options);
    }, this);
  },
  template: _Handlebars2.template({
    "1": function (container, depth0, helpers, partials, data) {
      var helper,
          lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return "<span class=\"icon " + container.escapeExpression((helper = (helper = lookupProperty(helpers, "icon") || (depth0 != null ? lookupProperty(depth0, "icon") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
        "name": "icon",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 176
          },
          "end": {
            "line": 1,
            "column": 184
          }
        }
      }) : helper)) + "\"></span>";
    },
    "3": function (container, depth0, helpers, partials, data) {
      var helper,
          lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return "<span class=\"off-screen\">" + container.escapeExpression((helper = (helper = lookupProperty(helpers, "screenReaderText") || (depth0 != null ? lookupProperty(depth0, "screenReaderText") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
        "name": "screenReaderText",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 249
          },
          "end": {
            "line": 1,
            "column": 269
          }
        }
      }) : helper)) + "</span>";
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

      return "<a href=\"#\" class=\"link-button " + alias4((helper = (helper = lookupProperty(helpers, "className") || (depth0 != null ? lookupProperty(depth0, "className") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
        "name": "className",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 31
          },
          "end": {
            "line": 1,
            "column": 44
          }
        }
      }) : helper)) + " link-button-icon option-selected center\" aria-expanded=\"false\" aria-controls=\"okta-dropdown-options\">" + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "icon") : depth0, {
        "name": "if",
        "hash": {},
        "fn": container.program(1, data, 0),
        "inverse": container.noop,
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 146
          },
          "end": {
            "line": 1,
            "column": 200
          }
        }
      })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "screenReaderText") : depth0, {
        "name": "if",
        "hash": {},
        "fn": container.program(3, data, 0),
        "inverse": container.noop,
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 200
          },
          "end": {
            "line": 1,
            "column": 283
          }
        }
      })) != null ? stack1 : "") + "<span class=\"option-selected-text\">" + alias4((helper = (helper = lookupProperty(helpers, "title") || (depth0 != null ? lookupProperty(depth0, "title") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
        "name": "title",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 318
          },
          "end": {
            "line": 1,
            "column": 327
          }
        }
      }) : helper)) + "</span><span class=\"icon-dm\"></span></a><div id=\"okta-dropdown-options\" class=\"options clearfix\" style=\"display: none;\"><ul class=\"okta-dropdown-list options-wrap clearfix\"></ul></div>";
    },
    "useData": true
  }),
  getTemplateData: function () {
    const className = [oktaUnderscore.result(this, 'className') || '', oktaUnderscore.result(this, 'disabled') ? 'dropdown-disabled' : ''];
    return {
      icon: oktaUnderscore.result(this, 'icon'),
      className: oktaJQueryStatic.trim(className.join(' ')),
      title: oktaUnderscore.result(this, 'title'),
      screenReaderText: oktaUnderscore.result(this, 'screenReaderText')
    };
  },
  addOption: function (proto, options) {
    this.add(BaseDropDownDropDownOption.extend(proto), 'ul.options-wrap', {
      options: options || {}
    });
  }
});

export { BaseDropDown as default };
