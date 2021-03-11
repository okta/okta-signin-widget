import './karma/karma-enforce-precompile';

const karma = window.__karma__;
const testsContext = require.context('./spec/', true, /.*_spec\.js$/);

testsContext.keys().forEach(key => {
  // Filtered List
  if (karma.config.test && !key.includes(karma.config.test)) {
    return;
  }
  testsContext(key);
});

window.globalCSPTrap = globalCSPTrap = [];
document.addEventListener("securitypolicyviolation", (e) => {
  // globalCSPTrap.push('dang');
  globalCSPTrap.push(e);
  console.log(e.blockedURI);
  console.log(e.violatedDirective);
  console.log(e.originalPolicy);
});
