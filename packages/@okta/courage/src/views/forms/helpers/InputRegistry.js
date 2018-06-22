define(['okta/underscore'], function (_) {
  var registry = {};

  function isBaseInput(input) {
    if (_.isFunction(input)) {
      return _.isFunction(input.prototype.editMode) && _.isFunction(input.prototype.readMode);
    } else {
      return _.isObject(input) && _.isFunction(input.editMode) && _.isFunction(input.readMode);
    }
  }

  /**
   * @class module:Okta.internal.views.forms.helpers.InputRegistry
   */
  return /** @lends module:Okta.internal.views.forms.helpers.InputRegistry */ {
    isBaseInput: isBaseInput,

    /**
     * Register a form input
     * @param {String} type string identifier for the input
     * @param {BaseInput} input the input to register
     */
    register: function (type, input) {
      registry[type] = input;
    },

    /**
     * Get a form input by type
     * @param {Object} options input definition
     * @param {String} options.type string identifier for the input
     * @return {BaseInput} a matching input
     */
    get: function (options) {
      var input = registry[options.type];
      return input && (isBaseInput(input) ? input : input(options));
    },

    /**
     * Unregister an input type
     * @param {String} type
     */
    unregister: function (type) {
      delete registry[type];
    }
  };
});
