setTimeout(function() {
  var config = {
    el: '#okta-login-container',
    baseUrl: 'http://localhost:3000',
  
    // OIE config
    stateToken: 'abc',
  
    // https://github.com/okta/okta-signin-widget#logo
    logo: '/img/widgico.png',
  
    // https://github.com/okta/okta-signin-widget#logotext
    logoText: 'widgico',
  
    // Classic config
    // stateToken: '00abc',
    // useClassicEngine: true,
    // features: {
    //   router: false
    // }
  };
  var signIn = new window.OktaSignIn(config);
  signIn.renderEl(config);  
}, 1000);

