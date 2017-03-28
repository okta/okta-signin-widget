/* eslint max-len: [2, 150], max-params: [2, 6] */
define([
  'okta/jquery',
  'okta/underscore',
  'backbone',
  'shared/util/SettingsModel',
  'shared/views/components/Notification',
  'shared/views/components/ConfirmationDialog'
],
function ($, _, Backbone, SettingsModel, Notification, ConfirmationDialog) {

  return Backbone.Router.extend({

    listen: Notification.prototype.listen,

    /**
    * @class Okta.Router
    * A simple state machine that maps a route to a controller
    *
    *  Typically it will:
    *
    * - define which routes/modules the application has
    * - Map a route to a controller
    *
    * See:
    * [Hello World Tutorial](https://github.com/okta/courage/wiki/Hello-World),
    * [Jasmine Spec](https://github.com/okta/okta-core/blob/master/WebContent/js/test/unit/spec/shared/util/BaseRouter_spec.js),
    * [Backbone.Router](http://backbonejs.org/#Router)
    *
    * @constructor
    *
    * Creates the application settings object
    *
    * @param {Object} options options hash
    * @param {String} options.el a jQuery selector string stating where to attach the controller in the DOM
    *
    * @extends {Backbone.Router}
    *
    */
    constructor: function (options) {
      options || (options = {});
      this.el = options.el;
      this.settings = new SettingsModel(_.omit(options, 'el'));

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
      if (this.controller) {
        this.stopListening(this.controller);
        this.stopListening(this.controller.state);
        this.controller.remove();
      }
      options = _.extend(_.pick(this, 'settings', 'el'), options || {});
      this.controller = new Controller(options);
      this.controller.render();
    },

    /**
    * Starts the backbone history object
    *
    * Waits for the dom to be ready before calling `Backbone.history.start()` (IE issue)
    *
    * See: [Backbone History](http://backbonejs.org/#History)
    */
    start: function () {
      var args = arguments;
      $(function () {
        Backbone.history.start.apply(Backbone.history, args);
      });
    }
  });

});
