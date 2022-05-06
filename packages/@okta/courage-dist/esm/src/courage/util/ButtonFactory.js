import oktaUnderscore from './underscore-wrapper.js';
import BaseButtonLink from '../views/components/BaseButtonLink.js';

/* eslint '@okta/okta-ui/no-deprecated-methods': [0, [{ name: 'BaseButtonLink.extend', use: 'Okta.createButton'}, ]] */
/**
 * A factory method wrapper for {@link BaseButtonLink} creation
 * @class module:Okta.internal.util.ButtonFactory
 */

function normalizeEvents(options) {
  const events = oktaUnderscore.extend(options.click ? {
    click: options.click
  } : {}, options.events || {});

  const target = {};

  oktaUnderscore.each(events, function (fn, eventName) {
    target[eventName] = function (e) {
      if (!options.href) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (!(this.disabled && eventName === 'click')) {
        fn.apply(this, arguments);
      }
    };
  });

  return target;
}

var ButtonFactory = /** @lends module:Okta.internal.util.ButtonFactory */
{
  /**
   * Creates a {@link module:Okta.internal.views.components.BaseButtonLink|BaseButtonLink}.
   * @param  {Object} options Options hash
   * @param  {String} [options.title] The button text
   * @param  {String} [options.icon]
   * CSS class for the icon to display. See [Style guide](http://rain.okta1.com:1802/su/dev/style-guide#icons)
   * @param {String} [options.href] The button link
   * @param {Function} [options.click] On click callback
   * @param {Object} [options.events] a [Backbone events](http://backbonejs.org/#View-delegateEvents) hash
   * @returns {module:Okta.internal.views.components.BaseButtonLink} BaseButtonLink prototype ("class")
   */
  create: function (options) {
    options = oktaUnderscore.clone(options);
    options.attrs = options.attributes;
    delete options.attributes;
    return BaseButtonLink.extend(oktaUnderscore.extend(options, {
      events: normalizeEvents(options)
    }));
  }
};

export { ButtonFactory as default };
