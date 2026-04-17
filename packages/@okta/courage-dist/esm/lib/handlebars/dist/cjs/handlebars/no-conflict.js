import { n as noConflict } from '../../../../../_virtual/no-conflict.js';

/* global globalThis */

(function (module, exports) {

exports.__esModule = true;

exports['default'] = function (Handlebars) {
  /* istanbul ignore next */
  // https://mathiasbynens.be/notes/globalthis
  (function () {
    if (typeof globalThis === 'object') return;

    Object.prototype.__defineGetter__('__magic__', function () {
      return this;
    });

    __magic__.globalThis = __magic__; // eslint-disable-line no-undef

    delete Object.prototype.__magic__;
  })();

  var $Handlebars = globalThis.Handlebars;
  /* istanbul ignore next */

  Handlebars.noConflict = function () {
    if (globalThis.Handlebars === Handlebars) {
      globalThis.Handlebars = $Handlebars;
    }

    return Handlebars;
  };
};

module.exports = exports['default'];
}(noConflict, noConflict.exports));
