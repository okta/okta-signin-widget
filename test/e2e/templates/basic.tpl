{{#> cdnLayout}}
var options = {
  'baseUrl': '{{{WIDGET_TEST_SERVER}}}'
};
var oktaSignIn = new OktaSignIn(options);
oktaSignIn.on('afterError', function (context, error) {
  var errorBox = document.getElementsByClassName('okta-form-infobox-error infobox infobox-error')[0];
  // Update text in errorBox
  errorBox.children[1].innerText = 'Custom Error!';
});

oktaSignIn.renderEl(
  { el: '#okta-login-container' },
  function (res) {
    if (res.status === 'SUCCESS') {
      res.session.setCookieAndRedirect(options.baseUrl + '/app/UserHome');
    }
  }
);
{{/cdnLayout}}
