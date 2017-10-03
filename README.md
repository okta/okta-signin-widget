<!-- START GITHUB ONLY -->
[![Build Status](https://travis-ci.org/okta/okta-signin-widget.svg?branch=master)](https://travis-ci.org/okta/okta-signin-widget)
<!-- END GITHUB ONLY -->

Okta Sign-In Widget
===================

The Okta Sign-In Widget is a Javascript widget that provides a fully featured and customizable login experience which can be used to authenticate users on any website.

<!-- START GITHUB ONLY -->
For a high level overview of the widget's features and authentication flows, check out [our developer docs](http://developer.okta.com/code/javascript/okta_sign-in_widget.html).

Contributors should read our [contributing guidelines](./CONTRIBUTING.md) if they wish to contribute.

# Table of Contents

* [Install](#install)
  * [Using the Okta CDN](#using-the-okta-cdn)
  * [Using the npm module](#using-the-npm-module)
* [API](#api)
  * [OktaSignIn](#new-oktasigninconfig)
  * [renderEl](#rendereloptions-success-error)
  * [hide](#hide)
  * [show](#show)
  * [remove](#remove)
  * [on](#onevent-callback-context)
  * [off](#offevent-callback)
  * [session.get](#sessiongetcallback)
  * [session.refresh](#sessionrefreshcallback)
  * [session.close](#sessionclosecallback)
  * [token.hasTokensInUrl](#oidc-tokenhastokensinurl)
  * [token.parseTokensFromUrl](#oidc-tokenparsetokensfromurlsuccess-error)
  * [tokenManager.add](#oidc-tokenmanageraddkey-token)
  * [tokenManager.get](#oidc-tokenmanagergetkey)
  * [tokenManager.remove](#oidc-tokenmanagerremovekey)
  * [tokenManager.clear](#oidc-tokenmanagerclear)
  * [tokenManager.refresh](#oidc-tokenmanagerrefreshkey)
  * [tokenManager.on](#oidc-tokenmanageronevent-callback-context)
  * [tokenManager.off](#oidc-tokenmanageroffevent-callback)
* [Configuration](#configuration)
  * [Basic config options](#basic-config-options)
  * [Username and password](#username-and-password)
  * [Language and text](#language-and-text)
  * [Links](#links)
  * [Buttons](#buttons)
  * [OpenId Connect](#openid-connect)
  * [Bootstrapping from a recovery token](#bootstrapping-from-a-recovery-token)
  * [Feature flags](#feature-flags)
* [Events](#events)
* [Developing the Sign-In Widget](#developing-the-sign-in-widget)
  * [Building the widget](#building-the-widget)
  * [The .widgetrc config file](#the-widgetrc-config-file)
  * [Build and test commands](#build-and-test-commands)
<!-- END GITHUB ONLY -->

# Install

You can include the Sign-In Widget in your project either directly from the Okta CDN, or by packaging it with your app via our npm package, [@okta/okta-signin-widget](https://www.npmjs.com/package/@okta/okta-signin-widget).

## Using the Okta CDN

Loading our assets directly from the CDN is a good choice if you want an easy way to get started with the widget, and don't already have an existing build process that leverages [npm](https://www.npmjs.com/) for external dependencies.

To use the CDN, include links to the JS and CSS files in your HTML:

```html
<!-- Latest CDN production Javascript and CSS: 1.11.0 -->
<script
  src="https://ok1static.oktacdn.com/assets/js/sdk/okta-signin-widget/1.11.0/js/okta-sign-in.min.js"
  type="text/javascript"></script>
<link
  href="https://ok1static.oktacdn.com/assets/js/sdk/okta-signin-widget/1.11.0/css/okta-sign-in.min.css"
  type="text/css"
  rel="stylesheet"/>

<!-- Theme file: Customize or replace this file if you want to override our default styles -->
<link
  href="https://ok1static.oktacdn.com/assets/js/sdk/okta-signin-widget/1.11.0/css/okta-theme.css"
  type="text/css"
  rel="stylesheet"/>
```

The `okta-sign-in.min.js` file will expose a global `OktaSignIn` object which can be used to bootstrap the widget:

```javascript
var signIn = new OktaSignIn({/* configOptions */});
```

## Using the npm module

Using our npm module is a good choice if:
- You have a build system in place where you manage dependencies with npm
- You do not want to load scripts directly from third party sites

To install [@okta/okta-signin-widget](https://www.npmjs.com/package/@okta/okta-signin-widget):

```bash
# Run this command in your project root folder.
[project-root-folder]$ npm install @okta/okta-signin-widget --save
```

The widget source files and assets will be installed to `node_modules/@okta/okta-signin-widget/dist`, and will have this directory structure:

```bash
node_modules/@okta/okta-signin-widget/dist/
  css/
    # Main CSS file for widget styles. Try not to override the classes in this
    # file when creating a custom theme - the classes/elements are subject to
    # change between releases
    okta-sign-in.min.css

    # Example theme that you can use as a template to create your own custom theme
    okta-theme.css

  # Base font and image files that are used in rendering the widget
  font/
  img/

  js/
    # CDN JS file that exports the OktaSignIn object in UMD format. This is
    # packaged with everything needed to run the widget, including third party
    # vendor files.
    okta-sign-in.min.js

    # Main entry file that is used in the npm require(@okta/okta-signin-widget)
    # flow. This does not package third party dependencies - these are pulled
    # down through `npm install` (which allows you to use your own version of
    # jquery, etc).
    okta-sign-in.entry.js

  # Localized strings that are used to display all text and labels in the
  # widget. Three output formats are included - json, jsonp, and properties
  labels/

  # Sass files that are used to generate the widget css. If you are already
  # using Sass in your project, you can include these helper files to make
  # generating your custom theme easier
  sass/
```

After running `npm install`:

1. Copy the assets to a folder that will be distributed to your publicly hosted site. The folders you'll need to copy are `css`, `font`, `img`, `js` and `labels`.

2. Instead of copying `js` and including it in your page as a global, you can require the Sign-In Widget in your build if you are using [Webpack](https://webpack.github.io/), [Browserify](http://browserify.org/) or another module bundling system that understands the `node_modules` format.

    ```javascript
    // Load the Sign-In Widget module
    var OktaSignIn = require('@okta/okta-signin-widget');

    // Use OktaSignIn
    var signIn = new OktaSignIn(/* configOptions */);
    ```
    **Note:** If you use [Browserify](http://browserify.org/) to bundle your app, you'll need to use the `--noparse` option:
    ```
    browserify main.js \
    --noparse=$PWD/node_modules/@okta/okta-signin-widget/dist/js-okta-sign-in.entry.js \
    --outfile=bundle.js
    ```

# API

## new OktaSignIn(config)

Creates a new instance of the Sign-In Widget with the provided options. The widget has many [config options](#configuration). The only required option to get started is `baseUrl`, the base url for your Okta domain.

- `config` - Options that are used to configure the widget

```javascript
var signIn = new OktaSignIn({baseUrl: 'https://acme.okta.com'});
```

## renderEl(options, success, error)

Renders the widget to the DOM, and passes control back to your app through the success and error callback functions when the user has entered a success or error state.

- `options`
  - `el` - CSS selector which identifies the container element that the widget attaches to.
- `success` - Function that is called when the user has completed an authentication flow.
- `error` - Function that is called when the widget has been initialized with invalid config options, or has entered a state it cannot recover from.

```javascript
signIn.renderEl(
  // Assumes there is an empty element on the page with an id of 'osw-container'
  {el: '#osw-container'},

  function success(res) {
    // The properties in the response object depend on two factors:
    // 1. The type of authentication flow that has just completed, determined by res.status
    // 2. What type of token the widget is returning

    // The user has started the password recovery flow, and is on the confirmation
    // screen letting them know that an email is on the way.
    if (res.status === 'FORGOT_PASSWORD_EMAIL_SENT') {
      // Any followup action you want to take
      return;
    }

    // The user has started the unlock account flow, and is on the confirmation
    // screen letting them know that an email is on the way.
    if (res.status === 'UNLOCK_ACCOUNT_EMAIL_SENT') {
      // Any followup action you want to take
      return;
    }

    // The user has successfully completed the authentication flow
    if (res.status === 'SUCCESS') {

      // Handle success when the widget is not configured for OIDC

      if (res.type === 'SESSION_STEP_UP') {
        // Session step up response
        // If the widget is not configured for OIDC and the authentication type is SESSION_STEP_UP,
        // the response will contain user metadata and a stepUp object with the url of the resource
        // and a 'finish' function to navigate to that url
        console.log(res.user);
        console.log('Target resource url: ' + res.stepUp.url);
        res.stepUp.finish();
        return;
      } else {
        // If the widget is not configured for OIDC, the response will contain
        // user metadata and a sessionToken that can be converted to an Okta
        // session cookie:
        console.log(res.user);
        res.session.setCookieAndRedirect('https://acme.com/app');
        return;
      }


      // OIDC response

      // If the widget is configured for OIDC with a single responseType, the
      // response will be the token.
      // i.e. authParams.responseType = 'id_token':
      console.log(res.claims);
      signIn.tokenManager.add('my_id_token', res);

      // If the widget is configured for OIDC with multiple responseTypes, the
      // response will be an array of tokens:
      // i.e. authParams.responseType = ['id_token', 'token']
      signIn.tokenManager.add('my_id_token', res[0]);
      signIn.tokenManager.add('my_access_token', res[1]);

      return;
    }

  },

  function error(err) {
    // The widget will handle most types of errors - for example, if the user
    // enters an invalid password or there are issues authenticating.
    //
    // This function is invoked with errors the widget cannot recover from:
    // 1. Known errors: CONFIG_ERROR, UNSUPPORTED_BROWSER_ERROR, OAUTH_ERROR
    // 2. Uncaught exceptions
  }
);
```

## hide

Hide the widget, but keep the widget in the DOM.

```javascript
signIn.hide();
```

## show

Show the widget if hidden.

```javascript
signIn.show();
```

## remove

Remove the widget from the DOM entirely.

```javascript
signIn.remove();
```

## on(event, callback[, context])

Subscribe to an event published by the widget.

- `event` - [Event](#events) to subscribe to
- `callback` - Function to call when the event is triggered
- `context` - Optional context to bind the callback to

```javascript
signIn.on('pageRendered', function (data) {
  console.log(data);
});
```

## off([event, callback])

Unsubscribe from widget events. If no callback is provided, unsubscribes all listeners from the event.

- `event` - Optional event to unsubscribe from
- `callback` - Optional callback that was used to subscribe to the event

```javascript
// Unsubscribe all listeners from all events
signIn.off();

// Unsubscribe all listeners that have been registered to the 'pageRendered' event
signIn.off('pageRendered');

// Unsubscribe the onPageRendered listener from the 'pageRendered' event
signIn.off('pageRendered', onPageRendered);
```

## session.get(callback)

Gets the active session, or returns `{status:inactive}` on error or no active session.

- `callback` - Function that is called with the session once the request has completed.

```javascript
signIn.session.get(function (res) {
  // Session exists, show logged in state.
  if (res.status === 'ACTIVE') {
    // showApp()
  }
  // No session, or error retrieving the session. Render the Sign-In Widget.
  else if (res.status === 'INACTIVE') {
    signIn.renderEl(
      {el: '#osw-container'},
      function success(res) {
        // showApp() if res.status === 'SUCCESS'
      },
      function error(err) {
        // handleError(err)
      }
    );
  }
});
```

## session.refresh(callback)

Refresh the current session by extending its lifetime. This can be used as a keep-alive operation.

- `callback` - Function that is called after the refresh request has completed.

```javascript
signIn.session.refresh(function (res) {
  if (res.status === 'ACTIVE') {
    // The session now has an extended lifetime
  }
  else if (res.status === 'INACTIVE') {
    // There is no current session, render the Sign-In Widget
  }
});
```

## session.close(callback)

Signs the user out of their current Okta session.

- `callback` - Function that is called once the session has been closed. If there is an error, it will be passed to the callback function.

```javascript
signIn.session.close(function (err) {
  if (err) {
    // The user has not been logged out, perform some error handling here.
    return;
  }
  // The user is now logged out. Render the Sign-In Widget.
});
```

## `OIDC` token.hasTokensInUrl()

Synchronous method to check for access or ID Tokens in the url. This is used when `authParams.display = 'page'`. Returns `true` if there are tokens, and `false` if the redirect flow has not taken place yet.

```javascript
// For an extended example, look at token.parseTokensFromUrl
if (signIn.token.hasTokensInUrl()) {
  // The user has just successfully completed a redirect
}
else {
  // There are no tokens in the URL, render the Sign-In Widget.
}
```

## `OIDC` token.parseTokensFromUrl(success, error)

Parses the access or ID Tokens from the url after a successful authentication redirect. This is used when `authParams.display = 'page'`.

- `success` - Function that is called after the tokens have been parsed and validated
- `error` - Function that is called if an error occurs while trying to parse or validate the tokens

```javascript
var signIn = new OktaSignIn({
  baseUrl: 'https://acme.okta.com',
  clientId: '{{myClientId}}',
  redirectUri: '{{redirectUri configured in OIDC app}}',
  authParams: {
    responseType: 'id_token',
    // `display: page` will initiate the OAuth2 page redirect flow
    display: 'page'
  },
  idps: [
    {
      type: 'FACEBOOK',
      id: '{{facebook appId}}'
    }
  ]
});

// The user has just landed on our login form, and has not yet authenticated
// with a Social Auth IDP.
if (!signIn.token.hasTokensInUrl()) {
  signIn.renderEl({el: '#osw-container'});
}

// The user has redirected back after authenticating and has their access or
// ID Token in the URL.
else {
  signIn.token.parseTokensFromUrl(
    function success(res) {
      signIn.tokenManager.add('my_id_token', res);
    },
    function error(err) {
      // handleError(err);
    }
  );
}
```

## `OIDC` tokenManager.add(key, token)

After receiving an `access_token` or `id_token`, add it to the `tokenManager` to manage token expiration and refresh operations. When a token is added to the `tokenManager`, it is automatically refreshed when it expires.

- `key` - Unique key to store the token in the `tokenManager`. This is used later when you want to get, delete, or refresh the token.
- `token` - Token object that will be added

```javascript
// Example showing a success callback when authParams.responseType = 'id_token'
signIn.renderEl({el: '#osw-container'}, function (res) {
  if (res.status !== 'SUCCESS') {
    return;
  }

  // When specifying authParams.responseType as 'id_token' or 'token', the
  // response is the token itself
  signIn.tokenManager.add('my_id_token', res);
});

```

## `OIDC` tokenManager.get(key)

Get a token that you have previously added to the `tokenManager` with the given `key`.

- `key` - Key for the token you want to get

```javascript
var token = signIn.tokenManager.get('my_id_token');
```

## `OIDC` tokenManager.remove(key)

Remove a token from the `tokenManager` with the given `key`.

- `key` - Key for the token you want to remove

```javascript
signIn.tokenManager.remove('my_id_token');
```

## `OIDC` tokenManager.clear()

Remove all tokens from the `tokenManager`.

```javascript
signIn.tokenManager.clear();
```

## `OIDC` tokenManager.refresh(key)

Manually refresh a token before it expires.

- `key` - Key for the token you want to refresh

```javascript
// Because the refresh() method is async, you can wait for it to complete
// by using the returned Promise:
signIn.tokenManager.refresh('my_id_token')
.then(function (newToken) {
  // doSomethingWith(newToken);
});

// Alternatively, you can subscribe to the 'refreshed' event:
signIn.tokenManager.on('refreshed', function (key, newToken, oldToken) {
  // doSomethingWith(newToken);
});
signIn.tokenManager.refresh('my_id_token');
```

## `OIDC` tokenManager.on(event, callback[, context])

Subscribe to an event published by the `tokenManager`.

- `event` - Event to subscribe to. Possible events are `expired`, `error`, and `refreshed`.
- `callback` - Function to call when the event is triggered
- `context` - Optional context to bind the callback to

```javascript

signIn.tokenManager.on('expired', function (key, expiredToken) {
  console.log('Token with key', key, ' has expired:');
  console.log(expiredToken);
});

signIn.tokenManager.on('error', function (err) {
  console.log('TokenManager error:', err);
});

signIn.tokenManager.on('refreshed', function (key, newToken, oldToken) {
  console.log('Token with key', key, 'has been refreshed');
  console.log('Old token:', oldToken);
  console.log('New token:', newToken);
});
```

## `OIDC` tokenManager.off(event[, callback])

Unsubscribe from `tokenManager` events. If no callback is provided, unsubscribes all listeners from the event.

- `event` - Event to unsubscribe from
- `callback` - Optional callback that was used to subscribe to the event

```javascript
signIn.tokenManager.off('refreshed');
signIn.tokenManager.off('refreshed', myRefreshedCallback);
```

# Configuration

The only required configuration option is `baseUrl`. All others are optional.

```javascript
// Basic example
var config = {
  baseUrl: 'https://acme.okta.com',
  logo: '/path/to/logo.png',
  helpSupportNumber: '(123) 456-7890',
  language: 'en',
  i18n: {
    en: {
      'primaryauth.title': 'Sign in to Acme'
    }
  },
  helpLinks: {
    help: 'https://acme.com/help'
  }
};

var signIn = new OktaSignIn(config);
```

## Basic config options

- **baseUrl:** The base URL for your Okta organization

    ```javascript
    // Production org with subdomain "acme"
    baseUrl: 'https://acme.okta.com'

    // Can also target oktapreview and okta-emea, i.e.
    baseUrl: 'https://acme.oktapreview.com'
    ```

- **logo:** Local path or URL to a logo image that is displayed at the top of the Sign-In Widget

    ```javascript
    // Hosted on the same origin
    logo: '/img/logo.png'

    // Can also be a full url
    logo: 'https://acme.com/img/logo.png'
    ```

- **helpSupportNumber:** Support phone number that is displayed in the Password Reset and Unlock Account flows. If no number is provided, no support screen is shown to the user.

    ```javascript
    // Can be any format - there are no formatting checks
    helpSupportNumber: '(123) 456-7890'
    ```

## Username and password

- **username:** Prefills the username input with the provided username

    ```javascript
    username: 'john@acme.com'
    ```

- **transformUsername:** Transforms the username before sending requests with the username to Okta. This is useful when you have an internal mapping between what the user enters and their Okta username.

    ```javascript
    // The callback function is passed two arguments:
    // 1) username: The name entered by the user
    // 2) operation: The type of operation the user is trying to perform:
    //      - PRIMARY_AUTH
    //      - FORGOT_PASSWORD
    //      - UNLOCK_ACCOUNT
    transformUsername: function (username, operation) {
      // This example will append the '@acme.com' domain if the user has
      // not entered it
      return username.indexOf('@acme.com') > -1
        ? username
        : username + '@acme.com';
    }
    ```

- **processCreds:** Hook to handle the credentials before they are sent to Okta in the Primary Auth, Password Expiration, and Password Reset flows.

    If processCreds takes a single argument it will be executed as a synchronous hook:

    ```javascript
    // Passed a creds object {username, password}
    processCreds: function (creds) {
      // This example demonstrates a partial integration with ChromeOS
      google.principal.add({
        token: creds.username,
        user: creds.username,
        passwordBytes: creds.password,
        keyType: 'KEY_TYPE_PASSWORD_PLAIN'
      });
    }
    ```

    If processCreds takes two arguments it will be executed as an asynchronous hook:

    ```javascript
    // Passed a creds object {username, password} and a callback for further processing
    processCreds: function (creds, callback) {
      // This example demonstrates optional legacy form-based login
      $.ajax({
        method: "POST",
        url: "/logintype",
        data: {
          username : creds.username
        },
        success: function (logintype) {
          if (logintype == "LEGACY") {
            $('#legacyUser').val(creds.username);
            $('#legacyPassword').val(creds.password);
            $('#legacyLogonForm').submit();
          } else {
            callback();
          }
        }
      });
    }
    ```

## Language and text

- **language:** Set the language of the widget. If no language is specified, the widget will choose a language based on the user's browser preferences if it is supported, or defaults to `en`.

  ```javascript
  // You can simply pass the languageCode as a string:
  language: 'ja'

  // Or, if you need to determine it dynamically, you can pass a
  // callback function:
  language: function (supportedLanguages, userLanguages) {
    // supportedLanguages is an array of languageCodes, i.e.:
    // ['cs', 'da', ...]
    //
    // userLanguages is an array of languageCodes that come from the user's
    // browser preferences
    return supportedLanguages[0];
  }
  ```

  Supported languages:
  - `cs` - Czech
  - `da` - Danish
  - `de` - German
  - `en` - English
  - `es` - Spanish
  - `fi` - Finnish
  - `fr` - French
  - `hu` - Hungarian
  - `id` - Indonesian
  - `it` - Italian
  - `ja` - Japanese
  - `ko` - Korean
  - `ms` - Malaysian
  - `nl-NL` - Dutch
  - `pl` - Polish
  - `pt-BR` - Portuguese (Brazil)
  - `ro` - Romanian
  - `ru` - Russian
  - `sv` - Swedish
  - `th` - Thai
  - `tr` - Turkish
  - `uk` - Ukrainian
  - `zh-CN` - Chinese (PRC)
  - `zh-TW` - Chinese (Taiwan)


- **i18n:** Override the text in the widget. The full list of properties can be found in the [login.properties](packages/@okta/i18n/dist/properties/login.properties) and [country.properties](packages/@okta/i18n/dist/properties/country.properties) files.

    ```javascript
    // The i18n object maps language codes to a hash of property keys ->
    // property values.
    i18n: {
      // Overriding English properties
      'en': {
        'primaryauth.title': 'Sign in to Acme',
        'primaryauth.username.placeholder': 'Your Acme Username'
      },
      // Overriding Japanese properties
      'ja': {
        'primaryauth.title': 'ACMEにサインイン',
        'primaryauth.username.placeholder': 'ACMEのユーザー名'
      }
    }

    // If you want to override any properties in the country.properties file,
    // you will need to prefix the name with "country.":
    i18n: {
      'en': {
        // login.properties keys do not have a special prefix
        'primaryAuth.title': 'Sign in to Acme',

        // country.properties keys are prefixed with 'country.'
        'country.AF': 'Afghanistan, edited',
        'country.AL': 'Albania, edited'
      }
    }
    ```

- **assets.baseUrl:** Override the base url the widget pulls its language files from. The widget is only packaged with english text by default, and loads other languages on demand from the Okta CDN. If you want to serve the language files from your own servers, update this setting.

    ```javascript
    // Loading the assets from a path on the current domain
    assets: {
      baseUrl: '/path/to/dist'
    },

    // Full urls work as well
    assets: {
      baseUrl: 'https://acme.com/assets/dist'
    }
    ```

    **Note:** The jsonp files can be accessed from the `dist/labels/jsonp` folder that is published in the [npm module](https://www.npmjs.com/package/@okta/okta-signin-widget).

- **assets.rewrite:** You can use this function to rewrite the asset path and filename. Use this function if you will host the asset files on your own host, and plan to change the path or filename of the assets. This is useful, for example, if you want to cachebust the files.

    ```javascript
    assets: {
      // Note: baseUrl is still needed to set the base path
      baseUrl: '/path/to/dist',

      rewrite: function (assetPath) {
        // assetPath is relative to baseUrl
        // Example assetPath to load login for 'ja': "/labels/jsonp/login_ja.jsonp"
        return someCacheBustFunction(assetPath);
      }
    }
    ```

## Links

You can override a link URL by setting the following config options. If you'd like to change the link text, use the `i18n` config option.

#### Help Links

Set the following config options to override the help link URLs on the Primary Auth page.

```javascript
// An example that overrides all help links, and sets two custom links
helpLinks: {
  help: 'https://acme.com/help',
  forgotPassword: 'https://acme.com/forgot-password',
  unlock: 'https://acme.com/unlock-account',
  custom: [
    {
      text: 'What is Okta?',
      href: 'https://acme.com/what-is-okta'
    },
    {
      text: 'Acme Portal',
      href: 'https://acme.com'
    }
  ]
}
```

- **helpLinks.help** - Custom link href for the "Help" link

- **helpLinks.forgotPassword** - Custom link href for the "Forgot Password" link

- **helpLinks.unlock** - Custom link href for the "Unlock Account" link. For this link to display, `features.selfServiceUnlock` must be set to `true`, and the self service unlock feature must be enabled in your admin settings.

- **helpLinks.custom** - Array of custom link objects `{text, href}` that will be added to the *"Need help signing in?"* section.

#### Sign Out Link

Set the following config option to override the sign out link URL. If not provided, the widget will navigate to Primary Auth.

```javascript
signOutLink: 'https://www.signmeout.com'
```

## Buttons

You can add buttons to the Primary Auth page by setting the following config options.

#### Custom Buttons

You can add custom buttons underneath the login form on the primary auth page by setting the following config options. If you'd like to change the divider text, use the `i18n` config option.

```javascript
// An example that adds a custom button underneath the login form on the primary auth page
customButtons: [{
  title: 'Click Me',
  className: 'btn-customAuth',
  click: function() {
    // clicking on the button navigates to another page
    window.location.href = 'http://www.example.com';
  }
}]
```

- **customButtons.title** - String that is set as the button text

- **customButtons.className** - Optional class that can be added to the button

- **customButtons.click** - Function that is called when the button is clicked

#### Registration Button

You can add a registration link to the primary auth page by setting `features.registration` to `true` and by adding the following config options.
```javascript
// An example that adds a registration button underneath the login form on the primary auth page
registration: {
  click: function() {
    window.location.href = 'https://acme.com/sign-up';
  }
}
```
- **registration.click** - Function that is called when the registration button is clicked

## OpenId Connect

Options for the [OpenId Connect](http://developer.okta.com/docs/api/resources/oidc.html) authentication flow. This flow is required for social authentication, and requires OAuth client registration with Okta. For instructions, see [Social Authentication](http://developer.okta.com/docs/api/resources/social_authentication.html).

- **clientId:** Client Id pre-registered with Okta for the OIDC authentication flow

    ```javascript
    clientId: 'GHtf9iJdr60A9IYrR0jw'
    ```

- **redirectUri:** The url that is redirected to when using `authParams.display:page`. This must be pre-registered as part of client registration. If no `redirectUri` is provided, defaults to the current origin.

    ```javascript
    redirectUri: 'https://acme.com/oauth2/callback/home'
    ```

- **idps:** External Identity Providers to use in OIDC authentication. Supported IDPs are `GOOGLE`, `FACEBOOK`, and `LINKEDIN`.

    ```javascript
    idps: [
      {type: 'GOOGLE', id: '0oaaix1twko0jyKik0g4'}
      {type: 'FACEBOOK', id: '0oar25ZnMM5LrpY1O0g3'}
      {type: 'LINKEDIN', id: '0oaaix1twko0jyKik0g4'}
    ]
    ```

- **idpDisplay:** Display order for External Identity Providers relative to the Okta login form. Defaults to `SECONDARY`.

    - `PRIMARY` - Display External IDP buttons above the Okta login form
    - `SECONDARY` - Display External IDP buttons below the Okta login form

    ```javascript
    idpDisplay: 'PRIMARY'
    ```

- **oAuthTimeout:** Timeout for OIDC authentication flow requests, in milliseconds. If the authentication flow takes longer than this timeout value, an error will be thrown and the flow will be cancelled. Defaults to `12000`.

    ```javascript
    oAuthTimeout: 300000 // 5 minutes
    ```

- **authParams.display:** Specify how to display the authentication UI for External Identity Providers. Defaults to `popup`.

    - `popup` - Opens a popup to the authorization server when an External Identity Provider button is clicked. `responseMode` will be set to `okta_post_message` and cannot be overridden.

    - `page` - Redirect to the authorization server when an External Identity Provider button is clicked. If `responseMode` is not specified, it will default to `query` if `responseType = 'code'`, and `fragment` for other values of `responseType`.

    ```javascript
    // Redirects to authorization server when the IDP button is clicked, and
    // returns an access_token in the url hash
    authParams: {
      display: 'page',
      responseType: 'token'
    }
    ```

- **authParams.responseMode:** Specify how the authorization response should be returned. You will generally not need to set this unless you want to override the default values for your `authParams.display` and `authParams.responseType` settings.

    - `okta_post_message` - Used when `authParams.display = 'popup'`. Uses [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) to send the response from the popup to the origin window.

    - `fragment` - Default value when `authParams.display = 'page'` and `authParams.responseType != 'code'`. Returns the authorization response in the hash fragment of the URL after the authorization redirect.

    - `query` - Default value when `authParams.display = 'page'` and `authParams.responseType = 'code'`. Returns the authorization response in the query string of the URL after the authorization redirect.

    - `form_post` - Returns the authorization response as a form POST after the authorization redirect. Use this when `authParams.display = page` and you do not want the response returned in the URL.

    ```javascript
    // Use form_post instead of query in the Authorization Code flow
    authParams: {
      display: 'page',
      responseType: 'code',
      responseMode: 'form_post'
    }
    ```

- **authParams.responseType:** Specify the response type for OIDC authentication. Defaults to `id_token`.

    Valid response types are `id_token`, `access_token`, and `code`. Note that `code` goes through the Authorization Code flow, which requires the server to exchange the Authorization Code for tokens.

    ```javascript
    // Specifying a single responseType
    authParams: {
      responseType: 'token'
    }

    // Use an array if specifying multiple response types - in this case,
    // the response will contain both an ID Token and an Access Token.
    authParams: {
      responseType: ['id_token', 'token']
    }
    ```

- **authParams.scopes:** Specify what information to make available in the returned `id_token` or `access_token`. For OIDC, you must include `openid` as one of the scopes. Defaults to `['openid', 'email']`.

    Valid OIDC scopes: `openid`, `email`, `profile`, `address`, `phone`

    ```javascript
    authParams: {
      scopes: ['openid', 'email', 'profile', 'address', 'phone']
    }
    ```

- **authParams.state:** Specify a state that will be validated in an OAuth response. This is usually only provided during redirect flows to obtain an authorization code. Defaults to a random string.

    ```javascript
    authParams: {
      state: '8rFzn3MH5q'
    }
    ```

- **authParams.nonce:** Specify a nonce that will be validated in an id_token. This is usually only provided during redirect flows to obtain an authorization code that will be exchanged for an id_token. Defaults to a random string.

    ```javascript
    authParams: {
      nonce: '51GePTswrm'
    }
    ```

- **authParams.issuer:** Specify a custom issuer to perform the OIDC flow. Defaults to the baseUrl.

    ```javascript
    authParams: {
      issuer: 'https://your-org.okta.com/oauth2/default'
    }
    ```

- **authParams.authorizeUrl:** Specify a custom authorizeUrl to perform the OIDC flow. Defaults to the issuer plus "/v1/authorize".

    ```javascript
    authParams: {
      issuer: 'https://your-org.okta.com/oauth2/default',
      authorizeUrl: 'https://your-org.okta.com/oauth2/default/v1/authorize'
    }
    ```

- **authScheme:** Authentication scheme for OIDC authentication. You will normally not need to override this value. Defaults to `OAUTH2`.

    ```javascript
    authParams: {
      authScheme: 'OAUTH2'
    }
    ```

## Bootstrapping from a recovery token

- **recoveryToken:** Bootstrap the widget into continuing either the Forgot Password or Unlock Account flow after the recovery email has been sent to the user with the `recoveryToken`.

    ```javascript
    recoveryToken: 'x0whAcR02i0leKtWMZVc'
    ```

## Feature flags

Enable or disable widget functionality with the following options. Some of these features require additional configuration in your Okta admin settings.

```javascript
// An example that enables the autoPush and multiOptionalFactorEnroll features
features: {
  autoPush: true,
  multiOptionalFactorEnroll: true
}
```

- **features.router** - Set to `true` if you want the widget to update the navigation bar when it transitions between pages. This is useful if you want the user to maintain their current state when refreshing the page, but requires that your server can handle the widget url paths. Defaults to `false`.

- **features.rememberMe** - Display a checkbox to enable "Remember me" functionality at login. Defaults to `true`.

- **features.autoPush** - Display a checkbox to enable "Send push automatically" functionality in the MFA challenge flow. Defaults to `false`.

- **features.smsRecovery** - Allow users with a configured mobile phone number to recover their password using an SMS message. Defaults to `false`.

- **features.callRecovery** - Allow users with a configured mobile phone number to recover their password using a voice call. Defaults to `false`.

- **features.windowsVerify** - Display instructions for enrolling a windows device with Okta Verify. Defaults to `false`.

- **features.selfServiceUnlock** - Display the "Unlock Account" link to allow users to unlock their accounts. Defaults to `false`.

- **features.multiOptionalFactorEnroll** - Allow users to enroll in multiple optional factors before finishing the authentication flow. Default behavior is to force enrollment of all required factors and skip optional factors. Defaults to `false`.

- **features.hideSignOutLinkInMFA** - Hides the sign out link for MFA challenge. Defaults to `false`.

- **features.registration** - Display the registration section in the primary auth page. Defaults to `false`.

# Events

Events published by the widget. Subscribe to these events using [on](#onevent-callback-context).

- **pageRendered** - triggered when the widget transitions to a new page, and animations have finished.

    ```javascript
    // Overriding the "Back to Sign In" click action on the Forgot Password page
    signIn.on('pageRendered', function (data) {
      if (data.page !== 'forgot-password') {
        return;
      }
      var backLink = document.getElementsByClassName('js-back')[0];
      backLink.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        // Custom link behavior
      });
    });
    ```

# Developing the Sign-In Widget

## Building the widget

1. Clone this repo and navigate to the new `okta-signin-widget` folder.

    ```bash
    $ git clone git@github.com:okta/okta-signin-widget.git && cd okta-signin-widget
    ```

2. [Install Bundler](http://bundler.io/) if you don't already have it, and then install our Ruby dependencies.

    ```bash
    [okta-signin-widget]$ gem install bundler
    [okta-signin-widget]$ bundle install
    ```

3. Install our Node dependencies.

    ```bash
    [okta-signin-widget]$ npm install
    ```

4. Create a `.widgetrc` file in the `okta-signin-widget` directory with an entry for `baseUrl`.

    ```javascript
    {
      "widgetOptions": {
        "baseUrl": "https://your-org.okta.com"
      }
    }
    ```

5. Build the widget, start a local connect server that hosts it, and launch a browser window with the widget running.

    ```bash
    [okta-signin-widget]$ npm start
    ```

6. Finally, enable CORS support for our new server by [following these instructions](http://developer.okta.com/docs/guides/okta_sign-in_widget.html#configuring-cors-support-on-your-okta-organization). You can now authenticate to Okta using your very own, customizable widget!

## The `.widgetrc` config file

The `.widgetrc` file is a configuration file that saves your local widget settings.

| Property | Description |
| --- | --- |
| **widgetOptions** | Config options that are passed to the widget on initialization. |
| **serverPort** | The port the local server runs on. Defaults to `3000` |

## Build and test commands

| Command | Description |
| --- | --- |
| `npm start` | Build the widget, start the server, and open a browser window with the widget loaded |
| `npm run build:dev` | Build an unminified version of the widget |
| `npm run build:release` | Build a minified, uglified version of the widget |
| `npm test` | Run unit tests |
| `npm run lint` | Run jshint and scss linting tests |
