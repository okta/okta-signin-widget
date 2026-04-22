import _Handlebars2 from '../../../../lib/handlebars/dist/cjs/handlebars.runtime.js';
import oktaUnderscore from '../../util/underscore-wrapper.js';
import Time from '../../util/Time.js';
import BaseView from '../BaseView.js';

function getOption(callout, option) {
  return oktaUnderscore.resultCtx(callout.options, option, callout) || oktaUnderscore.result(callout, option);
}

function getTopClass(callout) {
  let klass = 'infobox clearfix infobox-' + getOption(callout, 'type');

  switch (getOption(callout, 'size')) {
    case 'standard':
      klass += '';
      break;

    case 'slim':
      klass += ' infobox-slim';
      break;

    case 'compact':
      klass += ' infobox-compact';
      break;

    case 'large':
      klass += ' infobox-md';
      break;
  }

  if (getOption(callout, 'dismissible')) {
    klass += ' infobox-dismiss';
  }

  return klass;
}

const events = {
  'click .infobox-dismiss-link': function (e) {
    e.preventDefault();
    this.$el.fadeOut(Time.UNLOADING_FADE, () => {
      this.trigger('dismissed');
      this.remove();
    });
  }
};

const template = _Handlebars2.template({
  "1": function (container, depth0, helpers, partials, data) {
    var lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return "<a data-se=\"dismiss-link\" class=\"infobox-dismiss-link\" title=\"" + container.escapeExpression((lookupProperty(helpers, "i18n") || depth0 && lookupProperty(depth0, "i18n") || container.hooks.helperMissing).call(depth0 != null ? depth0 : container.nullContext || {}, {
      "name": "i18n",
      "hash": {
        "bundle": "courage",
        "code": "component.dismiss"
      },
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 81
        },
        "end": {
          "line": 1,
          "column": 131
        }
      }
    })) + "\" href=\"#\"><span data-se=\"icon\" class=\"dismiss-icon\"></span></a>";
  },
  "3": function (container, depth0, helpers, partials, data) {
    var helper,
        lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return "<h3 data-se=\"header\">" + container.escapeExpression((helper = (helper = lookupProperty(helpers, "title") || (depth0 != null ? lookupProperty(depth0, "title") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
      "name": "title",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 286
        },
        "end": {
          "line": 1,
          "column": 295
        }
      }
    }) : helper)) + "</h3>";
  },
  "5": function (container, depth0, helpers, partials, data) {
    var helper,
        lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return "<p data-se=\"sub-header\">" + container.escapeExpression((helper = (helper = lookupProperty(helpers, "subtitle") || (depth0 != null ? lookupProperty(depth0, "subtitle") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
      "name": "subtitle",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 347
        },
        "end": {
          "line": 1,
          "column": 359
        }
      }
    }) : helper)) + "</p>";
  },
  "7": function (container, depth0, helpers, partials, data) {
    var stack1,
        lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return "<ul data-se=\"list\" class=\"bullets\">" + ((stack1 = lookupProperty(helpers, "each").call(depth0 != null ? depth0 : container.nullContext || {}, depth0 != null ? lookupProperty(depth0, "bullets") : depth0, {
      "name": "each",
      "hash": {},
      "fn": container.program(8, data, 0),
      "inverse": container.noop,
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 420
        },
        "end": {
          "line": 1,
          "column": 483
        }
      }
    })) != null ? stack1 : "") + "</ul>";
  },
  "8": function (container, depth0, helpers, partials, data) {
    return "<li data-se=\"list-item\">" + container.escapeExpression(container.lambda(depth0, depth0)) + "</li>";
  },
  "compiler": [8, ">= 4.3.0"],
  "main": function (container, depth0, helpers, partials, data) {
    var stack1,
        helper,
        alias1 = depth0 != null ? depth0 : container.nullContext || {},
        lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "dismissible") : depth0, {
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
          "column": 202
        }
      }
    })) != null ? stack1 : "") + "<span data-se=\"icon\" class=\"icon " + container.escapeExpression((helper = (helper = lookupProperty(helpers, "icon") || (depth0 != null ? lookupProperty(depth0, "icon") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(alias1, {
      "name": "icon",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 235
        },
        "end": {
          "line": 1,
          "column": 243
        }
      }
    }) : helper)) + "\"></span>" + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "title") : depth0, {
      "name": "if",
      "hash": {},
      "fn": container.program(3, data, 0),
      "inverse": container.noop,
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 252
        },
        "end": {
          "line": 1,
          "column": 307
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
          "column": 307
        },
        "end": {
          "line": 1,
          "column": 370
        }
      }
    })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "bullets") : depth0, {
      "name": "if",
      "hash": {},
      "fn": container.program(7, data, 0),
      "inverse": container.noop,
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 370
        },
        "end": {
          "line": 1,
          "column": 495
        }
      }
    })) != null ? stack1 : "");
  },
  "useData": true
});

