<!DOCTYPE html>
<html>
<!-- {{GENERATES}} -->
<head>
  <title>Okta Sign-in Widget</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="css/okta-sign-in.css" type="text/css" rel="stylesheet"/>
  <script type="text/javascript">
    {{#> pre-widget-script-block}}
      {{!-- code to run before widget is loaded goes here --}}
    {{/pre-widget-script-block}}
  </script>
  <script src="js/okta-sign-in.min.js"></script>
  <script src="js/okta-auth-js.min.js"></script>
</head>

<body>
  <div id="okta-login-container"></div>
  <script type="text/javascript">
    {{> @partial-block }}
  </script>

  {{#> body-block}}
    {{!-- body content goes here. --}}
  {{/body-block}}

</body>

</html>
