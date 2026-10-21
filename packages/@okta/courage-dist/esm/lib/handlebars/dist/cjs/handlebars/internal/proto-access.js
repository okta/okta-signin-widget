import { __exports as protoAccess } from '../../../../../../_virtual/proto-access.js';
export { __exports as default } from '../../../../../../_virtual/proto-access.js';
import '../utils.js';
import '../logger.js';
import { __exports as utils } from '../../../../../../_virtual/utils.js';
import { l as logger } from '../../../../../../_virtual/logger.js';

protoAccess.__esModule = true;
protoAccess.createProtoAccessControl = createProtoAccessControl;
protoAccess.resultIsAllowed = resultIsAllowed;
protoAccess.isPrototypeConstructor = isPrototypeConstructor;
protoAccess.resetLoggedProperties = resetLoggedProperties; // istanbul ignore next

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    'default': obj
  };
}

var _utils = utils;

var _logger = logger.exports;

var _logger2 = _interopRequireDefault(_logger);

var loggedProperties = Object.create(null);

function createProtoAccessControl(runtimeOptions) {
  // Create an object with "null"-prototype to avoid truthy results on
  // prototype properties.
  var propertyWhiteList = Object.create(null); // eslint-disable-next-line no-proto

  propertyWhiteList['__proto__'] = false;

  _utils.extend(propertyWhiteList, runtimeOptions.allowedProtoProperties);

  var methodWhiteList = Object.create(null);
  methodWhiteList['constructor'] = false;
  methodWhiteList['__defineGetter__'] = false;
  methodWhiteList['__defineSetter__'] = false;
  methodWhiteList['__lookupGetter__'] = false;
  methodWhiteList['__lookupSetter__'] = false;

  _utils.extend(methodWhiteList, runtimeOptions.allowedProtoMethods);

  return {
    properties: {
      whitelist: propertyWhiteList,
      defaultValue: runtimeOptions.allowProtoPropertiesByDefault
    },
    methods: {
      whitelist: methodWhiteList,
      defaultValue: runtimeOptions.allowProtoMethodsByDefault
    }
  };
}

function resultIsAllowed(result, protoAccessControl, propertyName) {
  if (typeof result === 'function') {
    return checkWhiteList(protoAccessControl.methods, propertyName);
  } else {
    return checkWhiteList(protoAccessControl.properties, propertyName);
  }
}
/**
 * Detect a prototype object's own "constructor" back-reference, e.g.
 * `Function.prototype.constructor === Function`. Because "constructor" is an
 * "own" property of such objects, it would otherwise bypass the prototype-access
 * checks and expose dangerous constructors (allowing arbitrary code execution).
 *
 * Only functions can be constructors, so other values are never treated as one
 * and their `prototype` is never read.
 *
 * @param {*} parent the object the property is being read from
 * @param {string} propertyName the property being looked up
 * @param {*} result the already-resolved value of `parent[propertyName]`
 * @returns {boolean} true if the lookup resolves `parent`'s own constructor
 */


function isPrototypeConstructor(parent, propertyName, result) {
  return propertyName === 'constructor' && typeof result === 'function' && parent === result.prototype;
}

function checkWhiteList(protoAccessControlForType, propertyName) {
  if (protoAccessControlForType.whitelist[propertyName] !== undefined) {
    return protoAccessControlForType.whitelist[propertyName] === true;
  }

  if (protoAccessControlForType.defaultValue !== undefined) {
    return protoAccessControlForType.defaultValue;
  }

  logUnexpecedPropertyAccessOnce(propertyName);
  return false;
}

function logUnexpecedPropertyAccessOnce(propertyName) {
  if (loggedProperties[propertyName] !== true) {
    loggedProperties[propertyName] = true;

    _logger2['default'].log('error', 'Handlebars: Access has been denied to resolve the property "' + propertyName + '" because it is not an "own property" of its parent.\n' + 'You can add a runtime option to disable the check or this warning:\n' + 'See https://handlebarsjs.com/api-reference/runtime-options.html#options-to-control-prototype-access for details');
  }
}

function resetLoggedProperties() {
  Object.keys(loggedProperties).forEach(function (propertyName) {
    delete loggedProperties[propertyName];
  });
}
