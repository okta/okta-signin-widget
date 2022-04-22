import { getDefaultExportFromCjs } from '../../../../_virtual/_commonjsHelpers.js';
import { h as handlebars_runtime } from '../../../../_virtual/handlebars.runtime.js';
import './handlebars/base.js';
import './handlebars/safe-string.js';
import './handlebars/exception.js';
import './handlebars/utils.js';
import './handlebars/runtime.js';
import './handlebars/no-conflict.js';
import { __exports as base } from '../../../../_virtual/base.js';
import { __exports as utils } from '../../../../_virtual/utils.js';
import { __exports as runtime } from '../../../../_virtual/runtime.js';
import { e as exception } from '../../../../_virtual/exception.js';
import { n as noConflict } from '../../../../_virtual/no-conflict.js';
import { s as safeString } from '../../../../_virtual/safe-string.js';

(function (module, exports) {

exports.__esModule = true; // istanbul ignore next

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    'default': obj
  };
} // istanbul ignore next


function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};

    if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
      }
    }

    newObj['default'] = obj;
    return newObj;
  }
}

var _handlebarsBase = base;

var base$1 = _interopRequireWildcard(_handlebarsBase); // Each of these augment the Handlebars object. No need to setup here.
// (This is done to easily share code between commonjs and browse envs)


var _handlebarsSafeString = safeString.exports;

var _handlebarsSafeString2 = _interopRequireDefault(_handlebarsSafeString);

var _handlebarsException = exception.exports;

var _handlebarsException2 = _interopRequireDefault(_handlebarsException);

var _handlebarsUtils = utils;

var Utils = _interopRequireWildcard(_handlebarsUtils);

var _handlebarsRuntime = runtime;

var runtime$1 = _interopRequireWildcard(_handlebarsRuntime);

var _handlebarsNoConflict = noConflict.exports;

var _handlebarsNoConflict2 = _interopRequireDefault(_handlebarsNoConflict); // For compatibility and usage outside of module systems, make the Handlebars object a namespace


function create() {
  var hb = new base$1.HandlebarsEnvironment();
  Utils.extend(hb, base$1);
  hb.SafeString = _handlebarsSafeString2['default'];
  hb.Exception = _handlebarsException2['default'];
  hb.Utils = Utils;
  hb.escapeExpression = Utils.escapeExpression;
  hb.VM = runtime$1;

  hb.template = function (spec) {
    return runtime$1.template(spec, hb);
  };

  return hb;
}

var inst = create();
inst.create = create;

_handlebarsNoConflict2['default'](inst);

inst['default'] = inst;
exports['default'] = inst;
module.exports = exports['default'];
}(handlebars_runtime, handlebars_runtime.exports));

var _Handlebars2 = /*@__PURE__*/getDefaultExportFromCjs(handlebars_runtime.exports);

export { _Handlebars2 as default };
