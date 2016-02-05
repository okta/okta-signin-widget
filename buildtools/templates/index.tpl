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
    var oktaSignIn = new OktaSignIn(options);

    oktaSignIn.renderEl(
      { el: '#okta-login-container' },
      function (res) {
        if (res.status === 'SUCCESS') {
          res.session.setCookieAndRedirect(options.baseUrl + '/app/UserHome');
        }
      }
    );
  </script>
</body>

</html>
