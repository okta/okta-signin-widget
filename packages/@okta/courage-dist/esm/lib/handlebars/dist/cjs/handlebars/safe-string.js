import { s as safeString } from '../../../../../_virtual/safe-string.js';

(function (module, exports) {

exports.__esModule = true;

function SafeString(string) {
  this.string = string;
}

SafeString.prototype.toString = SafeString.prototype.toHTML = function () {
  return '' + this.string;
};

exports['default'] = SafeString;
module.exports = exports['default'];
}(safeString, safeString.exports));
