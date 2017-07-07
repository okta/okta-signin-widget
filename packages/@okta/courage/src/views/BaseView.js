define([
  'okta/underscore',
  'backbone',
  'shared/util/TemplateUtil',
  'shared/framework/View'
], function (_, Backbone, TemplateUtil, View) {

  // add `broadcast` and `listen` functionality to all views
  // We use one event emitter per all views
  // This means we need to be very careful with event names

  var eventBus = _.clone(Backbone.Events);

  var proto = {

    /**
    * @class Okta.View
    * @extend Archer.View
    * @inheritdoc Archer.View
    */

    constructor: function () {
      View.apply(this, arguments);
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
      this.listenTo(eventBus, name, fn);
      return this;
    },

    /**
    * Shows a notification box
    *
    * Examples:
    *
    * ```javascript
    * view.notify('success', 'Group created successfully');
    * ```
    *
    * @param {String} level success / warning / error
    * @param {String} message The message to display
    * @param {Object} [options]
    * @param {Number} [options.width] Set a custom width
    * @param {String} [options.title] Set a custom title
    * @param {Boolean} [options.hide=true] Do we want to auto-hide this notification?
    * @param {Boolean} [options.dismissable] Show a dismiss button
    */
    notify: function (level, message, options) {
      this.broadcast('notification', _.defaults({message: message, level: level}, options));
      return this;
    },

    /**
    * Shows a confirmation dialog
    *
    * The main difference between this and the native javascript `confirm` method
    * Is this method is non blocking (note the callback pattern).
    *
    * The callback function will run in the context (`this`) of the invoking view.
    *
    * Examples:
    *
    * ```javascript
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
    *
    * ```
    *
    * @param {String} [title] The title of the confirmation dialog
    * @param {String} [message] The message of the confirmation dialog
    * @param {Function} [okfn] The callback to run when the user hits "OK" (runs in the context of the invoking view)
    * @param {Function} [cancelfn] The callback to run when the user hits "Cancel"
    *        (runs in the context of the invoking view)
    */
    confirm: function (title, message, okfn, cancelfn) {
      /* eslint max-statements: [2, 12] */

      var options;
      if (typeof title == 'object') {
        options = title;
      }
      else {
        if (arguments.length == 2 && _.isFunction(message)) {
          options = {
            title: 'Okta',
            subtitle: title,
            ok: message
          };
        }
        else {
          options = {
            title: title,
            subtitle: message,
            ok: okfn,
            cancelFn: cancelfn
          };
        }
      }
      if (_.isFunction(options.ok)) {
        options.ok = _.bind(options.ok, this);
      }
      if (_.isFunction(options.cancelFn)) {
        options.cancelFn = _.bind(options.cancelFn, this);
      }
      this.broadcast('confirmation', options);
      return this;
    },

    /**
    * Shows a alert box
    *
    * The main difference between this and the native javascript `alert` method
    * Is this method is non blocking.
    *
    * Examples:
    *
    * ```javascript
    * view.alert('Mission complete');
    * ```
    *
    * @param {String} message The message
    */
    alert: function (params) {
      if (_.isString(params)) {
        params = {
          subtitle: params
        };
      }
      this.confirm(_.extend({}, params, {
        noCancelButton: true
      }));
      return this;
    }
  };

  return View.extend(proto, {
    decorate: function (TargetView) {
      var View = TargetView.extend({});
      _.defaults(View.prototype, proto);
      return View;
    }
  });

});
