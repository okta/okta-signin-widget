import oktaUnderscore from './underscore-wrapper.js';
import Model from '../models/Model.js';

/**
 * @class StateMachine
 * @extends Okta.Model
 * @private
 *
 * A state object that holds the applciation state
 */
var StateMachine = Model.extend({
  /**
   * Invokes a method on the applicable {@link Okta.Controller}
   *
   * ```javascript
   * state.invoke('methodName', 'param1', 'param2')
   * // Will call
   * contoller.methodName('param1', 'param2')
   * ```
   * @param {String} methodName the name of the controller method to invoke on the controller
   */
  invoke: function () {
    const args = oktaUnderscore.toArray(arguments);

    args.unshift('__invoke__');
    this.trigger.apply(this, args);
  }
});

export { StateMachine as default };
