function log(level, ...args) {
  if (window.console && window.okta && window.okta.debug) {
    window.console[level](...args);
  }
}
/**
 * Utility library of logging functions.
 * @class module:Okta.Logger
 */


var Logger = /** @lends module:Okta.Logger */
{
  /**
   * See [console.trace](https://developer.mozilla.org/en-US/docs/Web/API/Console.trace)
   * @static
   */
  trace: function (...args) {
    return log('trace', ...args);
  },

  /**
   * See [console.dir](https://developer.mozilla.org/en-US/docs/Web/API/Console.dir)
   * @static
   */
  dir: function (...args) {
    return log('dir', ...args);
  },

  /**
   * See [console.time](https://developer.mozilla.org/en-US/docs/Web/API/Console.time)
   * @static
   */
  time: function (...args) {
    return log('time', ...args);
  },

  /**
   * See [console.timeEnd](https://developer.mozilla.org/en-US/docs/Web/API/Console.timeEnd)
   * @static
   */
  timeEnd: function (...args) {
    return log('timeEnd', ...args);
  },

  /**
   * See [console.group](https://developer.mozilla.org/en-US/docs/Web/API/Console.group)
   * @static
   */
  group: function (...args) {
    return log('group', ...args);
  },

  /**
   * See [console.groupEnd](https://developer.mozilla.org/en-US/docs/Web/API/Console.groupEnd)
   * @static
   */
  groupEnd: function (...args) {
    return log('groupEnd', ...args);
  },

  /**
   * See [console.assert](https://developer.mozilla.org/en-US/docs/Web/API/Console.assert)
   * @static
   */
  assert: function (...args) {
    return log('assert', ...args);
  },

  /**
   * See [console.log](https://developer.mozilla.org/en-US/docs/Web/API/Console.log)
   * @static
   */
  log: function (...args) {
    return log('log', ...args);
  },

  /**
   * See [console.info](https://developer.mozilla.org/en-US/docs/Web/API/Console.info)
   * @static
   */
  info: function (...args) {
    return log('info', ...args);
  },

  /**
   * See [console.warn](https://developer.mozilla.org/en-US/docs/Web/API/Console.warn)
   * @static
   */
  warn: function (...args) {
    return log('warn', ...args);
  },

  /**
   * See [console.error](https://developer.mozilla.org/en-US/docs/Web/API/Console.error)
   * @static
   */
  error: function (...args) {
    return log('error', ...args);
  }
};

export { Logger as default };
