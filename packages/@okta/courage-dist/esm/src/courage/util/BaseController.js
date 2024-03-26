import oktaJQueryStatic from './jquery-wrapper.js';
import oktaUnderscore from './underscore-wrapper.js';
import BaseRouter from './BaseRouter.js';
import SettingsModel from './SettingsModel.js';
import StateMachine from './StateMachine.js';
import BaseView from '../views/BaseView.js';

function clean(obj) {
  const res = {};

  oktaUnderscore.each(obj, function (value, key) {
    if (!oktaUnderscore.isNull(value)) {
      res[key] = value;
    }
  });

  return res;
}

const proto =
/** @lends module:Okta.Controller.prototype */
{
  preinitialize: function (options = {}) {
    // If 'state' is passed down as options, use it, else create a 'new StateMachine()'
    this.state = oktaUnderscore.result(this, 'state');
    const hasStateBeenInitialized = this.state instanceof StateMachine || options.state instanceof StateMachine;

    if (!hasStateBeenInitialized) {
      const stateData = oktaUnderscore.defaults(clean(options.state), this.state || {}); // TODO:
      // `framework/View.js set `this.state = options.state.`.
      // Therefore we could consider to do
      // 1. `options.state = new StateMachine()`
      // 2. remove `delete options.state`


      this.state = new StateMachine(stateData);
      delete options.state;
    }

    if (!options.settings) {
      // allow the controller to live without a router
      options.settings = new SettingsModel(oktaUnderscore.omit(options || {}, 'el'));
      this.listen('notification', BaseRouter.prototype._notify);
      this.listen('confirmation', BaseRouter.prototype._confirm);
    }

    BaseView.prototype.preinitialize.call(this, options);
  },
  constructor: function (options = {}) {
    BaseView.call(this, options);
    this.listenTo(this.state, '__invoke__', function () {
      const args = oktaUnderscore.toArray(arguments);

      const method = args.shift();

      if (oktaUnderscore.isFunction(this[method])) {
        this[method].apply(this, args);
      }
    });
    let MainView; // if `this.View` is already a Backbone View

    if (this.View && this.View.isCourageView) {
      MainView = this.View;
    } // if `this.View` is a pure function that returns a Backbone View
    else if (oktaUnderscore.result(this, 'View') && oktaUnderscore.result(this, 'View').isCourageView) {
      MainView = oktaUnderscore.result(this, 'View');
    }

    if (MainView) {
      this.add(new MainView(this.toJSON()));
    }
  },

  /**
   * The default values of our application state
   * @type {Object}
   * @default {}
   */
  state: {},

  /**
   * The main view this controller operate on
   * @type {module:Okta.View}
   * @default null
   */
  View: null,

  /**
   * Renders the {@link module:Okta.Controller#View|main view} after the DOM is ready
   * in case the controller is the root component of the page (e.g there's no router)
   */
  render: function () {
    const args = arguments;
    const self = this;
    oktaJQueryStatic(function () {
      BaseView.prototype.render.apply(self, args);
    });
    return this;
  },

  /**
   * Creates the view constructor options
   * @param {Object} [options] Extra options
   * @return {Object} The view constructor options
   */
  toJSON: function (options) {
    return oktaUnderscore.extend(oktaUnderscore.pick(this, 'state', 'settings', 'collection', 'model'), options || {});
  },

  /**
   * Removes the child views, empty the DOM element and stop listening to events
   */
  remove: function () {
    this.removeChildren();
    this.stopListening();
    this.$el.empty();
    return this;
  }
};
/**
 * A Controller is our application control flow component.
 *
 * Typically it will:
 * - Initialize the models, controller and main views
 * - Listen to events
 * - Create, read, update and delete models
 * - Create modal dialogs, confirmation dialogs and alert dialogs
 * - Control the application flow
 *
 * The constructor is responsible for:
 * - Create the application state object
 * - Assign or creates the application settings object
 * - Create an instance of the main view with the relevant parameters
 *
 * See:
 * [Hello World Tutorial](https://github.com/okta/courage/wiki/Hello-World),
 * [Test Spec](https://github.com/okta/okta-ui/blob/master/packages/courage/test/spec/util/BaseController_spec.js)
 *
 * @class module:Okta.Controller
 * @param {Object} options Options Hash
 * @param {SettingsModel} [options.settings] Application Settings Model
 * @param {String} options.el a jQuery selector string stating where to attach the controller in the DOM
 */

var BaseController = BaseView.extend(proto);

export { BaseController as default };
