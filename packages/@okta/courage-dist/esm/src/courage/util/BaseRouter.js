import Backbone from '../vendor/lib/backbone.js';
import ConfirmationDialog from '../../empty.js';
import oktaJQueryStatic from './jquery-wrapper.js';
import oktaUnderscore from './underscore-wrapper.js';
import Logger from './Logger.js';
import SettingsModel from './SettingsModel.js';
import Notification from '../views/components/Notification.js';

function getRoute(router, route) {
  const root = oktaUnderscore.result(router, 'root') || '';

  if (root && oktaUnderscore.isString(route)) {
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


const props =
/** @lends module:Okta.Router.prototype */
{
  /**
   * The root URL for the router. When setting {@link http://backbonejs.org/#Router-routes|routes},
   * it will be prepended to each route.
   * @type {String|Function}
   */
  root: '',
  listen: Notification.prototype.listen,
  constructor: function (options = {}) {
    this.el = options.el;
    /**
     * Make sure `this.settings` has been set before invoke super - `Backbone.Router.apply`,
     * which will invoke `this.initialize`, which could use `this.settings`.
     *
     * In theory we can set `this.settings` in `this.initialize` and assume `child.initialize`
     * will invoke `super.initialize` first. But in reality, `child.initialize` doesn't call
     * `super.initialize` at all.
     */

    this.settings = new SettingsModel(oktaUnderscore.omit(options, 'el'));

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
   * @param  {Array<string>} buttonOrder The order of the buttons
   * @param  {String} options.subtitle The explain text
   * @param  {String} options.save The text for the save button
   * @param  {Function} options.ok The callback function to run when hitting "OK"
   * @param  {String} options.cancel The text for the cancel button
   * @param  {Function} options.cancelFn The callback function to run when hitting "Cancel"
   * @param  {Boolean} options.noCancelButton Don't render the cancel button (useful for alert dialogs)
   * @param  {Boolean} options.noSubmitButton Don't render the primary button (useful for alert dialogs)
   * @private
   *
   * @return {Okta.View} the dialog view
   */
  _confirm: function (options = {}) {
    const Dialog = ConfirmationDialog.extend(oktaUnderscore.pick(options, 'title', 'subtitle', 'save', 'ok', 'cancel', 'cancelFn', 'noCancelButton', 'noSubmitButton', 'content', 'danger', 'type', 'closeOnOverlayClick', 'buttonOrder'));
    const dialog = new Dialog({
      model: this.settings
    }); // The model is here because itsa part of the BaseForm paradigm.
    // It will be ignored in the context of a confirmation dialog.

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
    const notification = new Notification(options);
    oktaJQueryStatic('#content').prepend(notification.render().el);
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
    options = oktaUnderscore.extend(oktaUnderscore.pick(this, 'settings', 'el'), options || {});
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
  start: function (...args) {
    oktaJQueryStatic(function () {
      if (Backbone.History.started) {
        Logger.error('History has already been started');
        return;
      }

      Backbone.history.start(...args);
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
};
var BaseRouter = Backbone.Router.extend(props);

export { BaseRouter as default };
