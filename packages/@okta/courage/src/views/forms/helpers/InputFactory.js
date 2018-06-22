/* eslint max-params: 0, complexity: 0, max-statements: 0 */
define([
  'okta/underscore',
  './InputRegistry'
],
function (_, InputRegistry) {

  function createInput(Input, options) {
    if (InputRegistry.isBaseInput(Input)) {
      return Input.prototype ? new Input(_.omit(options, 'input')) : Input;
    }
    else {
      return Input;
    }
  }

  function create(options) {
    options = _.clone(options);
    if (options.input) {
      return createInput(options.input, options);
    }
    var Input = InputRegistry.get(options);
    if (!Input) {
      throw new Error('unknown input: ' + options.type);
    }
    return createInput(Input, options);
  }

  function supports(options) {
    return !!options.input || !!InputRegistry.get(options);
  }

  return {
    create: create,
    supports: supports
  };

});
