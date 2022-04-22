import Backbone from '../vendor/lib/backbone.js';
import oktaUnderscore from '../util/underscore-wrapper.js';
import FrameworkView from '../framework/View.js';
import TemplateUtil from '../util/TemplateUtil.js';

const eventBus = oktaUnderscore.clone(Backbone.Events); // add `broadcast` and `listen` functionality to all views
// We use one event emitter per all views
// This means we need to be very careful with event names


const proto = {
  constructor: function (options, ...rest) {
    FrameworkView.call(this, options, ...rest);
    this.module && this.$el.attr('data-view', this.module.id);
  },

  /**
   * @deprecated Use {@link #removeChildren}
   */
  empty: function () {
    return this.removeChildren();
  },
  compileTemplate: TemplateUtil.tpl,

  /**
   *
   * Broadcasts a global event that all views and controllers can subscribe to
   * for framework use only - prefer using a shared model
   *
   * @param {String} eventName A unique identifier for the event
   * @param {...String} param Parameter to pass with the event (can pass more than one parameter)
   * @deprecated For internal use only
   * @private
   */
  broadcast: function () {
    eventBus.trigger.apply(eventBus, arguments);
    return this;
  },

  /**
   * Subscribe to broadcast events
   * for framework use only - prefer using a shared model
   *
   * @param {String} eventName The event identifier to subscribe
   * @param {Function} fn The callback function to invoke
   * @deprecated For internal use only
   * @private
   */
  listen: function (name, fn) {
    eventBus.off(name, fn);
    this.listenTo(eventBus, name, fn);
    return this;
  },

  /**
   * Shows a notification box
   * @param {String} level success / warning / error
   * @param {String} message The message to display
   * @param {Object} [options]
   * @param {Number} [options.width] Set a custom width
   * @param {String} [options.title] Set a custom title
   * @param {Boolean} [options.hide=true] Do we want to auto-hide this notification?
   * @param {Boolean} [options.dismissable] Show a dismiss button
   * @example
   * view.notify('success', 'Group created successfully');
   */
  notify: function (level, message, options) {
    this.broadcast('notification', oktaUnderscore.defaults({
      message: message,
      level: level
    }, options));
    return this;
  },

  /**
   * Shows a confirmation dialog
   *
   * Uses https://www.ericmmartin.com/projects/simplemodal/.
   * If you want to configure the simplemodal options use ConfirmationDialog instead.
   *
   * The main difference between this and the native javascript `confirm` method
   * Is this method is non blocking (note the callback pattern).
   *
   * The callback function will run in the context (`this`) of the invoking view.
   *
   * @param {String} [title] The title of the confirmation dialog
   * @param {String} [message] The message of the confirmation dialog
   * @param {Function} [okfn] The callback to run when the user hits "OK" (runs in the context of the invoking view)
   * @param {Function} [cancelfn] The callback to run when the user hits "Cancel"
   *        (runs in the context of the invoking view)
   * @example
   * view.confirm('Delete Group', 'Are you sure you want to delete the selected group?', function () {
   *   model.destroy();
   * });
   *
   * // title will be auto-set to "Okta"
   * view.confirm('Are you sure you want to delete the selected group?', function () {
   *   model.destroy();
   * });
   *
   * view.confirm({
   *   title: 'Delete Group', //=> Modal title
   *   subtitle: 'Are you sure you want to delete the selected group?', //=> Modal subtitle
   *   content: '<h3 color="red">THIS WILL DELETE THE GROUP!</h3>', //=> A template or a view to add to the modal
   *   save: 'Delete Group', //=> Button label
   *   ok: _.bind(model.save, model) // Callback function on hitting "ok" button
   *   cancel: 'Cancel', //=> Button label
   *   cancelFn: _.bind(model.destroy, model) // Callback function on hitting "cancel" button
   * });
   */
  confirm: function (title, message, okfn, cancelfn) {
    let options;
    /* eslint max-statements: [2, 12] */

    if (typeof title === 'object') {
      options = title;
    } else {
      // eslint-disable-next-line no-lonely-if
      if (arguments.length === 2 && oktaUnderscore.isFunction(message)) {
        options = {
          title: 'Okta',
          // eslint-disable-line @okta/okta/no-unlocalized-text
          subtitle: title,
          ok: message
        };
      } else {
        options = {
          title: title,
          subtitle: message,
          ok: okfn,
          cancelFn: cancelfn
        };
      }
    }

    if (oktaUnderscore.isFunction(options.ok)) {
      options.ok = oktaUnderscore.bind(options.ok, this);
    }

    if (oktaUnderscore.isFunction(options.cancelFn)) {
      options.cancelFn = oktaUnderscore.bind(options.cancelFn, this);
    }

    this.broadcast('confirmation', options);
    return this;
  },

  /**
   * Shows an alert box
   *
   * The main difference between this and the native javascript `alert` method
   * Is this method is non blocking.
   *
   * @param {String} message The message
   * @example
   * view.alert('Mission complete');
   */
  alert: function (params) {
    if (oktaUnderscore.isString(params)) {
      params = {
        subtitle: params
      };
    }

    this.confirm(oktaUnderscore.extend({}, params, {
      noCancelButton: true
    }));
    return this;
  }
};
/**
 * See {@link src/framework/View} for more detail and examples from the base class.
 * @class module:Okta.View
 * @extends src/framework/View
 */

/** @lends module:Okta.View.prototype */

var BaseView = FrameworkView.extend(proto,
/** @lends View.prototype */
{
  /** @method */
  decorate: function (TargetView) {
    const BaseViewView = TargetView.extend({});

    oktaUnderscore.defaults(BaseViewView.prototype, proto);

    return BaseViewView;
  }
});

export { BaseView as default };
