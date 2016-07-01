define(function () {

  function noop() {}

  return {
    trace: noop,
    dir: noop,
    time: noop,
    timeEnd: noop,
    group: noop,
    groupEnd: noop,
    assert: noop,
    log: noop,
    info: noop,
    warn: noop,
    error: noop
  };

});
