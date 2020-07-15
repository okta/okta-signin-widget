<!-- START GITHUB ONLY -->
[<img src="https://aws1.discourse-cdn.com/standard14/uploads/oktadev/original/1X/0c6402653dfb70edc661d4976a43a46f33e5e919.png" align="right" width="256px"/>](https://devforum.okta.com/)
[![Support](https://img.shields.io/badge/support-developer%20forum-blue.svg)](https://devforum.okta.com)
[![Build Status](https://travis-ci.org/okta/okta-signin-widget.svg?branch=master)](https://travis-ci.org/okta/okta-signin-widget)
[![npm version](https://img.shields.io/npm/v/@okta/okta-signin-widget.svg?style=flat-square)](https://www.npmjs.com/package/@okta/okta-signin-widget)
<!-- END GITHUB ONLY -->

# Okta Sign-In Widget

The Okta Sign-In Widget is a Javascript widget that provides a fully featured and customizable login experience which can be used to authenticate users on any website.

You can learn more on the [Okta + JavaScript][lang-landing] page in our documentation.

**Table of Contents**

<!-- TOC depthFrom:2 depthTo:3 -->

- [Getting started](#getting-started)
  - [Using the Okta CDN](#using-the-okta-cdn)
  - [Using the npm module](#using-the-npm-module)
- [Usage guide](#usage-guide)
- [API Reference](#api-reference)
  - [OktaSignIn](#oktasignin)
  - [renderEl](#renderel)
  - [showSignInToGetTokens](#showsignintogettokens)
  - [hide](#hide)
  - [show](#show)
  - [remove](#remove)
  - [on](#on)
  - [off](#off)
  - [authClient](#authclient)
  - [hasTokensInUrl](#hastokensinurl)
- [Configuration](#configuration)
  - [Basic config options](#basic-config-options)
  - [Username and password](#username-and-password)
  - [Language and text](#language-and-text)
  - [Colors](#colors)
  - [Links](#links)
  - [Buttons](#buttons)
  - [Registration](#registration)
  - [IdP Discovery](#idp-discovery)
  - [OpenID Connect](#openid-connect)
  - [Smart Card IdP](#smart-card-idp)
  - [Bootstrapping from a recovery token](#bootstrapping-from-a-recovery-token)
  - [Feature flags](#feature-flags)
- [Events](#events)
  - [ready](#ready)
  - [afterError](#aftererror)
  - [afterRender](#afterrender)
  - [pageRendered](#pagerendered)
  - [passwordRevealed](#passwordrevealed)
- [Building the Widget](#building-the-widget)
  - [The `.widgetrc` config file](#the-widgetrc-config-file)
  - [Build and test commands](#build-and-test-commands)
- [Browser support](#browser-support)
- [Contributing](#contributing)

<!-- /TOC -->

## Getting started

Installing the Okta Sign-In Widget into your project is simple. You can include the Sign-In Widget in your project either directly from the Okta CDN, or by packaging it with your app via our npm package, [@okta/okta-signin-widget](https://www.npmjs.com/package/@okta/okta-signin-widget).

You'll also need:

* An Okta account, called an _organization_ (sign up for a free [developer organization](https://developer.okta.com/signup/) if you need one)

### Using the Okta CDN

Loading our assets directly from the CDN is a good choice if you want an easy way to get started with the widget, and don't already have an existing build process that leverages [npm](https://www.npmjs.com/) for external dependencies.

To use the CDN, include links to the JS and CSS files in your HTML:

```html
<!-- Latest CDN production Javascript and CSS -->
<script src="https://global.oktacdn.com/okta-signin-widget/4.1.1/js/okta-sign-in.min.js" type="text/javascript"></script>

<link href="https://global.oktacdn.com/okta-signin-widget/4.1.1/css/okta-sign-in.min.css" type="text/css" rel="stylesheet"/>
```

The standard JS asset served from our CDN includes polyfills via [`babel-polyfill`](https://babeljs.io/docs/en/babel-polyfill/) to ensure compatibility with older browsers. This may cause conflicts if your app already includes polyfills. For this case, we provide an alternate JS asset which does not include any polyfills.

```html
<!-- Latest CDN production Javascript without polyfills -->
<script src="https://global.oktacdn.com/okta-signin-widget/4.1.1/js/okta-sign-in.no-polyfill.min.js" type="text/javascript"></script>
```

### Using the npm module

Using our npm module is a good choice if:

- You have a build system in place where you manage dependencies with npm
- You do not want to load scripts directly from 3rd party sites

To install [@okta/okta-signin-widget](https://www.npmjs.com/package/@okta/okta-signin-widget):

```bash
# Run this command in your project root folder

# yarn
yarn add @okta/okta-signin-widget

# npm
npm install @okta/okta-signin-widget --save
```

The widget source files and assets will be installed to `node_modules/@okta/okta-signin-widget/dist`, and will have this directory structure:

```bash
node_modules/@okta/okta-signin-widget/dist/
├── css/
│   │   # Main CSS file for widget styles. Try not to override the classes in this
│   │   # file when creating a custom theme - the classes/elements are subject to
│   │   # change between releases
│   └── okta-sign-in.min.css
│
│   # Base font and image files that are used in rendering the widget
├── font/
│
├── img/
│
├── js/
│   │   # CDN JS file that exports the OktaSignIn object in UMD format. This is
│   │   # packaged with everything needed to run the widget, including 3rd party
│   │   # vendor files and polyfills.
│   ├── okta-sign-in.min.js
|   |
│   │   # CDN JS file bundled without polyfills.
│   ├── okta-sign-in.no-polyfill.min.js
│   │
│   │   # Main entry file that is used in the npm require(@okta/okta-signin-widget)
│   │   # flow. This does not package 3rd party dependencies - these are pulled
│   │   # down through `npm install` (which allows you to use your own version of
│   │   # jquery, etc).
│   ├── okta-sign-in.entry.js
│   │
│   │   # Development version of okta-sign-in.min.js. Equipped with helpful
│   │   # console warning messages for common configuration errors.
│   └── okta-sign-in.js
│
│    # Localized strings that are used to display all text and labels in the
│    # widget. Three output formats are included - json and properties
├── labels/
│
│   # Sass files that are used to generate the widget css. If you are already
│   # using Sass in your project, you can include these helper files to make
│   # generating your custom theme easier
└── sass/
```

After installing:

1. Copy the assets to a folder that will be distributed to your publicly hosted site. The folders you'll need to copy are `css`, `font`, `img`, `js` and `labels`.
2. Instead of copying the `js` directory and including it in your page as a global, you can require the Sign-In Widget in your build if you are using [Webpack](https://webpack.github.io/), [Browserify](http://browserify.org/), or another module bundling system that understands the `node_modules` format.

    ```javascript
    // Load the Sign-In Widget module
    var OktaSignIn = require('@okta/okta-signin-widget');

    // Use OktaSignIn
    var signIn = new OktaSignIn(/* configOptions */);
    ```

    Source maps are provided as an external .map file. If you are using [Webpack](https://webpack.github.io/), these can be loaded using the [source-map-loader](https://github.com/webpack-contrib/source-map-loader) plugin.

    **Note:** If you use [Browserify](http://browserify.org/) to bundle your app, you'll need to use the `--noparse` option:

    ```bash
    browserify main.js \
    --noparse=$PWD/node_modules/@okta/okta-signin-widget/dist/js-okta-sign-in.entry.js \
    --outfile=bundle.js
    ```

3. Make sure you include ES6 polyfills with your bundler if you need the broadest browser support. We recommend [`babel-polyfill`](https://babeljs.io/docs/en/babel-polyfill/).


## Usage guide

For an overview of the Widget's features and authentication flows, check out [our developer docs](https://developer.okta.com/code/javascript/okta_sign-in_widget). There, you will learn how to use the Widget to:

* Sign In to Okta with the Default Dashboard
* Sign In to Okta with a Custom Dashboard
* Sign In to Your Application

You can also browse the full [API reference documentation](#api-reference).

## Usage examples

### OIDC login flow using PKCE (Proof Key for Code Exchange)

- PKCE is enabled by default for new SPA (Single-page) applications
- You can configure your existing Single-page application to use `PKCE` under the `General Settings` for your application in the Okta Admin UI.
- To complete the flow, your client application should handle the code passed to `redirectUri` and use it to obtain tokens. You can test for a code in the URL using [hasTokensInUrl()](#hastokensinurl). The [okta-auth-js](https://github.com/okta/okta-auth-js#pkce-oauth-20-flow) library is used to retreive the code from the URL and exchange it for tokens. An instance of `okta-auth-js` is used by the Signin Widget and exposed as `authClient`.
- We also provide higher-level [Javascript OIDC SDKs](https://github.com/okta/okta-oidc-js) for several frameworks, including [React](https://github.com/okta/okta-oidc-js/tree/master/packages/okta-react), [Angular](https://github.com/okta/okta-oidc-js/tree/master/packages/okta-angular) and [Vue](https://github.com/okta/okta-oidc-js/tree/master/packages/okta-vue). These SDKs are built on `okta-auth-js` and are fully compatible with the Signin Widget.
- Complete samples are available for:
  - [React](https://github.com/okta/samples-js-react/tree/master/custom-login)
  - [Angular](https://github.com/okta/samples-js-angular/tree/master/custom-login)
  - [Vue](https://github.com/okta/samples-js-vue/tree/master/custom-login).

```javascript
var signIn = new OktaSignIn(
  {
    baseUrl: 'https://{yourOktaDomain}',
    redirectUri: '{{redirectUri configured in OIDC app}}',
    authParams: {
      display: 'page'
    }
  }
);

if (signIn.hasTokensInUrl()) {
  // The user has just successfully completed a redirect
  // Retrieve tokens from the URL and store them in the internal TokenManager
  // https://github.com/okta/okta-auth-js#tokenparsefromurloptions
  signIn.authClient.token.parseFromUrl()
    .then(function (res) {
      oktaSignIn.authClient.tokenManager.add('idToken', res.tokens.idToken);
      oktaSignIn.authClient.tokenManager.add('accessToken', res.tokens.accessToken);
    })
}
else {
  // There are no tokens in the URL, render the Sign-In Widget.
}
```

### OIDC login flow using Authorization Code

- Available for Native and server-side Web applications
- Samples are available for:
  - [Asp.Net Core 2.x](https://github.com/okta/samples-aspnetcore/tree/master/samples-aspnetcore-2x/self-hosted-login)
  - [ASP.Net Core 3.x](https://github.com/okta/samples-aspnetcore/tree/master/samples-aspnetcore-3x/self-hosted-login)
  - [ASP.Net 4.x](https://github.com/okta/samples-aspnet/tree/master/self-hosted-login)
  - [ASP.Net Webforms](https://github.com/okta/samples-aspnet-webforms/tree/master/self-hosted-login)
  - [Golang](https://github.com/okta/samples-golang/tree/develop/custom-login)
  - [Java/Spring Boot](https://github.com/okta/samples-java-spring/tree/master/custom-login)
  - [NodeJS/Express](https://github.com/okta/samples-nodejs-express-4/tree/master/custom-login)
  - [PHP](https://github.com/okta/samples-php/tree/develop/custom-login)
  - [Python/Flask](https://github.com/okta/samples-python-flask/tree/master/custom-login)

## API Reference

### OktaSignIn

Creates a new instance of the Sign-In Widget with the provided options. The widget has many [config options](#configuration). The only required option to get started is `baseUrl`, the base url for your Okta domain.

- `config` - Options that are used to configure the widget

```javascript
var signIn = new OktaSignIn(
  {
    baseUrl: 'https://{yourOktaDomain}'
  }
);
```

> **Note**: `https://{yourOktaDomain}` can be any Okta organization. See [Basic config options](#basic-config-options) for more information.

### renderEl

Renders the widget to the DOM, and passes control back to your app through success and error callback functions when the user has entered a success or error state.

- `options`
  - `el` - CSS selector which identifies the container element that the widget attaches to.
- `success` *(optional)* - Function that is called when the user has completed an authentication flow. If an [OpenID Connect redirect flow](#openid-connect) is used, this function can be omitted.
- `error` *(optional)* - Function that is called when the widget has been initialized with invalid config options, or has entered a state it cannot recover from. If omitted, a default function is used to output errors to the console.

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
    // This function is invoked with errors the widget cannot recover from:
    // Known errors: CONFIG_ERROR, UNSUPPORTED_BROWSER_ERROR
  }
);
```

### showSignInToGetTokens

Renders the widget to the DOM to prompt the user to sign in. On successful authentication, users are redirected back to the application via the `redirectUri` with an Okta SSO session in the browser, and access and/or identity tokens in the fragment identifier.

* `options`
  * `clientId` *(optional)* - Client Id pre-registered with Okta for the OIDC authentication flow. If omitted, defaults to the value passed in during the construction of the Widget.
  * `redirectUri` *(optional)* - The url that is redirected to after authentication. This must be pre-registered as part of client registration. Defaults to the current origin.
  * `getAccessToken` *(optional)* - Return an access token from the authorization server. Defaults to `true`.
  * `getIdToken` *(optional)* - Return an ID token from the authorization server. Defaults to `true`.
  * `scope` *(optional)* - Specify what information to make available in the returned access or ID token. If omitted, defaults to the value passed in during construction of the Widget.

```javascript
var signIn = new OktaSignIn({
  baseUrl: 'https://{yourOktaDomain}',
  // Assumes there is an empty element on the page with an id of 'osw-container'
  el: '#osw-container'
});

signIn.showSignInToGetTokens({
  clientId: '{{myClientId}}',
  redirectUri: '{{redirectUri configured in OIDC app}}',

  // Return an access token from the authorization server
  getAccessToken: true,

  // Return an ID token from the authorization server
  getIdToken: true,

  scope: 'openid profile'
});
```

### hide

Hide the widget, but keep the widget in the DOM.

```javascript
signIn.hide();
```

### show

Show the widget if hidden.

```javascript
signIn.show();
```

### remove

Remove the widget from the DOM entirely.

```javascript
signIn.remove();
```

### on

Subscribe to an event published by the widget.

- `event` - [Event](#events) to subscribe to
- `callback` - Function to call when the event is triggered

```javascript
// Handle a 'ready' event using an onReady callback
signIn.on('ready', onReady);
```

### off

Unsubscribe from widget events. If no callback is provided, unsubscribes all listeners from the event.

- `event` - Optional [event](#events) to unsubscribe from
- `callback` - Optional callback that was used to subscribe to the event

```javascript
// Unsubscribe all listeners from all events
signIn.off();

// Unsubscribe all listeners that have been registered to the 'ready' event
signIn.off('ready');

// Unsubscribe the onReady listener from the 'ready' event
signIn.off('ready', onReady);
```

### authClient

Returns the underlying [`@okta/okta-auth-js`](https://github.com/okta/okta-auth-js) object used by the Sign-in Widget. All methods are documented in the [AuthJS](https://github.com/okta/okta-auth-js#api-reference) base library.

```javascript
// Check for an existing authClient transaction
signIn.authClient.tx.exists();
if (exists) {
  console.log('A session exists!');
} else {
  console.log('A session does not exist.');
};
```

### hasTokensInUrl

Synchronous method to check for access or ID Tokens in the url. This is used when `authParams.display = 'page'`. Returns `true` if there are tokens, and `false` if the redirect flow has not taken place yet.

```javascript
if (signIn.hasTokensInUrl()) {
  // The user has just successfully completed a redirect
  // Retrieve tokens from the URL and store them in the internal TokenManager
  // https://github.com/okta/okta-auth-js#tokenparsefromurloptions
  signIn.authClient.token.parseFromUrl()
    .then(function (res) {
      oktaSignIn.authClient.tokenManager.add('idToken', res.tokens.idToken);
      oktaSignIn.authClient.tokenManager.add('accessToken', res.tokens.accessToken);
    })
}
else {
  // There are no tokens in the URL, render the Sign-In Widget.
}
```

## Configuration

The only required configuration option is `baseUrl`. All others are optional.

```javascript
// Basic example
var config = {
  baseUrl: 'https://{yourOktaDomain}',
  logo: '/path/to/logo.png',
  logoText: 'logo text',
  helpSupportNumber: '(123) 456-7890',
  language: 'en',
  i18n: {
    en: {
      'primaryauth.title': 'Sign in to Acme'
    }
  },
  helpLinks: {
    help: 'https://acme.com/help'
  },
  authParams: {
    // Configuration for authClient. See https://github.com/okta/okta-auth-js#configuration-options
  }
};

var signIn = new OktaSignIn(config);
```

### Basic config options

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

- **logoText:** Text for `alt` attribute of the logo image, logo text will only show up when logo image is not avaiable

    ```javascript
    // Text to describe the logo
    logoText: 'logo text'
    ```

- **helpSupportNumber:** Support phone number that is displayed in the Password Reset and Unlock Account flows. If no number is provided, no support screen is shown to the user.

    ```javascript
    // Can be any format - there are no formatting checks
    helpSupportNumber: '(123) 456-7890'
    ```

- **brandName:** The brand or company name that is displayed in messages rendered by the Sign-in Widget (for example, "Reset your {`brandName`} password"). If no `brandName` is provided, a generic message is rendered instead (for example, "Reset your password"). You can further customize the text that is displayed with [language and text settings](https://github.com/okta/okta-signin-widget#language-and-text).

    ```javascript
    brandName: 'Spaghetti Inc.'
    ```

### Username and password

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

### Language and text

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
  - `el` - Greek
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
  - `nb` - Norwegian
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

- **i18n:** Override the text in the widget. The full list of properties can be found in the [login.properties](packages/@okta/i18n/src/properties/login.properties) and [country.properties](packages/@okta/i18n/src/properties/country.properties) files.

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

    **Note:** The json files can be accessed from the `dist/labels/json` folder that is published in the [npm module](https://www.npmjs.com/package/@okta/okta-signin-widget).

- **assets.rewrite:** You can use this function to rewrite the asset path and filename. Use this function if you will host the asset files on your own host, and plan to change the path or filename of the assets. This is useful, for example, if you want to cachebust the files.

    ```javascript
    assets: {
      // Note: baseUrl is still needed to set the base path
      baseUrl: '/path/to/dist',

      rewrite: function (assetPath) {
        // assetPath is relative to baseUrl
        // Example assetPath to load login for 'ja': "/labels/json/login_ja.json"
        return someCacheBustFunction(assetPath);
      }
    }
    ```

### Colors

These options let you customize the appearance of the Sign-in Widget.

If you want even more customization, you can modify the [Sass source files](https://github.com/okta/okta-signin-widget/tree/master/assets/sass) and [build the Widget](https://github.com/okta/okta-signin-widget#building-the-widget).

- **colors.brand:** Sets the brand (primary) color. Colors must be in hex format, like `#008000`.

  ```javascript
  colors: {
    brand: '#008000'
  }
  ```

### Links

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
      href: 'https://acme.com',
      target: '_blank'
    }
  ]
}
```

- **helpLinks.help** - Custom link href for the "Help" link

- **helpLinks.forgotPassword** - Custom link href for the "Forgot Password" link

- **helpLinks.unlock** - Custom link href for the "Unlock Account" link. For this link to display, `features.selfServiceUnlock` must be set to `true`, and the self service unlock feature must be enabled in your admin settings.

- **helpLinks.custom** - Array of custom link objects `{text, href, target}` that will be added to the *"Need help signing in?"* section. The `target` of the link is optional.

#### Sign Out Link

Set the following config option to override the sign out link URL. If not provided, the widget will navigate to Primary Auth.

```javascript
signOutLink: 'https://www.signmeout.com'
```

### Buttons

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

### Registration

> **:warning: Beta feature:** The registration feature is currently a [Beta feature](https://developer.okta.com/docs/api/getting_started/releases-at-okta#beta). This widget functionality won't work unless your Okta organization is part of the Beta program. For help, contact support@okta.com.

To add registration into your application, configure your Okta admin settings to allow users to self register into your app. Then, set `features.registration` in the widget. You can add additional configs under the registration key on the [`OktaSignIn`](#new-oktasigninconfig) object.

```javascript
    var signIn = new OktaSignIn({
      baseUrl: 'https://{yourOktaDomain}',
      // If you are using version 2.8 or higher of the widget, clientId is not required while configuring
      // registration. Instead the widget relies on policy setup with Self Service Registration. For help
      // with setting up Self Service Registration contact support@okta.com. Registration should continue
      // to work with a clientId set and version 2.7 or lower of the widget.
      clientId: '{{myClientId}}', // REQUIRED (with version 2.7.0 or lower)
      registration: {
        parseSchema: function(schema, onSuccess, onFailure) {
           // handle parseSchema callback
           onSuccess(schema);
        },
        preSubmit: function (postData, onSuccess, onFailure) {
           // handle preSubmit callback
           onSuccess(postData);
        },
        postSubmit: function (response, onSuccess, onFailure) {
            // handle postsubmit callback
           onSuccess(response);
        }
      },
      features: {
        // Used to enable registration feature on the widget.
        // https://github.com/okta/okta-signin-widget#feature-flags
         registration: true // REQUIRED
      }
    });
```

Optional configuration:

- **parseSchema:** Callback used to mold the JSON schema that comes back from the Okta API.

    ```javascript
    // The callback function is passed 3 arguments: schema, onSuccess, onFailure
    // 1) schema: json schema returned from the API.
    // 2) onSuccess: success callback.
    // 3) onFailure: failure callback. Note: accepts an errorObject that can be used to show form level or field level errors.

    parseSchema: function (schema, onSuccess, onFailure) {
      // This example will add an additional field to the registration form
        schema.profileSchema.properties.address = {
          'type': 'string',
          'description': 'Street Address',
          'default': 'Enter your street address',
          'maxLength': 255
        };
        schema.profileSchema.fieldOrder.push('address');
        onSuccess(schema);
    }
    ```
 - **preSubmit:** Callback used primarily to modify the request parameters sent to the Okta API.

    ```javascript
     // The callback function is passed 3 arguments: postData, onSuccess, onFailure
     // 1) postData: form data that will be posted to the registration API.
     // 2) onSuccess: success callback.
     // 3) onFailure: failure callback. Note: accepts a errorObject that can be used to show form level or field level errors.
    preSubmit: function (postData, onSuccess, onFailure) {
      // This example will add @companyname.com to the email if user fails to add it during registration
      if (postData.username.indexOf('@acme.com') > 1) {
        return postData.username;
      } else {
        return postData.username + '@acme.com';
      }
    }
    ```
 - **postSubmit:** Callback used to primarily get control and to modify the behavior post submission to registration API .

    ```javascript
     // The callback function is passed 3 arguments: response, onSuccess, onFailure
     // 1) response: response returned from the API post registration.
     // 2) onSuccess: success callback.
     // 3) onFailure: failure callback. Note: accepts an errorObject that can be used to show form level
     //    or field level errors.
    postSubmit: function (response, onSuccess, onFailure) {
      // In this example postSubmit callback is used to log the server response to the browser console before completing registration flow
      console.log(response);
      // call onSuccess to finish registration flow
      onSuccess(response);
    }
    ```
- **onFailure and ErrorObject:** The onFailure callback accepts an error object that can be used to show a form level vs field level error on the registration form.

    ####  Use the default error
    ```javascript
    preSubmit: function (postData, onSuccess, onFailure) {
      // A Default form level error is shown if no error object is provided
      onFailure();
    }
    ```

    #### Use form level error
     ```javascript
    preSubmit: function (postData, onSuccess, onFailure) {
      var error = {
        "errorSummary": "Custom form level error"
      };
      onFailure(error);
    }
    ```

    #### Use field level error
    ```javascript
      preSubmit: function (postData, onSuccess, onFailure) {
        var error = {
            "errorSummary": "API Error",
            "errorCauses": [
                {
                    "errorSummary": "Custom field level error",
                    "reason": "registration.error.address",
                    "resource": "User",
                    "property": "address", //should match field name
                    "arguments": []
                }
            ]
        };
        onFailure(error);
     }
    ```

### IdP Discovery

**:information_source: EA feature:** The Identity Provider (IdP) Discovery feature is currently an [EA feature](https://developer.okta.com/docs/api/getting_started/releases-at-okta#early-access-ea).

IdP Discovery enables you to route users to different 3rd Party IdPs that are connected to your Okta Org. Users can federate back into the primary org after authenticating at the IdP.

To use IdP Discovery in your application, first ensure that the `IDP_DISCOVERY` feature flag is enabled for your Org and configure an identity provider routing policy in the Okta admin panel.
Then, in the widget configuration, set `features.idpDiscovery` to `true`.

```javascript
var signIn = new OktaSignIn({
  baseUrl: 'https://{yourOktaDomain}',
  ... ...
  features: {
    idpDiscovery: true
  }
});
```

The IdP Discovery authentication flow in widget will be

1. If a routing policy with a username/domain condition is configured, the widget will enter identifier first flow
2. Otherwise, the widget will enter primary authentication flow.

For the identifier first flow,

1. The widget will display an identifier first page for the user to enter an Okta userName to determine the IdP to be used for authentication.
2. If the IdP is your Okta org, the widget will transition to the primary authentication flow.
3. If the IdP is a 3rd party IdP or a different Okta org, the widget will automatically redirect to path of the 3rd party IdP.

#### Additional configuration

### OpenID Connect

Options for the [OpenID Connect](http://developer.okta.com/docs/api/resources/oidc.html) authentication flow. This flow is required for social authentication, and requires OAuth 2.0 client registration with Okta. For instructions, see [Social Authentication](http://developer.okta.com/docs/api/resources/social_authentication.html).

- **clientId:** Client Id pre-registered with Okta for the OIDC authentication flow

    ```javascript
    clientId: 'GHtf9iJdr60A9IYrR0jw'
    ```

- **redirectUri:** The url that is redirected to when using `authParams.display:page`. This must be pre-registered as part of client registration. If no `redirectUri` is provided, defaults to the current origin.

    ```javascript
    redirectUri: 'https://acme.com/oauth2/callback/home'
    ```

- **idps:** External Identity Providers to use in OIDC authentication. Supported IDPs ( `GOOGLE`, `FACEBOOK`, `APPLE`, `MICROSOFT` and `LINKEDIN` ) are declared with a `type` and will get distinct styling and default i18n text, while any other entry will receive a general styling and require text to be provided.  Each IDP can have additional CSS classes added via an optional `className` property.

    ```javascript
    idps: [
      {type: 'GOOGLE', id: '0oaaix1twko0jyKik0g1'},
      {type: 'FACEBOOK', id: '0oar25ZnMM5LrpY1O0g2'},
      {type: 'APPLE', id: '0oaaix1twko0jyKik0g3'},
      {type: 'MICROSOFT', id: '0oaaix1twko0jyKik0g4'},
      {type: 'LINKEDIN', id: '0oaaix1twko0jyKik0g5'},
      {id: '0oabds23xM3ssMjosl0g5', text: 'Login with Joe', className: 'with-joe' }
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

- **authParams:** An object containing configuration which is passed directly to the `authClient`. Selected options are described below. See the full set of [Configuration options](https://github.com/okta/okta-auth-js#configuration-options)

- **authParams.pkce:** Set to `false` to disable PKCE flow

- **authParams.display:** Specify how to display the authentication UI for External Identity Providers. Defaults to `popup`.

    - `popup` - Opens a popup to the authorization server when an External Identity Provider button is clicked. `responseMode` will be set to `okta_post_message` and cannot be overridden.

    - `page` - Redirect to the authorization server when an External Identity Provider button is clicked.

    ```javascript
    // Redirects to authorization server when the IDP button is clicked, and
    // returns an access_token in the url hash (Implicit flow)
    authParams: {
      display: 'page',
      responseType: 'token',
      pkce: false
    }

    // With PKCE flow, you should leave responseType blank.
    // An authorization code will be returned in the query which can be exchanged for tokens.
    authParams: {
      display: 'page'
    }
    ```

- **authParams.responseMode:** Specify how the authorization response should be returned. You will generally not need to set this unless you want to override the default values for your `authParams.display` and `authParams.responseType` settings.

    - `okta_post_message` - Used when `authParams.display = 'popup'`. Uses [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) to send the response from the popup to the origin window.

    - `fragment` - Used when `authParams.display = 'page'`. Returns the authorization response in the hash fragment of the URL after the authorization redirect. `fragment` is the default for Single-page applications using the implicit OIDC flow and for standard web applications where `responseType != 'code'`. SPA Applications using PKCE flow can set `responseMode = 'fragment'` to receive the authorization code in the hash fragment instead of the query.

    - `query` - Used when `authParams.display = 'page'`. Returns the authorization response in the query string of the URL after the authorization redirect. `query` is the default value for standard web applications where `authParams.responseType = 'code'`. For SPA applications, the default will be `query` if using PKCE, or `fragment` for implicit OIDC flow.

    - `form_post` - Returns the authorization response as a form POST after the authorization redirect. Use this when `authParams.display = page` and you do not want the response returned in the URL.

    ```javascript
    // Use form_post instead of query in the Authorization Code flow
    authParams: {
      display: 'page',
      responseType: 'code',
      responseMode: 'form_post'
    }
    ```

- **authParams.responseType:** Specify the response type for OIDC authentication. Defaults to `['id_token', 'token']`.

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

- **authParams.state:** Specify a state that will be validated in an OAuth response. This is usually only provided during redirect flows to obtain an authorization code. Defaults to a random string. This value can be retrieved on the login callback. It will be returned along with tokens from [authClient.token.parseFromUrl()](https://github.com/okta/okta-auth-js#tokenparsefromurloptions)

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

- **authParams.issuer:** Specify a custom issuer to perform the OIDC flow. Defaults to the baseUrl plus "/oauth2/default". See the guide on setting up an [Authourization Server](https://developer.okta.com/docs/guides/customize-authz-server/overview/) for more information.

    ```javascript
    authParams: {
      issuer: 'https://{yourOktaDomain}/oauth2/default'
    }
    ```

- **authParams.authorizeUrl:** Specify a custom authorizeUrl to perform the OIDC flow. Defaults to the issuer plus "/v1/authorize".

    ```javascript
    authParams: {
      issuer: 'https://{yourOktaDomain}/oauth2/default',
      authorizeUrl: 'https://{yourOktaDomain}/oauth2/default/v1/authorize'
    }
    ```

- **authScheme:** Authentication scheme for OIDC authentication. You will normally not need to override this value. Defaults to `OAUTH2`.

    ```javascript
    authParams: {
      authScheme: 'OAUTH2'
    }
    ```

### Smart Card IdP

**:information_source: EA feature:** The Smart Card IdP feature is currently an [EA feature](https://developer.okta.com/docs/api/getting_started/releases-at-okta#early-access-ea).

Settings for authentication with a Smart Card `X509` type IdP.

- `certAuthUrl` *(required)* - The `url` property of the [MTLS SSO Endpoint Object](https://developer.okta.com/docs/reference/api/idps/#mtls-single-sign-on-sso-endpoint-object). The browser prompts the user to select a client certificate when this url is accessed.

- `text` *(optional)* - Label for the Smart Card IdP button. By default, this value will be "Sign in with PIV / CAC card".

- `className` *(optional)* - Class that can be added to the Smart Card IdP button.

- `isCustomDomain` *(optional)* - Boolean that indicates if the request is coming from a [custom domain](https://developer.okta.com/docs/guides/custom-url-domain/overview). If omitted, it will indicate that the request is not coming from a custom domain.

    ```javascript
    piv: {
      certAuthUrl: '/your/cert/validation/endpoint',
      text: 'Authenticate with a Smart Card',
      className: 'custom-style',
      isCustomDomain: true,
    }
    ```

### Bootstrapping from a recovery token

- **recoveryToken:** Bootstrap the widget into continuing either the Forgot Password or Unlock Account flow after the recovery email has been sent to the user with the `recoveryToken`.

    ```javascript
    recoveryToken: 'x0whAcR02i0leKtWMZVc'
    ```

### Feature flags

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

- **features.webauthn** - Display and use factors supported by the FIDO 2.0 (Web Authentication) security standard. Enabling this feature will prevent the widget from invoking the legacy Windows Hello factor. Defaults to `false`.

- **features.selfServiceUnlock** - Display the "Unlock Account" link to allow users to unlock their accounts. Defaults to `false`.

- **features.multiOptionalFactorEnroll** - Allow users to enroll in multiple optional factors before finishing the authentication flow. Default behavior is to force enrollment of all required factors and skip optional factors. Defaults to `false`.

- **features.hideSignOutLinkInMFA** - Hides the sign out link for MFA challenge. Defaults to `false`.

- **features.registration** - Display the registration section in the primary auth page. Defaults to `false`.

- **features.idpDiscovery** - Enable [IdP Discovery](#idp-discovery). Defaults to `false`.

- **features.showPasswordToggleOnSignInPage** - End users can now toggle visibility of their password on the Okta Sign-In page, allowing end users to check their password before they click Sign In. This helps prevent account lock outs caused by end users exceeding your org's permitted number of failed sign-in attempts. Note that passwords are visible for 30 seconds and then hidden automatically. Defaults to `false`.

## Events

Events published by the widget. Subscribe to these events using [on](#onevent-callback-context).

### ready

Triggered when the widget is ready to accept user input for the first time. Returns a `context` object containing the following properties:

- **controller** - Current controller name

```javascript
signIn.on('ready', function (context) {
  // The Widget is ready for user input
});
```

### afterError

The widget will handle most types of errors - for example, if the user enters an invalid password or there are issues authenticating. To capture an authentication state change error after it is handled and rendered by the Widget, listen to the `afterError` event. You can also capture OAuth and registration errors. For other error types, it is encouraged to handle them using the [`renderEl` error handler](#renderel).

Returns `context` and `error` objects containing the following properties:

- `context`:
  - **controller** - Current controller name
- `error`:
  - **name** - Name of the error triggered
  - **message** - Error message
  - **statusCode** - HTTP status code (if available)
  - **xhr** - HTTP response (if available)

```javascript
signIn.on('afterError', function (context, error) {
    console.log(context.controller);
    // reset-password

    console.log(error.name);
    // AuthApiError

    console.log(error.message);
    // The password does not meet the complexity requirements
    // of the current password policy.

    console.log(error.statusCode);
    // 403
});
```

### afterRender

Triggered when the widget transitions to a new page and animations have finished. Returns a `context` object containing the following properties:

- **controller** - Current controller name

```javascript
// Overriding the "Back to Sign In" click action on the Forgot Password page
signIn.on('afterRender', function (context) {
  if (context.controller !== 'forgot-password') {
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

### pageRendered

:warning: This event has been *deprecated*, please use [**afterRender**](#afterrender) instead.

Triggered when the widget transitions to a new page and animations have finished.

```javascript
signIn.on('pageRendered', function (data) {
  console.log(data);
  // { page: 'forgot-password' }
});
```

### passwordRevealed

:warning: This event has been *deprecated*, do not use.

Triggered when the show password button is clicked.

```javascript
signIn.on('passwordRevealed', function () {
  // Handle the event
})
```

## Building the Widget

We use Yarn as our node package manager. To install Yarn, check out their [install documentation](https://yarnpkg.com/en/docs/install).

1. Clone this repo and navigate to the new `okta-signin-widget` folder.

    ```bash
    git clone https://github.com/okta/okta-signin-widget.git
    cd okta-signin-widget
    ```

2. Install our Node dependencies.

    ```bash
    yarn install
    ```

3. Create a `.widgetrc` file in the `okta-signin-widget` directory with an entry for `baseUrl`.

    ```javascript
    {
      "widgetOptions": {
        "baseUrl": "https://{yourOktaDomain}"
      }
    }
    ```

4. Build the widget, start a local connect server that hosts it, and launch a browser window with the widget running.

    ```bash
    yarn start
    ```
    or start local connect server in watch mode, changes in `src/` and `assets/sass/` folders will trigger browser auto reload.
    ```bash
    yarn start:playground
    ```

5. Finally, enable CORS support for our new server by [following these instructions](http://developer.okta.com/docs/guides/okta_sign-in_widget.html#configuring-cors-support-on-your-okta-organization). You can now authenticate to Okta using your very own, customizable widget!

### The `.widgetrc` config file

The `.widgetrc` file is a configuration file that saves your local widget settings.

| Property          | Description                                                     |
|-------------------|-----------------------------------------------------------------|
| **widgetOptions** | Config options that are passed to the widget on initialization. |
| **serverPort**    | The port the local server runs on. Defaults to `3000`           |

### Build and test commands

| Command              | Description                                                                                                                                            |
|----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| `yarn start`         | Build the widget, start the server, and open a browser window with the widget loaded                                                                   |
| `yarn start:playground`         | Build the widget, start the server, and open a browser window with the widget loaded and watch on widget js and sass changes                                                                   |
| `yarn build:dev`     | Build an unminified version of the widget                                                                                                              |
| `yarn build:release` | Build a minified, uglified version of the widget (`okta-sign-in.min.js`) and a non-minified **development** version of the widget (`okta-sign-in.js`). |
| `yarn test`          | Run unit tests                                                                                                                                         |
| `yarn test --test OAuth2Util_spec`  | Run a single unit test                                                                                                                  |
| `yarn test:testcafe <browser>`  | Run testcafe tests on selected browser (example: `yarn test:testcafe chrome`)                                                               |
| `yarn lint`          | Run eslint and scss linting tests                                                                                                                      |

## Browser support

Need to know if the Sign-In Widget supports your browser requirements?  Please see [Platforms, Browser, and OS Support](https://help.okta.com/en/prod/Content/Topics/Miscellaneous/Platforms_Browser_OS_Support.htm).

## Contributing

We're happy to accept contributions and PRs! Please see the [contribution guide](CONTRIBUTING.md) to understand how to structure a contribution.

[devforum]: https://devforum.okta.com/
[lang-landing]: https://developer.okta.com/code/javascript
[github-issues]: https://github.com/okta/okta-signin-widget/issues
