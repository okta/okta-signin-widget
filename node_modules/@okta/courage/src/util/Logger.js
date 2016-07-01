define(function () {

  function log(level, args) {
    if (window.console) {
      window.console[level].apply(window.console, args);
    }
  }

  /**
   * @class Okta.Logger
   * See [window.console](https://developer.mozilla.org/en-US/docs/Web/API/Console)
   */
  return {
    /**
     * @static
     * See: [console.trace](https://developer.mozilla.org/en-US/docs/Web/API/Console.trace)
     */
    trace: function () {
      return log('trace', arguments);
    },
    /**
     * @static
     * See: [console.dir](https://developer.mozilla.org/en-US/docs/Web/API/Console.dir)
     */
    dir: function () {
      return log('dir', arguments);
    },
    /**
     * @static
     * See: [console.time](https://developer.mozilla.org/en-US/docs/Web/API/Console.time)
     */
    time: function () {
      return log('time', arguments);
    },
    /**
     * @static
     * See: [console.timeEnd](https://developer.mozilla.org/en-US/docs/Web/API/Console.timeEnd)
     */
    timeEnd: function () {
      return log('timeEnd', arguments);
    },
    /**
     * @static
     * See: [console.group](https://developer.mozilla.org/en-US/docs/Web/API/Console.group)
     */
    group: function () {
      return log('group', arguments);
    },
    /**
     * @static
     * See: [console.groupEnd](https://developer.mozilla.org/en-US/docs/Web/API/Console.groupEnd)
     */
    groupEnd: function () {
      return log('groupEnd', arguments);
    },
    /**
     * @static
     * See: [console.assert](https://developer.mozilla.org/en-US/docs/Web/API/Console.assert)
     */
    assert: function () {
      return log('assert', arguments);
    },
    /**
     * @static
     * See: [console.log](https://developer.mozilla.org/en-US/docs/Web/API/Console.log)
     */
    log: function () {
      return log('log', arguments);
    },
    /**
     * @static
     * See: [console.info](https://developer.mozilla.org/en-US/docs/Web/API/Console.info)
     */
    info: function () {
      return log('info', arguments);
    },
    /**
     * @static
     * See: [console.warn](https://developer.mozilla.org/en-US/docs/Web/API/Console.warn)
     */
    warn: function () {
      return log('warn', arguments);
    },
    /**
     * @static
     * See: [console.error](https://developer.mozilla.org/en-US/docs/Web/API/Console.error)
     */
    error: function () {
      return log('error', arguments);
    }
  };
});