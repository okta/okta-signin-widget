import { commonjsGlobal } from '../../../../../_virtual/_commonjsHelpers.js';
import { n as noConflict } from '../../../../../_virtual/no-conflict.js';

(function (module, exports) {

exports.__esModule = true;

exports['default'] = function (Handlebars) {
  /* istanbul ignore next */
  var root = typeof commonjsGlobal !== 'undefined' ? commonjsGlobal : window,
      $Handlebars = root.Handlebars;
  /* istanbul ignore next */

  Handlebars.noConflict = function () {
    if (root.Handlebars === Handlebars) {
      root.Handlebars = $Handlebars;
    }

    return Handlebars;
  };
};

module.exports = exports['default'];
}(noConflict, noConflict.exports));
