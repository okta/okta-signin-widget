import { __exports as wrapHelper$1 } from '../../../../../../_virtual/wrapHelper.js';
export { __exports as default } from '../../../../../../_virtual/wrapHelper.js';

wrapHelper$1.__esModule = true;
wrapHelper$1.wrapHelper = wrapHelper;

function wrapHelper(helper, transformOptionsFn) {
  if (typeof helper !== 'function') {
    // This should not happen, but apparently it does in https://github.com/wycats/handlebars.js/issues/1639
    // We try to make the wrapper least-invasive by not wrapping it, if the helper is not a function.
    return helper;
  }

  var wrapper = function wrapper()
  /* dynamic arguments */
  {
    var options = arguments[arguments.length - 1];
    arguments[arguments.length - 1] = transformOptionsFn(options);
    return helper.apply(this, arguments);
  };

  return wrapper;
}
