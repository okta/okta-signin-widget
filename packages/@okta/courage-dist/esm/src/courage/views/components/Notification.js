import _Handlebars2 from '../../../../lib/handlebars/dist/cjs/handlebars.runtime.js';
import oktaUnderscore from '../../util/underscore-wrapper.js';
import BaseView from '../BaseView.js';

const defaults = {
  level: 'success',
  message: 'Great Success!',
  hide: true,
  fade: 400,
  delay: 3000,
  width: 0,
  dismissable: false
};
var Notification = BaseView.extend({
  className: 'infobox infobox-confirm infobox-confirm-fixed',
  events: {
    'click .infobox-dismiss-link': function (e) {
      e.preventDefault();
      this.fadeOut();
    }
  },
  template: _Handlebars2.template({
    "1": function (container, depth0, helpers, partials, data) {
      var lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return "<a class=\"infobox-dismiss-link\" title=\"" + container.escapeExpression((lookupProperty(helpers, "i18n") || depth0 && lookupProperty(depth0, "i18n") || container.hooks.helperMissing).call(depth0 != null ? depth0 : container.nullContext || {}, {
        "name": "i18n",
        "hash": {
          "bundle": "courage",
          "code": "component.dismiss"
        },
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 58
          },
          "end": {
            "line": 1,
            "column": 108
          }
        }
      })) + "\" href=\"#\"><span class=\"dismiss-icon\"></span></a>";
    },
    "3": function (container, depth0, helpers, partials, data) {
      var helper,
          lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return "<h3>" + container.escapeExpression((helper = (helper = lookupProperty(helpers, "title") || (depth0 != null ? lookupProperty(depth0, "title") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
        "name": "title",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 220
          },
          "end": {
            "line": 1,
            "column": 229
          }
        }
      }) : helper)) + "</h3>";
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

      return ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "dismissable") : depth0, {
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
            "column": 164
          }
        }
      })) != null ? stack1 : "") + "<span class=\"icon " + alias4((helper = (helper = lookupProperty(helpers, "level") || (depth0 != null ? lookupProperty(depth0, "level") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
        "name": "level",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 182
          },
          "end": {
            "line": 1,
            "column": 191
          }
        }
      }) : helper)) + "-16\"></span>" + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "title") : depth0, {
        "name": "if",
        "hash": {},
        "fn": container.program(3, data, 0),
        "inverse": container.noop,
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 203
          },
          "end": {
            "line": 1,
            "column": 241
          }
        }
      })) != null ? stack1 : "") + "<p>" + alias4((helper = (helper = lookupProperty(helpers, "message") || (depth0 != null ? lookupProperty(depth0, "message") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
        "name": "message",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 244
          },
          "end": {
            "line": 1,
            "column": 255
          }
        }
      }) : helper)) + "</p>";
    },
    "useData": true
  }),
  initialize: function () {
    this.options = oktaUnderscore.defaults({}, this.options, defaults);
    this.$el.addClass('infobox-' + this.options.level);

    if (this.options.width) {
      this.$el.width(this.options.width);
    }
  },
  getTemplateData: function () {
    return oktaUnderscore.extend(oktaUnderscore.pick(this.options, 'level', 'message', 'title'), {
      dismissable: this.options.hide === false || this.options.dismissable === true
    });
  },
  postRender: function () {
    if (this.options.hide) {
      oktaUnderscore.delay(oktaUnderscore.bind(this.fadeOut, this), this.options.delay);
    }
  },
  fadeOut: function () {
    this.$el.fadeOut(this.options.fade, oktaUnderscore.bind(this.remove, this));
  }
});

export { Notification as default };
