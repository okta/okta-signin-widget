import { __exports as helpers } from '../../../../../_virtual/helpers.js';
export { __exports as default } from '../../../../../_virtual/helpers.js';
import './helpers/block-helper-missing.js';
import './helpers/each.js';
import './helpers/helper-missing.js';
import './helpers/if.js';
import './helpers/log.js';
import './helpers/lookup.js';
import './helpers/with.js';
import { e as each } from '../../../../../_virtual/each.js';
import { h as helperMissing } from '../../../../../_virtual/helper-missing.js';
import { _ as _if } from '../../../../../_virtual/if.js';
import { l as log } from '../../../../../_virtual/log.js';
import { l as lookup } from '../../../../../_virtual/lookup.js';
import { _ as _with } from '../../../../../_virtual/with.js';
import { b as blockHelperMissing } from '../../../../../_virtual/block-helper-missing.js';

helpers.__esModule = true;
helpers.registerDefaultHelpers = registerDefaultHelpers;
helpers.moveHelperToHooks = moveHelperToHooks; // istanbul ignore next

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    'default': obj
  };
}

var _helpersBlockHelperMissing = blockHelperMissing.exports;

var _helpersBlockHelperMissing2 = _interopRequireDefault(_helpersBlockHelperMissing);

var _helpersEach = each.exports;

var _helpersEach2 = _interopRequireDefault(_helpersEach);

var _helpersHelperMissing = helperMissing.exports;

var _helpersHelperMissing2 = _interopRequireDefault(_helpersHelperMissing);

var _helpersIf = _if.exports;

var _helpersIf2 = _interopRequireDefault(_helpersIf);

var _helpersLog = log.exports;

var _helpersLog2 = _interopRequireDefault(_helpersLog);

var _helpersLookup = lookup.exports;

var _helpersLookup2 = _interopRequireDefault(_helpersLookup);

var _helpersWith = _with.exports;

var _helpersWith2 = _interopRequireDefault(_helpersWith);

function registerDefaultHelpers(instance) {
  _helpersBlockHelperMissing2['default'](instance);

  _helpersEach2['default'](instance);

  _helpersHelperMissing2['default'](instance);

  _helpersIf2['default'](instance);

  _helpersLog2['default'](instance);

  _helpersLookup2['default'](instance);

  _helpersWith2['default'](instance);
}

function moveHelperToHooks(instance, helperName, keepHelper) {
  if (instance.helpers[helperName]) {
    instance.hooks[helperName] = instance.helpers[helperName];

    if (!keepHelper) {
      delete instance.helpers[helperName];
    }
  }
}
