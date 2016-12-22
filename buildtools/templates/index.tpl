<!DOCTYPE html>
<html>

<head>
  <title>Okta Sign-in Widget</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="css/okta-sign-in.css" type="text/css" rel="stylesheet"/>
  <link href="css/okta-theme.css" type="text/css" rel="stylesheet"/>
</head>

<body>
  <div id="okta-login-container"></div>

  <script src="js/okta-sign-in.js"></script>
  <script type="text/javascript">
    var options = {{{options}}};
    var signIn = new OktaSignIn(options);

    signIn.renderEl(
      { el: '#okta-login-container' },

      function success(res) {
        // Password recovery flow
        if (res.status === 'FORGOT_PASSWORD_EMAIL_SENT') {
          alert('SUCCESS: Forgot password email sent');
          return;
        }

        // Unlock account flow
        if (res.status === 'UNLOCK_ACCOUNT_EMAIL_SENT') {
          alert('SUCCESS: Unlock account email sent');
          return;
        }

        // User has completed authentication (res.status === 'SUCCESS')

        // 1. Widget is not configured for OIDC, and returns a sessionToken
        //    that needs to be exchanged for an okta session
        if (res.session) {
          console.log(res.user);
          res.session.setCookieAndRedirect(options.baseUrl + '/app/UserHome');
          return;
        }

        // 2. Widget is configured for OIDC, and returns tokens. This can be
        //    an array of tokens or a single token, depending on the
        //    initial configuration.
        else if (Array.isArray(res)) {
          console.log(res);
          alert('SUCCESS: OIDC with multiple responseTypes. Check console.');
        }
        else {
          console.log(res);
          alert('SUCCESS: OIDC with single responseType. Check Console');
        }
      },

      function error(err) {
        alert('ERROR: ' + err);
      }
    );
  </script>
</body>

</html>
