# Using the Polyfill

The standard bundle (`okta-sign-in.min.js`) includes a polyfill to ensure compatibility with older browsers such as IE11. If you are using one of the other bundles which do not include a polyfill - and need to support IE11 - you may want to include the standalone polyfill.

## CDN

To embed the Sign-in Widget via CDN, include links to the JS and CSS files in your HTML. The polyfill should be loaded before the widget bundle:


```html
<!-- Polyfill for older browsers -->
<script src="https://global.oktacdn.com/okta-signin-widget/7.52.0/js/okta-sign-in.polyfill.min.js" type="text/javascript" integrity="sha384-UI0D+EDuaLFPjdax69bqxVYOm8jEi3FICnQ81NhZMn14cu6U3ctJ35ntsJoD3iUC" crossorigin="anonymous"></script>

<!-- Widget bundle for Okta Identity Engine -->
<script src="https://global.oktacdn.com/okta-signin-widget/7.52.0/js/okta-sign-in.oie.min.js" type="text/javascript" integrity="sha384-LAYvWHYz3nJjd7Jn3LaIZ/M8lOk5ZAVAI2GZ33Pqmp8vPpplhFKiqdfHBSEun4Q+" crossorigin="anonymous"></script>

<!-- CSS for widget -->
<link href="https://global.oktacdn.com/okta-signin-widget/7.52.0/css/okta-sign-in.min.css" type="text/css" rel="stylesheet" integrity="sha384-MiIWRCxXm4SYy0hqJDdezdeC68cHi05+ilre0TKKkJi/TVjKVFyYJxYRxRHiJi7z" crossorigin="anonymous" />
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