const CalloutCallout = BaseView.extend(
/** @lends src/views/components/Callout.prototype */
{
  attributes: {
    'data-se': 'callout'
  },

  /**
   * Custom HTML or view to inject to the callout
   * @type {String|Okta.View}
   */
  content: null,

  /**
   * Size of icon. options are standard, large, compact
   * @type {String}
   */
  size: 'standard',

  /**
   * Type of the callout. Valid values are: info, success, warning, error, tip
   * @type {String}
   */
  type: 'info',

  /**
   * Can the callout be dismissed
   * @type {Boolean}
   */
  dismissible: false,

  /**
   * Callout title
   * @type {String}
   */
  title: null,

  /**
   * Callout subtitle
   * @type {String}
   */
  subtitle: null,

  /**
   * Array of strings to render as bullet points
   * @type {Array}
   */
  bullets: null,

  /**
   * Fired after the callout is dismised - applies when
   * {@link module:Okta.internal.views.components.Callout|dismissible} is set to true
   * @event src/views/components/Callout#dismissed
   */
  constructor: function () {
    this.events = oktaUnderscore.defaults(this.events || {}, events);
    BaseView.apply(this, arguments);
    this.$el.addClass(getTopClass(this));
    this.template = template;
    const content = getOption(this, 'content');

    if (content) {
      this.add(content);
    }
  },
  getTemplateData: function () {
    let icon = getOption(this, 'type');
    const size = getOption(this, 'size');

    if (icon === 'tip') {
      // css is inconsistent
      icon = 'light-bulb';
    }

    switch (size) {
      case 'slim':
        icon = '';
        break;

      case 'large':
        icon = [icon, '-', '24'].join('');
        break;

      default:
        icon = [icon, '-', '16'].join('');
    }

    return {
      icon: icon,
      title: getOption(this, 'title'),
      subtitle: getOption(this, 'subtitle'),
      bullets: getOption(this, 'bullets'),
      dismissible: getOption(this, 'dismissible')
    };
  }
});
/**
 * @class src/views/components/Callout
 * @extends module:Okta.View
 */

/**
 * @class module:Okta.internal.views.components.Callout
 */

var Callout = /** @lends module:Okta.internal.views.components.Callout */
{
  /**
   * Creates a {@link src/views/components/Callout|Callout}.
   * @static
   * @param {Object} options
   * @param {String|Function} [options.size] Size of icon. options are standard, large, compact, slim
   * @param {String|Okta.View} [options.content] Custom HTML or view to inject to the callout
   * @param {String|Function} [options.title] Callout title
   * @param {String|Function} [options.subtitle] Callout subtitle
   * @param {Array|Function} [options.bullets] Array of strings to render as bullet points
   * @param {Boolean|Function} [options.dismissible] Can the callout be dismissed
   * @param {String|Function} [options.type] Callout type. Valid values are: info, success, warning, error, tip
   *
   * @return {src/views/components/Callout}
   */
  create: function (options) {
    return new CalloutCallout(options);
  }
};

export { Callout as default };
