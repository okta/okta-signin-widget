const karma = window.__karma__;
const testsContext = require.context('./spec/visual', true, /.*_spec\.js$/);

testsContext.keys().forEach(key => {
  // Filtered List
  if (karma.config.test && !key.includes(karma.config.test)) {
    return;
  }
  testsContext(key);
});
