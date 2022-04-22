import { l as lookup } from '../../../../../../_virtual/lookup.js';

(function (module, exports) {

exports.__esModule = true;

exports['default'] = function (instance) {
  instance.registerHelper('lookup', function (obj, field, options) {
    if (!obj) {
      // Note for 5.0: Change to "obj == null" in 5.0
      return obj;
    }

    return options.lookupProperty(obj, field);
  });
};

module.exports = exports['default'];
}(lookup, lookup.exports));
