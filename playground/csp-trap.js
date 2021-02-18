(function iife() { 
  window.globalCSPTrap = globalCSPTrap = [];
  document.addEventListener("securitypolicyviolation", (e) => {
    globalCSPTrap.push('dang');
    // globalCSPTrap.push(e);
    // console.log(e.blockedURI);
    // console.log(e.violatedDirective);
    // console.log(e.originalPolicy);
  });
})();
