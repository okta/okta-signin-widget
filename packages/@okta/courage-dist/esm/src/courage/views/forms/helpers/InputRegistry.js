import oktaUnderscore from '../../../util/underscore-wrapper.js';

const registry = {};

function isBaseInput(input) {
  if (oktaUnderscore.isFunction(input)) {
    return oktaUnderscore.isFunction(input.prototype.editMode) && oktaUnderscore.isFunction(input.prototype.readMode);
  } else {
    return oktaUnderscore.isObject(input) && oktaUnderscore.isFunction(input.editMode) && oktaUnderscore.isFunction(input.readMode);
  }
}
/**
 * @class module:Okta.internal.views.forms.helpers.InputRegistry
 */


var InputRegistry = /** @lends module:Okta.internal.views.forms.helpers.InputRegistry */
{
  isBaseInput: isBaseInput,

  /**
   * Register a form input
   * @param {String} type string identifier for the input
   * @param {BaseInput} input the input to register
   * @return {void}
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
    const input = registry[options.type];
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

export { InputRegistry as default };
