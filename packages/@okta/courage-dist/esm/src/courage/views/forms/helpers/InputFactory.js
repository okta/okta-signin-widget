import oktaUnderscore from '../../../util/underscore-wrapper.js';
import InputRegistry from './InputRegistry.js';

/* eslint complexity: 0, max-statements: 0 */

function createInput(Input, options) {
  if (InputRegistry.isBaseInput(Input)) {
    return Input.prototype ? new Input(oktaUnderscore.omit(options, 'input')) : Input;
  } else {
    return Input;
  }
}

function create(options) {
  options = oktaUnderscore.clone(options);

  if (options.input) {
    return createInput(options.input, options);
  }

  const Input = InputRegistry.get(options);

  if (!Input) {
    throw new Error('unknown input: ' + options.type);
  }

  return createInput(Input, options);
}

function supports(options) {
  return !!options.input || !!InputRegistry.get(options);
}

var InputFactory = {
  create: create,
  supports: supports
};

export { InputFactory as default };
