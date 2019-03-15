# Okta Signin Widget migration guide

This library uses semantic versioning and follows Okta's [library version policy](https://developer.okta.com/code/library-versions/). In short, we don't make breaking changes unless the major version changes!

## Migrating from 2.x to 3.x

### Consolidated css files to single one

In version 2.x we had two separate css files to import: `okta-sign-in.min.css` and `okta-theme.css`. We moved to have one single css file which is still called `okta-sign-in.min.css`.

Depending on your configuration, this is what you should change:

- If you were using CDN links for the css, you will need to change the `okta-sign-in.min.css` link and remove the `okta-theme.css` link.

Example:
```html
<!-- BEFORE -->
<link
  href="https://ok1static.oktacdn.com/assets/js/sdk/okta-signin-widget/2.14.0/css/okta-sign-in.min.css"
  type="text/css"
  rel="stylesheet"/>
<link
  href="https://ok1static.oktacdn.com/assets/js/sdk/okta-signin-widget/2.14.0/css/okta-theme.css"
  type="text/css"
  rel="stylesheet"/>

<!-- AFTER -->
  <link
  href="https://ok1static.oktacdn.com/assets/js/sdk/okta-signin-widget/3.0.0/css/okta-sign-in.min.css"
  type="text/css"
  rel="stylesheet"/>
```

- If you were building your css files through `sass`, you will need to build it again and this time it will generate only `okta-sign-in.min.css` instead of the two files.

### Renamed functions

`tokenManager.refresh` has been renamed to `tokenManager.renew`, so you should update it in your code.

### Token retrieval is now asyncronous to account for automatic token renewal

`signIn.tokenManager.get('accessToken')` moved to be synchronous in 2.x to asynchronous in 3.x

You should change your code to handle the `signIn.tokenManager.get('accessToken')` function as a promise:

```javascript
// ES2016+
const accessToken = await signIn.tokenManager.get('accessToken');

// Handle as a promise
signIn.tokenManager.get('accessToken')
.then(function(accessToken) {
  console.log(accessToken);
});
```

### Moved dependencies to devDependency

This should probably not affect your project, but we moved `okta-auth-js` and `backbone` from `dependecies` to `devDependency`.

### New afterError events

We replaced the global error handler for `OAUTH_ERROR` and `REGISTRATION_FAILED` in favor of `afterError` events. So, for these 2 types of errors, instead of passing a `error` handler to `signIn.renderEl`, you should add a listener on `afterError` to your application and act accordingly.

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


## Getting help

If you have questions about this library or about the Okta APIs, post a question on our [Developer Forum](https://devforum.okta.com).

If you find a bug or have a feature request for this library specifically, [post an issue](https://github.com/okta/okta-signin-widget/issues) here on GitHub.
