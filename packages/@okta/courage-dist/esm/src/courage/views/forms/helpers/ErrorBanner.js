import _Handlebars2 from '../../../../../lib/handlebars/dist/cjs/handlebars.runtime.js';
import BaseView from '../../BaseView.js';

var ErrorBanner = BaseView.extend({
  template: _Handlebars2.template({
    "1": function (container, depth0, helpers, partials, data) {
      var helper,
          lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return "<p>" + container.escapeExpression((helper = (helper = lookupProperty(helpers, "errorSummary") || (depth0 != null ? lookupProperty(depth0, "errorSummary") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
        "name": "errorSummary",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 130
          },
          "end": {
            "line": 1,
            "column": 146
          }
        }
      }) : helper)) + "</p>";
    },
    "3": function (container, depth0, helpers, partials, data) {
      var lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return "<p>" + container.escapeExpression((lookupProperty(helpers, "i18n") || depth0 && lookupProperty(depth0, "i18n") || container.hooks.helperMissing).call(depth0 != null ? depth0 : container.nullContext || {}, {
        "name": "i18n",
        "hash": {
          "bundle": "courage",
          "code": "oform.errorbanner.title"
        },
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 161
          },
          "end": {
            "line": 1,
            "column": 217
          }
        }
      })) + "</p>";
    },
    "compiler": [8, ">= 4.3.0"],
    "main": function (container, depth0, helpers, partials, data) {
      var stack1,
          lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return "<div class=\"okta-form-infobox-error infobox infobox-error\" role=\"alert\"><span class=\"icon error-16\"></span>" + ((stack1 = lookupProperty(helpers, "if").call(depth0 != null ? depth0 : container.nullContext || {}, depth0 != null ? lookupProperty(depth0, "errorSummary") : depth0, {
        "name": "if",
        "hash": {},
        "fn": container.program(1, data, 0),
        "inverse": container.program(3, data, 0),
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 107
          },
          "end": {
            "line": 1,
            "column": 228
          }
        }
      })) != null ? stack1 : "") + "</div>";
    },
    "useData": true
  }),
  modelEvents: {
    'form:clear-errors': 'remove'
  }
});

export { ErrorBanner as default };
