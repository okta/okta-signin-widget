define(['okta/underscore', 'shared/models/Model'], function (_, Model) {

  /**
   * @class StateMachine
   * @extends Okta.Model
   * @private
   *
   * A state object that holds the applciation state
   */

  return Model.extend({
    extraProperties: true,
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
      var args = _.toArray(arguments);
      args.unshift('__invoke__');
      this.trigger.apply(this, args);
    }
  });

});
