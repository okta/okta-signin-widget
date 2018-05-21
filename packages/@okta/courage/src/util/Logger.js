define(function () {

  function log(level, args) {
    if (window.console && window.okta && window.okta.debug) {
      window.console[level].apply(window.console, args);
    }
  }

  /**
   * Utility library of logging functions.
   * @class module:Okta.Logger
   */
  return /** @lends module:Okta.Logger */ {

    /**
     * See [console.trace](https://developer.mozilla.org/en-US/docs/Web/API/Console.trace)
     * @static
     */
    trace: function () {
      return log('trace', arguments);
    },
    /**
     * See [console.dir](https://developer.mozilla.org/en-US/docs/Web/API/Console.dir)
     * @static
     */
    dir: function () {
      return log('dir', arguments);
    },
    /**
     * See [console.time](https://developer.mozilla.org/en-US/docs/Web/API/Console.time)
     * @static
     */
    time: function () {
      return log('time', arguments);
    },
    /**
     * See [console.timeEnd](https://developer.mozilla.org/en-US/docs/Web/API/Console.timeEnd)
     * @static
     */
    timeEnd: function () {
      return log('timeEnd', arguments);
    },
    /**
     * See [console.group](https://developer.mozilla.org/en-US/docs/Web/API/Console.group)
     * @static
     */
    group: function () {
      return log('group', arguments);
    },
    /**
     * See [console.groupEnd](https://developer.mozilla.org/en-US/docs/Web/API/Console.groupEnd)
     * @static
     */
    groupEnd: function () {
      return log('groupEnd', arguments);
    },
    /**
     * See [console.assert](https://developer.mozilla.org/en-US/docs/Web/API/Console.assert)
     * @static
     */
    assert: function () {
      return log('assert', arguments);
    },
    /**
     * See [console.log](https://developer.mozilla.org/en-US/docs/Web/API/Console.log)
     * @static
     */
    log: function () {
      return log('log', arguments);
    },
    /**
     * See [console.info](https://developer.mozilla.org/en-US/docs/Web/API/Console.info)
     * @static
     */
    info: function () {
      return log('info', arguments);
    },
    /**
     * See [console.warn](https://developer.mozilla.org/en-US/docs/Web/API/Console.warn)
     * @static
     */
    warn: function () {
      return log('warn', arguments);
    },
    /**
     * See [console.error](https://developer.mozilla.org/en-US/docs/Web/API/Console.error)
     * @static
     */
    error: function () {
      return log('error', arguments);
    }
  };
});
