import { b as blockHelperMissing } from '../../../../../../_virtual/block-helper-missing.js';
import '../utils.js';
import { __exports as utils } from '../../../../../../_virtual/utils.js';

(function (module, exports) {

exports.__esModule = true;

var _utils = utils;

exports['default'] = function (instance) {
  instance.registerHelper('blockHelperMissing', function (context, options) {
    var inverse = options.inverse,
        fn = options.fn;

    if (context === true) {
      return fn(this);
    } else if (context === false || context == null) {
      return inverse(this);
    } else if (_utils.isArray(context)) {
      if (context.length > 0) {
        if (options.ids) {
          options.ids = [options.name];
        }

        return instance.helpers.each(context, options);
      } else {
        return inverse(this);
      }
    } else {
      if (options.data && options.ids) {
        var data = _utils.createFrame(options.data);

        data.contextPath = _utils.appendContextPath(options.data.contextPath, options.name);
        options = {
          data: data
        };
      }

      return fn(context, options);
    }
  });
};

module.exports = exports['default'];
}(blockHelperMissing, blockHelperMissing.exports));
