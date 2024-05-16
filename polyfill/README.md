# Using the Polyfill

The standard bundle (`okta-sign-in.min.js`) includes a polyfill to ensure compatibility with older browsers such as IE11. If you are using one of the other bundles which do not include a polyfill - and need to support IE11 - you may want to include the standalone polyfill.

## CDN

To embed the Sign-in Widget via CDN, include links to the JS and CSS files in your HTML. The polyfill should be loaded before the widget bundle:


```html
<!-- Polyfill for older browsers -->
<script src="https://global.oktacdn.com/okta-signin-widget/7.18.1/js/okta-sign-in.polyfill.min.js" type="text/javascript" integrity="sha384-QzQIGwIndxyBdHRQOwgjmQJLod6LRMchZyYg7RUq8FUECvPvreqauQhkU2FF9EGD" crossorigin="anonymous"></script>

<!-- Widget bundle for Okta Identity Engine -->
<script src="https://global.oktacdn.com/okta-signin-widget/7.18.1/js/okta-sign-in.oie.min.js" type="text/javascript" integrity="sha384-NKlwRHnejn/66l/tFMZB8D5Y+Mh5CKNOnoe3/Yelhon8Ax+o1iBY5FIJhLS+GUUU" crossorigin="anonymous"></script>

<!-- CSS for widget -->
<link href="https://global.oktacdn.com/okta-signin-widget/7.18.1/css/okta-sign-in.min.css" type="text/css" rel="stylesheet" integrity="sha384-FL6VsXYuwuq1Zo5lnWVgcOMWSo1JuvDue2bQ66/TdWOTwPEU9OgvF4Ks8fNnaiHd" crossorigin="anonymous" />
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
