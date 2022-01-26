# Okta Sign-in Widget Migration guide

This library uses semantic versioning and follows Okta's [library version policy](https://developer.okta.com/code/library-versions/). In short, we don't make breaking changes unless the major version changes!

## Migrating `.widgetrc` to `.widgetrc.js`

The existing `.widgetrc` file used to configure the Widget has been **removed**. Simply rename the existing file to `.widgetrc.js` export the contents:


```diff
- {
-  widgetOptions: {
+ module.exports = {
    baseUrl: 'http://localhost:3000',
    logo: '/img/logo_widgico.png',
    logoText: 'Windico',
    features: {
      router: true,
      rememberMe: true,
    },
    // Host the assets (i.e. json files) locally
    assets: {
      baseUrl: '/'
    }
  };
- }
```

## Migrating from 5.x to 6.x

### Minimum version of `@okta/okta-auth-js` is `6.0.0`

If you are creating an instance of [@okta/okta-auth-js](https://github.com/okta/okta-auth-js) and passing it to the widget using the [authClient](https://github.com/okta/okta-signin-widget#authClient) option, the instance must be version `6.0.0` or higher.

## Migrating from 4.x to 5.x

### `showSignInToGetTokens` no longer redirects

`showSignInToGetTokens` now returns a Promise that resolves to an object containing tokens. This avoids a round-trip redirect to Okta and provides a faster, simpler, and more seamless experience for both developers and end-users. A `redirectUri` must still be configured, but it is no longer necessary to provide any callback logic when using this method. If your application requires a redirect for some reason, such as server-side processing of an authorization code, you should use [showSignInAndRedirect](https://github.com/okta/okta-signin-widget#showsigninandredirect) instead.

### Using `renderEl` and `setCookieAndRedirect` is discouraged for OIDC flows

If a redirect is needed, you should use [showSignInAndRedirect](https://github.com/okta/okta-signin-widget#showsigninandredirect), otherwise use [showSignInToGetTokens](https://github.com/okta/okta-signin-widget#showsignintogettokens) to obtain tokens without a redirect.

### `setCookieAndRedirect` will redirect to the configured `redirectUri` by default

We recommend setting the `clientId` and `redirectUri` options in the config object passed to the widget constructor. We also recommend using the OIDC flow by calling either [showSignInAndRedirect](https://github.com/okta/okta-signin-widget#showsigninandredirect) (if redirect is needed) or [showSignInToGetTokens](https://github.com/okta/okta-signin-widget#showsignintogettokens) if no redirect is required.  If you must call `setCookieAndRedirect`, we strongly recommend calling it with no parameters, to provide better compatibility with new features. It will redirect to the configured `redirectUri`. In developer mode, a warning message will be printed to the console if a URL is passed to this function.

## `hasTokensInUrl` has been removed

The widget no longer contains any logic to handle a redirect callback. If your app needs to handle a redirect callback, we recommend using [@okta/okta-auth-js](https://github.com/okta/okta-auth-js) or one of our other client SDKs:

- [React](https://github.com/okta/okta-react)
- [Angular](https://github.com/okta/okta-angular)
- [Vue](https://github.com/okta/okta-vue)

## `scope` option has been removed

This option has been deprecated with a warning since version 3 and has now been removed. You should use `scopes` (array) instead.

## `display` option no longer determines redirect behavior

If a redirect is needed, use [showSignInAndRedirect](https://github.com/okta/okta-signin-widget#showsigninandredirect), otherwise use [showSignInToGetTokens](https://github.com/okta/okta-signin-widget#showsignintogettokens) to obtain tokens without a redirect.

## Migrating from 3.x to 4.x

### HTTPS is enforced by default

Hosting the widget over the insecure HTTP protocol is not recommended. By default, an error will be thrown if the widget is loaded on a HTTP connection (there is an exception for http://localhost). In order to use HTTP, you must disable PKCE and secure cookies:

```javascript
var signIn = new OktaSignIn(
  {
    baseUrl: 'https://{yourOktaDomain}',
    authParams: {
      pkce: false,
      cookies: {
        secure: false
      }
    }
  }
);
```

### PKCE is `true` by default

For SPA OIDC applications, PKCE flow will now be used by default. Implicit flow can still be used by setting `pkce: false` in the `authParams`:

```javascript
var signIn = new OktaSignIn(
  {
    baseUrl: 'https://{yourOktaDomain}',
    authParams: {
      pkce: false
    }
  }
);
```

The default `responseMode` for PKCE flow is `query`. By default, the authorization code will be returned as a query parameter, not a hash fragment. The code can be returned in a fragment by setting `responseMode` to `fragment`:

```javascript
var signIn = new OktaSignIn(
  {
    baseUrl: 'https://{yourOktaDomain}',
    authParams: {
      responseMode: 'fragment'
    }
  }
);
```

### showSignInToGetTokens() options changed

See [showSignInToGetTokens](README.md#showsignintogettokens) for updated documentation on this method.

- getAccessToken is now `true` by default
- `authorizationServerId` option has been removed from To specificy a custom authorization server, use `authParams.issuer`. The issuer should be specified as a full URI, not just the server ID.

### @okta/okta-auth-js has been upgraded to version 3.0.0

See the [okta-auth-js CHANGELOG](https://github.com/okta/okta-auth-js/blob/master/CHANGELOG.md#300) for details on all the changes.

- [authClient.token.parseFromUrl()](https://github.com/okta/okta-auth-js#tokenparsefromurloptions) now returns tokens in an object hash, not an array.

### Other changes

- `authParams.grantType` has been removed

## Migrating From 2.x to 3.x

### Consolidated CSS Files

In version 2.x there were two CSS files to import, `okta-sign-in.min.css` and `okta-theme.css`. In version 3.x, there is a single file named `okta-sign-in.min.css`.

- If you were using CDN links for the CSS, you will need to update the version path for `okta-sign-in.min.css` and remove the `okta-theme.css` link.

Version 2.x configuration:
```html
<link
  href="https://ok1static.oktacdn.com/assets/js/sdk/okta-signin-widget/2.14.0/css/okta-sign-in.min.css"
  type="text/css"
  rel="stylesheet"/>
<link
  href="https://ok1static.oktacdn.com/assets/js/sdk/okta-signin-widget/2.14.0/css/okta-theme.css"
  type="text/css"
  rel="stylesheet"/>
```
Version 3.x configuration:
```html
  <link
  href="https://ok1static.oktacdn.com/assets/js/sdk/okta-signin-widget/3.0.0/css/okta-sign-in.min.css"
  type="text/css"
  rel="stylesheet"/>
```

- If you were building your CSS files through `sass`, you will need to build them again.  The build will produce a single `okta-sign-in.min.css` instead of the previous two files.

### Renamed Functions

`tokenManager.refresh` has been renamed to `tokenManager.renew`, so you should update it in your code.

### Token Retrieval Is Now Asynchronous

Starting in version 3.0, `tokenManager.get` is an asynchronous function. It returns an object you can handle as a promise:

```javascript
// ES2016+
const accessToken = await signIn.tokenManager.get('accessToken');

// Handle as a promise
signIn.tokenManager.get('accessToken')
.then(function(accessToken) {
  console.log(accessToken);
});
```

### New `afterError` Events

We've replaced the global error handler for `OAUTH_ERROR` and `REGISTRATION_FAILED` in favor of `afterError` events. For these two types of errors, instead of passing a `error` handler to `signIn.renderEl`, you should add a listener on `afterError` to your application and act accordingly.

Example:
```javascript
signIn.on('afterError', function (context, error) {
  console.log(context.controller);
  // primary-auth

  console.log(error.name);
  // OAUTH_ERROR

  console.log(error.message);
  // Invalid value for client_id parameter.
});
```


## Getting Help

If you have questions about this library or about the Okta APIs, post a question on our [Developer Forum](https://devforum.okta.com).

If you find a bug or have a feature request for this library specifically, [post an issue](https://github.com/okta/okta-signin-widget/issues) here on GitHub.
