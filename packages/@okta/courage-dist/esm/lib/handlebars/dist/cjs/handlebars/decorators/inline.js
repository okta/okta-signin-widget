import { i as inline } from '../../../../../../_virtual/inline.js';
import '../utils.js';
import { __exports as utils } from '../../../../../../_virtual/utils.js';

(function (module, exports) {

exports.__esModule = true;

var _utils = utils;

exports['default'] = function (instance) {
  instance.registerDecorator('inline', function (fn, props, container, options) {
    var ret = fn;

    if (!props.partials) {
      props.partials = {};

      ret = function (context, options) {
        // Create a new partials stack frame prior to exec.
        var original = container.partials;
        container.partials = _utils.extend({}, original, props.partials);
        var ret = fn(context, options);
        container.partials = original;
        return ret;
      };
    }

    props.partials[options.args[0]] = options.fn;
    return ret;
  });
};

module.exports = exports['default'];
}(inline, inline.exports));
