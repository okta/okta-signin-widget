import { __exports as base } from '../../../../../_virtual/base.js';
export { __exports as default } from '../../../../../_virtual/base.js';
import './utils.js';
import './exception.js';
import './helpers.js';
import './decorators.js';
import './logger.js';
import './internal/proto-access.js';
import { __exports as utils } from '../../../../../_virtual/utils.js';
import { __exports as protoAccess } from '../../../../../_virtual/proto-access.js';
import { __exports as helpers } from '../../../../../_virtual/helpers.js';
import { __exports as decorators } from '../../../../../_virtual/decorators.js';
import { l as logger } from '../../../../../_virtual/logger.js';
import { e as exception } from '../../../../../_virtual/exception.js';

base.__esModule = true;
base.HandlebarsEnvironment = HandlebarsEnvironment; // istanbul ignore next

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    'default': obj
  };
}

var _utils = utils;

var _exception = exception.exports;

var _exception2 = _interopRequireDefault(_exception);

var _helpers = helpers;

var _decorators = decorators;

var _logger = logger.exports;

var _logger2 = _interopRequireDefault(_logger);

var _internalProtoAccess = protoAccess;

var VERSION = '4.7.7';
base.VERSION = VERSION;
var COMPILER_REVISION = 8;
base.COMPILER_REVISION = COMPILER_REVISION;
var LAST_COMPATIBLE_COMPILER_REVISION = 7;
base.LAST_COMPATIBLE_COMPILER_REVISION = LAST_COMPATIBLE_COMPILER_REVISION;
var REVISION_CHANGES = {
  1: '<= 1.0.rc.2',
  // 1.0.rc.2 is actually rev2 but doesn't report it
  2: '== 1.0.0-rc.3',
  3: '== 1.0.0-rc.4',
  4: '== 1.x.x',
  5: '== 2.0.0-alpha.x',
  6: '>= 2.0.0-beta.1',
  7: '>= 4.0.0 <4.3.0',
  8: '>= 4.3.0'
};
base.REVISION_CHANGES = REVISION_CHANGES;
var objectType = '[object Object]';

function HandlebarsEnvironment(helpers, partials, decorators) {
  this.helpers = helpers || {};
  this.partials = partials || {};
  this.decorators = decorators || {};

  _helpers.registerDefaultHelpers(this);

  _decorators.registerDefaultDecorators(this);
}

HandlebarsEnvironment.prototype = {
  constructor: HandlebarsEnvironment,
  logger: _logger2['default'],
  log: _logger2['default'].log,
  registerHelper: function registerHelper(name, fn) {
    if (_utils.toString.call(name) === objectType) {
      if (fn) {
        throw new _exception2['default']('Arg not supported with multiple helpers');
      }

      _utils.extend(this.helpers, name);
    } else {
      this.helpers[name] = fn;
    }
  },
  unregisterHelper: function unregisterHelper(name) {
    delete this.helpers[name];
  },
  registerPartial: function registerPartial(name, partial) {
    if (_utils.toString.call(name) === objectType) {
      _utils.extend(this.partials, name);
    } else {
      if (typeof partial === 'undefined') {
        throw new _exception2['default']('Attempting to register a partial called "' + name + '" as undefined');
      }

      this.partials[name] = partial;
    }
  },
  unregisterPartial: function unregisterPartial(name) {
    delete this.partials[name];
  },
  registerDecorator: function registerDecorator(name, fn) {
    if (_utils.toString.call(name) === objectType) {
      if (fn) {
        throw new _exception2['default']('Arg not supported with multiple decorators');
      }

      _utils.extend(this.decorators, name);
    } else {
      this.decorators[name] = fn;
    }
  },
  unregisterDecorator: function unregisterDecorator(name) {
    delete this.decorators[name];
  },

  /**
   * Reset the memory of illegal property accesses that have already been logged.
   * @deprecated should only be used in handlebars test-cases
   */
  resetLoggedPropertyAccesses: function resetLoggedPropertyAccesses() {
    _internalProtoAccess.resetLoggedProperties();
  }
};
var log = _logger2['default'].log;
base.log = log;
base.createFrame = _utils.createFrame;
base.logger = _logger2['default'];
