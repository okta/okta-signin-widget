import { h as helperMissing } from '../../../../../../_virtual/helper-missing.js';
import '../exception.js';
import { e as exception } from '../../../../../../_virtual/exception.js';

(function (module, exports) {

exports.__esModule = true; // istanbul ignore next

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    'default': obj
  };
}

var _exception = exception.exports;

var _exception2 = _interopRequireDefault(_exception);

exports['default'] = function (instance) {
  instance.registerHelper('helperMissing', function ()
  /* [args, ]options */
  {
    if (arguments.length === 1) {
      // A missing field in a {{foo}} construct.
      return undefined;
    } else {
      // Someone is actually trying to call something, blow up.
      throw new _exception2['default']('Missing helper: "' + arguments[arguments.length - 1].name + '"');
    }
  });
};

module.exports = exports['default'];
}(helperMissing, helperMissing.exports));
