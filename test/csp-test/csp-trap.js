(function iife() { 
  window.globalCSPTrap = globalCSPTrap = [];
  console.log('adding trap');
  document.addEventListener("securitypolicyviolation", (e) => {
    globalCSPTrap.push(e);
    console.log('adding to trap');
    console.log(e.blockedURI);
    console.log(e.violatedDirective);
    console.log(e.originalPolicy);
  });
})();

