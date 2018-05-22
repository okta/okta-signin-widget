/* eslint max-len: [2, 150], max-params: [2, 7] */
define([
  'okta/jquery',
  'okta/underscore',
  'backbone',
  'shared/util/SettingsModel',
  'shared/util/Logger',
  'shared/views/components/Notification',
  'shared/views/components/ConfirmationDialog'
],
function ($, _, Backbone, SettingsModel, Logger, Notification, ConfirmationDialog) {

  function getRoute(router, route) {
    var root = _.result(router, 'root') || '';
    if (root && _.isString(route)) {
      return [root, route].join('/').replace(/\/{2,}/g, '/');
    }
    return route;
  }

  /**
   * BaseRouter is a standard [Backbone.Router](http://backbonejs.org/#Router)
   * with a few additions:
   * - Explicit mapping between routes and controllers
   * - Support for rendering notification and confirmation dialogs
   *
   * Checkout the [Hello World Tutorial](https://github.com/okta/courage/wiki/Hello-World)
   * for a step-by-step guide to using this.
   *
   * @class module:Okta.Router
   * @extends external:Backbone.Router
   * @param {Object} options options hash
   * @param {String} options.el a jQuery selector string stating where to attach the controller in the DOM
   */
  return Backbone.Router.extend(/** @lends module:Okta.Router.prototype */ {

    /**
     * The root URL for the router. When setting {@link http://backbonejs.org/#Router-routes|routes},
     * it will be prepended to each route.
     * @type {String|Function}
     */
    root: '',

    listen: Notification.prototype.listen,

    constructor: function (options) {
      options || (options = {});
      this.el = options.el;
      this.settings = new SettingsModel(_.omit(options, 'el'));
      if (options.root) {
        this.root = options.root;
      }

      Backbone.Router.apply(this, arguments);

      this.listen('notification', this._notify);
      this.listen('confirmation', this._confirm);
    },

    /**
     * Fires up a confirmation dialog
     *
     * @param  {Object} options Options Hash
     * @param  {String} options.title The title
     * @param  {String} options.subtitle The explain text
     * @param  {String} options.save The text for the save button
     * @param  {Function} options.ok The callback function to run when hitting "OK"
     * @param  {String} options.cancel The text for the cancel button
     * @param  {Function} options.cancelFn The callback function to run when hitting "Cancel"
     * @param  {Boolean} options.noCancelButton Don't render the cancel button (useful for alert dialogs)
     *
     * @private
     *
     * @return {Okta.View} the dialog view
     */
    _confirm: function (options) {
      options || (options = {});
      var Dialog = ConfirmationDialog.extend(
       _.pick(options, 'title', 'subtitle', 'save', 'ok', 'cancel', 'cancelFn', 'noCancelButton', 'content', 'danger'));
      // The model is here because itsa part of the BaseForm paradigm.
      // It will be ignored in the context of a confirmation dialog.
      var dialog = new Dialog({model: this.settings});
      dialog.render();
      return dialog; // test hook
    },

    /**
     * Fires up a notification banner
     *
     * @param  {Object} options Options Hash
     * @return {Okta.View} the notification view
     * @private
     */
    _notify: function (options) {
      var notification = new Notification(options);
      $('#content').prepend(notification.render().el);
      return notification; // test hook
    },

    /**
     * Renders a Controller
     * This will initialize new instance of a controller and call render on it
     *
     * @param  {Okta.Controller} Controller The controller Class we which to render
     * @param  {Object} [options] Extra options to the controller constructor
     */
    render: function (Controller, options) {
      this.unload();
      options = _.extend(_.pick(this, 'settings', 'el'), options || {});
      this.controller = new Controller(options);
      this.controller.render();
    },

    /**
    * Starts the backbone history object
    *
    * Waits for the dom to be ready before calling `Backbone.history.start()` (IE issue).
    *
    * See [Backbone History](http://backbonejs.org/#History) for more information.
    */
    start: function () {
      var args = arguments;
      $(function () {
        if (Backbone.History.started) {
          Logger.error('History has already been started');
          return;
        }
        Backbone.history.start.apply(Backbone.history, args);
      });
    },

    /**
     * Removes active controller and frees up event listeners
     */
    unload: function () {
      if (this.controller) {
        this.stopListening(this.controller);
        this.stopListening(this.controller.state);
        this.controller.remove();
      }
    },

    route: function (route, name, callback) {
      return Backbone.Router.prototype.route.call(this, getRoute(this, route), name, callback);
    },

    navigate: function (fragment, options) {
      return Backbone.Router.prototype.navigate.call(this, getRoute(this, fragment), options);
    }

  });

});
