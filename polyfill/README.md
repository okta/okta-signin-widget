# Using the Polyfill

The standard bundle (`okta-sign-in.min.js`) includes a polyfill to ensure compatibility with older browsers such as IE11. If you are using one of the other bundles which do not include a polyfill - and need to support IE11 - you may want to include the standalone polyfill.

## CDN

To embed the Sign-in Widget via CDN, include links to the JS and CSS files in your HTML. The polyfill should be loaded before the widget bundle:


```html
<!-- Polyfill for older browsers -->
<script src="https://global.oktacdn.com/okta-signin-widget/7.17.1/js/okta-sign-in.polyfill.min.js" type="text/javascript" integrity="sha384-wJqq26Mh3D881mQ2Y8EyhHmQU2ovR3nf5+uV3atTdOwBtHelrBRHOmuk5OdgckqW" crossorigin="anonymous"></script>

<!-- Widget bundle for Okta Identity Engine -->
<script src="https://global.oktacdn.com/okta-signin-widget/7.17.1/js/okta-sign-in.oie.min.js" type="text/javascript" integrity="sha384-Qx25hpdEqMezj+YmiMfpjUq4YtvRDF7T2wiPNGFRT9bm26Ij1oliu9Rghf4vO2qb" crossorigin="anonymous"></script>

<!-- CSS for widget -->
<link href="https://global.oktacdn.com/okta-signin-widget/7.17.1/css/okta-sign-in.min.css" type="text/css" rel="stylesheet" integrity="sha384-YtU89lM0fecOULmzvCevpy8Mwpfa2V1C9JG+K57ceTle0dj6yZKAQ/t6ZEmGlK7c" crossorigin="anonymous" />
```

**NOTE:** The CDN URLs contain a version number. This number should be the same for both the Javascript and the CSS file and match a version on the [releases page](https://github.com/okta/okta-signin-widget/releases). We recommend using the latest widget version.

## NPM

To include the standalone polyfill in your app's bundle:

CommonJS
```
require('@okta/okta-signin-widget/polyfill);
```

or

ESM
```
import '@okta/okta-signin-widget/polyfill'
```

**NOTE:** including the polyfill may cause *side effects*
