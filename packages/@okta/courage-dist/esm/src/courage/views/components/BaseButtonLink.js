import _Handlebars2 from '../../../../lib/handlebars/dist/cjs/handlebars.runtime.js';
import oktaUnderscore from '../../util/underscore-wrapper.js';
import ViewUtil from '../../util/ViewUtil.js';
import BaseView from '../BaseView.js';

const disabledEvents = {
  click: function (e) {
    e.preventDefault();
    e.stopPropagation();
  }
};
/**
 * A configurable button
 * @class module:Okta.internal.views.components.BaseButtonLink
 * @extends module:Okta.View
 * @example
 * var View = BaseButtonLink.extend({
 *   title: 'Click Me',
 *   icon: 'help-text'
 * })
 */

var BaseButtonLink = BaseView.extend(
/** @lends module:Okta.internal.views.components.BaseButtonLink.prototype */
{
  attributes: function () {
    const defaultAttrs = {
      'data-se': 'button'
    };

    const additionalAttr = this.__getAttribute('attrs');

    return oktaUnderscore.extend(defaultAttrs, additionalAttr);
  },

  /**
   * The main text for the button
   * @name title
   * @memberof module:Okta.internal.views.components.BaseButtonLink
   * @type {(String|Function)}
   * @instance
   */

  /**
   * The link for the button
   * @name href
   * @memberof module:Okta.internal.views.components.BaseButtonLink
   * @type {(String|Function)}
   * @instance
   */

  /**
   * CSS class for the icon to display. See [Style guide](http://rain.okta1.com:1802/su/dev/style-guide#icons)
   * @name icon
   * @memberof module:Okta.internal.views.components.BaseButtonLink
   * @type {(String|Function)}
   * @instance
   */

  /**
   * A [Backbone events](http://backbonejs.org/#View-delegateEvents) hash
   * @name events
   * @memberof module:Okta.internal.views.components.BaseButtonLink
   * @type {Object}
   * @instance
   */
  tagName: 'a',
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
            "column": 30
          },
          "end": {
            "line": 1,
            "column": 38
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
            "column": 67
          },
          "end": {
            "line": 1,
            "column": 76
          }
        }
      }) : helper));
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

      return ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "icon") : depth0, {
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
            "column": 54
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
            "column": 54
          },
          "end": {
            "line": 1,
            "column": 83
          }
        }
      })) != null ? stack1 : "");
    },
    "useData": true
  }),

  /**
   * Make this button visible, default to true.
   * @type {(Boolean|Function)}
   * @default true
   */
  visible: true,

  /**
   * Make this button enabled, default to true.
   * @type {(Boolean|Function)}
   * @default true
   */
  enabled: true,

  /**
   * The setting to determine when the button is enabled, default to {} and
   * enabled takes a higher priority.
   * @type {(Object|Function)}
   * @default {}
   */
  enableWhen: {},

  /**
   * The setting to determine when the button is visible, default to {} and
   * visible takes a higher priority.
   * @type {(Object|Function)}
   * @default {}
   */
  showWhen: {},
  constructor: function (options) {
    this.options = options || {};
    const data = this.getTemplateData();
    this.disabled = false;
    BaseView.apply(this, arguments);
    this.$el.addClass('link-button');

    if (data.icon) {
      this.$el.addClass('link-button-icon');

      if (!data.title) {
        this.$el.addClass('icon-only');
      }
    }
  },
  getTemplateData: function () {
    return {
      href: this.__getAttribute('href'),
      title: this.__getAttribute('title'),
      icon: this.__getAttribute('icon')
    };
  },
  initialize: function () {
    ViewUtil.applyDoWhen(this, oktaUnderscore.resultCtx(this, 'enableWhen', this), this.toggle);
    ViewUtil.applyDoWhen(this, oktaUnderscore.resultCtx(this, 'showWhen', this), this.toggleVisible);
  },
  render: function () {
    BaseView.prototype.render.apply(this, arguments);

    if (!oktaUnderscore.result(this, 'enabled')) {
      this.toggle(false);
    }

    if (!oktaUnderscore.result(this, 'visible')) {
      this.toggleVisible(false);
    }

    const data = this.getTemplateData();
    this.$el.attr('href', data.href || '#');
    return this;
  },
  __getAttribute: function (name, defaultValue) {
    let value = oktaUnderscore.resultCtx(this.options, name, this);

    if (oktaUnderscore.isUndefined(value)) {
      value = oktaUnderscore.result(this, name);
    }

    return !oktaUnderscore.isUndefined(value) ? value : defaultValue;
  },
  enable: function () {
    this.toggle(true);
  },
  disable: function () {
    this.toggle(false);
  },
  show: function () {
    this.toggleVisible(true);
  },
  hide: function () {
    this.toggleVisible(false);
  },
  toggle: function (enable) {
    const bool = !!enable && oktaUnderscore.result(this, 'enabled'); //this is to toggle the enability


    this.disabled = !bool;
    this.$el.toggleClass('link-button-disabled btn-disabled disabled', this.disabled);
    this.delegateEvents(this.disabled ? disabledEvents : null);
  },
  toggleVisible: function (visible) {
    const hidden = !visible || !oktaUnderscore.result(this, 'visible');
    this.$el.toggleClass('hide', hidden);
  }
});

export { BaseButtonLink as default };
