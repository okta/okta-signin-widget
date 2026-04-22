import { __exports as createNewLookupObject$1 } from '../../../../../../_virtual/create-new-lookup-object.js';
export { __exports as default } from '../../../../../../_virtual/create-new-lookup-object.js';
import '../utils.js';
import { __exports as utils } from '../../../../../../_virtual/utils.js';

createNewLookupObject$1.__esModule = true;
createNewLookupObject$1.createNewLookupObject = createNewLookupObject;

var _utils = utils;
/**
 * Create a new object with "null"-prototype to avoid truthy results on prototype properties.
 * The resulting object can be used with "object[property]" to check if a property exists
 * @param {...object} sources a varargs parameter of source objects that will be merged
 * @returns {object}
 */


function createNewLookupObject() {
  for (var _len = arguments.length, sources = Array(_len), _key = 0; _key < _len; _key++) {
    sources[_key] = arguments[_key];
  }

  return _utils.extend.apply(undefined, [Object.create(null)].concat(sources));
}
