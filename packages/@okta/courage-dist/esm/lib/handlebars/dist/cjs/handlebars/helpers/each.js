import { e as each } from '../../../../../../_virtual/each.js';
import '../utils.js';
import '../exception.js';
import { __exports as utils } from '../../../../../../_virtual/utils.js';
import { e as exception } from '../../../../../../_virtual/exception.js';

(function (module, exports) {

exports.__esModule = true; // istanbul ignore next

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    'default': obj
  };
}

var _utils = utils;

var _exception = exception.exports;

var _exception2 = _interopRequireDefault(_exception);
/**
 * Close an unfinished iterator after the block body threw, like for...of does,
 * so that generators can run their cleanup code.
 *
 * Errors thrown while closing, including by a `return` getter, are ignored:
 * the block's error is the cause and is the one the caller must see.
 *
 * @param {Iterator} iterator the iterator that was being consumed
 */


function closeIterator(iterator) {
  try {
    var _close = iterator['return'];

    if (_utils.isFunction(_close)) {
      _close.call(iterator);
    }
  } catch (closeError) {// NOP
  }
}

exports['default'] = function (instance) {
  instance.registerHelper('each', function (context, options) {
    if (!options) {
      throw new _exception2['default']('Must pass iterator to #each');
    }

    var fn = options.fn,
        inverse = options.inverse,
        i = 0,
        ret = '',
        data = undefined,
        contextPath = undefined;

    if (options.data && options.ids) {
      contextPath = _utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';
    }

    if (_utils.isFunction(context)) {
      context = context.call(this);
    }

    if (options.data) {
      data = _utils.createFrame(options.data);
    }

    function execIteration(field, index, last, value) {
      if (data) {
        data.key = field;
        data.index = index;
        data.first = index === 0;
        data.last = !!last;

        if (contextPath) {
          data.contextPath = contextPath + field;
        }
      }

      ret = ret + fn(value, {
        data: data,
        blockParams: _utils.blockParams([value, field], [contextPath + field, null])
      });
    }

    if (context && typeof context === 'object') {
      if (_utils.isArray(context)) {
        for (var j = context.length; i < j; i++) {
          if (i in context) {
            execIteration(i, i, i === context.length - 1, context[i]);
          }
        }
      } else if (typeof Symbol === 'function' && context[Symbol.iterator]) {
        var iterator = context[Symbol.iterator]();
        var current = iterator.next();

        while (!current.done) {
          var next = iterator.next();

          try {
            execIteration(i, i, next.done, current.value);
          } catch (e) {
            if (!next.done) {
              closeIterator(iterator);
            }

            throw e;
          }

          current = next;
          i++;
        }
      } else {
        (function () {
          var priorKey = undefined;
          Object.keys(context).forEach(function (key) {
            // We're running the iterations one step out of sync so we can detect
            // the last iteration without have to scan the object twice and create
            // an itermediate keys array.
            if (priorKey !== undefined) {
              execIteration(priorKey, i - 1, false, context[priorKey]);
            }

            priorKey = key;
            i++;
          });

          if (priorKey !== undefined) {
            execIteration(priorKey, i - 1, true, context[priorKey]);
          }
        })();
      }
    }

    if (i === 0) {
      ret = inverse(this);
    }

    return ret;
  });
};

module.exports = exports['default'];
}(each, each.exports));
