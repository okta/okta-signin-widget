<!-- START GITHUB ONLY -->
[<img src="https://devforum.okta.com/uploads/oktadev/original/1X/bf54a16b5fda189e4ad2706fb57cbb7a1e5b8deb.png" align="right" width="256px"/>](https://devforum.okta.com/)

[![Support](https://img.shields.io/badge/support-developer%20forum-blue.svg)](https://devforum.okta.com)
[![Build Status](https://travis-ci.org/okta/okta-signin-widget.svg?branch=master)](https://travis-ci.org/okta/okta-signin-widget)
[![npm version](https://img.shields.io/npm/v/@okta/okta-signin-widget.svg?style=flat-square)](https://www.npmjs.com/package/@okta/okta-signin-widget)
<!-- END GITHUB ONLY -->

# Okta Sign-In Widget

* [Need help?](#need-help)
* [Getting started](#getting-started)
* [Usage guide](#usage-guide)
* [Browser support](#browser-support)
* [Configuration reference](#configuration-reference)
  * [OpenID Connect](#openid-connect-options)
  * [Registration :warning: ](#registration)
  * [IdP Discovery](#idp-discovery)
  * [Bootstrapping from a recovery token](#bootstrapping-from-a-recovery-token)
  * [Feature flags](#feature-flags)
* [API Reference](#api-reference)
* [Building the Widget](#building-the-widget)
* [Contributing](#contributing)

The Okta Sign-In Widget is a Javascript widget that provides a fully featured and customizable login experience which can be used to authenticate users on any website.

You can learn more on the [Okta + JavaScript][lang-landing] page in our documentation.

## Need help?

If you run into problems using the Widget, you can:

* Ask questions on the [Okta Developer Forums][devforum]
* Post [issues][github-issues] here on GitHub (for code errors)

## Getting started

Installing the Okta Sign-In Widget into your project is simple. You can include the Sign-In Widget in your project either directly from the Okta CDN, or by packaging it with your app via our npm package, [@okta/okta-signin-widget](https://www.npmjs.com/package/@okta/okta-signin-widget).

You'll also need:

* An Okta account, called an _organization_ (sign up for a free [developer organization](https://developer.okta.com/signup/) if you need one)

### Using the Okta CDN

Loading our assets directly from the CDN is a good choice if you want an easy way to get started with the widget, and don't already have an existing build process that leverages [npm](https://www.npmjs.com/) for external dependencies.

To use the CDN, include links to the JS and CSS files in your HTML:

```html
<!-- Latest CDN production Javascript and CSS: 2.10.0 -->
<script
  src="https://ok1static.oktacdn.com/assets/js/sdk/okta-signin-widget/2.10.0/js/okta-sign-in.min.js"
  type="text/javascript"></script>
<link
  href="https://ok1static.oktacdn.com/assets/js/sdk/okta-signin-widget/2.10.0/css/okta-sign-in.min.css"
  type="text/css"
  rel="stylesheet"/>

<!-- Theme file: Customize or replace this file if you want to override our default styles -->
<link
  href="https://ok1static.oktacdn.com/assets/js/sdk/okta-signin-widget/2.10.0/css/okta-theme.css"
  type="text/css"
  rel="stylesheet"/>
```

### Using the npm module

Using our npm module is a good choice if:

* You have a build system in place where you manage dependencies with npm
* You do not want to load scripts directly from 3rd party sites

To install [@okta/okta-signin-widget](https://www.npmjs.com/package/@okta/okta-signin-widget):

```bash
# Run this command in your project root folder
npm install @okta/okta-signin-widget --save
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
    # packaged with everything needed to run the widget, including 3rd party
    # vendor files.
    okta-sign-in.min.js

    # Main entry file that is used in the npm require(@okta/okta-signin-widget)
    # flow. This does not package 3rd party dependencies - these are pulled
    # down through `npm install` (which allows you to use your own version of
    # jquery, etc).
    okta-sign-in.entry.js

    # Development version of okta-sign-in.min.js. Equipped with helpful
    # console warning messages for common configuration errors.
    okta-sign-in.js

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
2. Instead of copying the `js` directory and including it in your page as a global, you can require the Sign-In Widget in your build if you are using [Webpack](https://webpack.github.io/), [Browserify](http://browserify.org/) or another module bundling system that understands the `node_modules` format.

    ```javascript
    // Load the Sign-In Widget module
    var OktaSignIn = require('@okta/okta-signin-widget');

    // Use OktaSignIn
    var signIn = new OktaSignIn(/* configOptions */);
    ```
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

## Browser support

Need to know if the Sign-In Widget supports your browser requirements?  Please see [Platforms, Browser, and OS Support](https://help.okta.com/en/prod/Content/Topics/Miscellaneous/Platforms_Browser_OS_Support.htm).

## Configuration reference

The only required configuration option is `baseUrl`. All others are optional.

To see a more complex example, see the example [basic client](#example-client) and [OpenID Connect client](#example-openid-connect-client).

```javascript
var config = {
  // The URL for your Okta organization
  baseUrl: 'https://{yourOktaDomain}',

  // CSS selector which identifies the container element that the widget attaches
  // to. Let's assume there is an empty element with an id of 'osw-container'.
  el: '#osw-container'
}

var signIn = new OktaSignIn(config);
```

### Additional options

| Option | Description |
| ------------------- | ------------ |
| `assets.baseUrl` | Override the base url the widget pulls its language files from. The widget is only packaged with english text by default, and loads other languages on demand from the Okta CDN. If you need to serve the language files from your own servers, update this setting. |
| `assets.rewrite` | Function to rewrite the asset path and filename. Use this function if hosting the asset files on your own, and plan to change the path or filename of the assets. This is useful for cachebusting files. |
| [`customButtons`](#custom-buttons) | Add buttons to the Primary Auth page. If you'd like to change the divider text, use the `i18n` config option. |
| [`helpLinks`](#help-links) |  Override the help link URLs on the Primary Auth page. If you'd like to change the link text, use the `i18n` config option.|
| `helpSupportNumber` | Support phone number displayed in Password Reset and Unlock Account flows. If no number is provided, no support screen is shown to the user. |
| [`i18n`](#i18n) | Override the text in the widget. The full list of properties can be found in the [login.properties](packages/@okta/i18n/dist/properties/login.properties) and [country.properties](packages/@okta/i18n/dist/properties/country.properties) files. |
| [`language`](#language) | Set the language of the widget. If no language is specified, the widget will choose a language based on the user's browser preferences if it is supported, or defaults to `en`. |
| `logo`  | Local path or URL to a logo image that is displayed at the top of the Sign-In Widget. |
| [`processCreds`](#processcreds) | Hook to handle the credentials before they are sent to Okta in the Primary Auth, Password Expiration, and Password Reset flows. |
| `signOutLink` | Override the sign out link URL. If not provided, the widget will navigate to Primary Auth. |
| [`transformUsername`](#transformusername) | Transforms the username before sending requests with the username to Okta. This is useful when you have an internal mapping between what the user enters and their Okta username. |
| `username` | Prefills the username input with the provided username. |

#### Custom Buttons

* **customButtons.title** - String that is set as the button text

* **customButtons.className** - Optional class that can be added to the button

* **customButtons.click** - Function that is called when the button is clicked

```javascript
// An example that adds a custom button underneath the login form on the primary auth page
customButtons: [{
  title: 'Click Me',
  className: 'btn-customAuth',
  click: function() {
    // clicking on the button navigates to another page
    window.location.href = 'https://www.example.com';
  }
}]
```

#### Help Links

* **helpLinks.help** - Custom link href for the "Help" link

* **helpLinks.forgotPassword** - Custom link href for the "Forgot Password" link

* **helpLinks.unlock** - Custom link href for the "Unlock Account" link. For this link to display, `features.selfServiceUnlock` must be set to `true`, and the self service unlock feature must be enabled in your admin settings.

* **helpLinks.custom** - Array of custom link objects `{text, href}` that will be added to the *"Need help signing in?"* section. The `target` of the link is optional.

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

#### i18n

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

#### Language

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

<details>
  <summary><b>Supported Languages</b></summary>

  * `cs` - Czech
  * `da` - Danish
  * `de` - German
  * `el` - Greek
  * `en` - English
  * `es` - Spanish
  * `fi` - Finnish
  * `fr` - French
  * `hu` - Hungarian
  * `id` - Indonesian
  * `it` - Italian
  * `ja` - Japanese
  * `ko` - Korean
  * `ms` - Malaysian
  * `nl-NL` - Dutch
  * `pl` - Polish
  * `pt-BR` - Portuguese (Brazil)
  * `ro` - Romanian
  * `ru` - Russian
  * `sv` - Swedish
  * `th` - Thai
  * `tr` - Turkish
  * `uk` - Ukrainian
  * `zh-CN` - Chinese (PRC)
  * `zh-TW` - Chinese (Taiwan)

</details>

#### processCreds

Passing in a single argument will executed as a synchronous hook:

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

Passing in two arguments will execute as an asynchronous hook:

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

#### transformUsername

```javascript
// The callback function is passed two arguments:
// 1) username: The name entered by the user
// 2) operation: The type of operation the user is trying to perform:
//      - PRIMARY_AUTH
//      - FORGOT_PASSWORD
//      - UNLOCK_ACCOUNT
transformUsername: function (username, operation) {
  // This example will append the '@acme.com' domain if the user has not entered it
  return username.indexOf('@acme.com') > -1
    ? username
    : username + '@acme.com';
}
```

#### Example client

```javascript
var config = {
  baseUrl: 'https://{yourOktaDomain}',
  el: '#osw-container',
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
  },
  assets: {
    // Note: baseUrl is still needed to set the base path
    baseUrl: '/path/to/dist',
    rewrite: function (assetPath) {
      // assetPath is relative to baseUrl
      // Example assetPath to load login for 'ja': "/labels/jsonp/login_ja.jsonp"
      return someCacheBustFunction(assetPath);
    }
  },
  signOutLink: 'https://www.signmeout.com'
};

var signIn = new OktaSignIn(config);
```

### OpenID Connect options

Options for the [OpenID Connect](http://developer.okta.com/docs/api/resources/oidc) authentication flow. This flow is required for social authentication, and requires OAuth 2.0 client registration with Okta. For Social Authentication instructions, see the [Social Authentication API Reference](http://developer.okta.com/docs/api/resources/social_authentication.html).

| Option | Description |
| -------------- | ------------ |
| `clientId`     | Client Id pre-registered with Okta for the OIDC authentication flow. |
| `redirectUri` | The url that is redirected to when using `authParams.display:page`. This must be pre-registered as part of client registration. If no `redirectUri` is provided, defaults to the current origin. |
| `idps`| External Identity Providers to use in OIDC authentication. Supported IDPs are `GOOGLE`, `FACEBOOK`, and `LINKEDIN`. |
| `idpDisplay` | Relative to the Okta login form, sepecify the display order for External Identity Providers buttons. Defaults to `SECONDARY`. |
| `oAuthTimeout` | Timeout for OIDC authentication flow requests, in milliseconds. If the authentication flow takes longer than this timeout value, an error will be thrown and the flow will be cancelled. Defaults to `12000`. |
| [`authParams`](#authparams) | Optional OAuth/OpenID Connect parameters for bootstrapping specific flows. |

#### authParams

##### `authParams.display`

Specify how to display the authentication UI for External Identity Providers. Defaults to `popup`.

* `popup` - Opens a popup to the authorization server when an External Identity Provider button is clicked. `responseMode` will be set to `okta_post_message` and cannot be overridden.
* `page` - Redirect to the authorization server when an External Identity Provider button is clicked. If `responseMode` is not specified, it will default to `query` if `responseType = 'code'`, and `fragment` for other values of `responseType`.

```javascript
// Redirects to authorization server when the IDP button is clicked, and
// returns an access_token in the url hash
authParams: {
  display: 'page',
  responseType: 'token'
}
```

##### `authParams.responseMode`

Specify how the authorization response should be returned. You will generally not need to set this unless you want to override the default values for your `authParams.display` and `authParams.responseType` settings.

* `okta_post_message` - Used when `authParams.display = 'popup'`. Uses [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) to send the response from the popup to the origin window.
* `fragment` - Default value when `authParams.display = 'page'` and `authParams.responseType != 'code'`. Returns the authorization response in the hash fragment of the URL after the authorization redirect.
* `query` - Default value when `authParams.display = 'page'` and `authParams.responseType = 'code'`. Returns the authorization response in the query string of the URL after the authorization redirect.
* `form_post` - Returns the authorization response as a form POST after the authorization redirect. Use this when `authParams.display = page` and you do not want the response returned in the URL.

```javascript
// Use form_post instead of query in the Authorization Code flow
authParams: {
  display: 'page',
  responseType: 'code',
  responseMode: 'form_post'
}
```

##### `authParams.responseType`

Specify the response type for OIDC authentication, which can be any combination of the following values. Defaults to `id_token`.

* `id_token`
* `access_token`
* `code`: Note that this goes through the Authorization Code flow, which requires the server to exchange the Authorization Code for tokens.

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

##### `authParams.scopes`

Specify what information to make available in the returned `id_token` or `access_token`. For OIDC, you must include `openid` as one of the scopes. Defaults to `['openid', 'email']`.

```javascript
authParams: {
  scopes: ['openid', 'email', 'profile', 'address', 'phone']
}
```

##### `authParams.state`

Specify a state that will be validated in an OAuth response. This is usually only provided during redirect flows to obtain an authorization code. Defaults to a random string.

```javascript
authParams: {
  state: '8rFzn3MH5q'
}
```

##### `authParams.nonce`

Specify a nonce that will be validated in an id_token. This is usually only provided during redirect flows to obtain an authorization code that will be exchanged for an id_token. Defaults to a random string.

```javascript
authParams: {
  nonce: '51GePTswrm'
}
```

##### `authParams.issuer`

Specify a custom issuer to perform the OIDC flow. Defaults to the baseUrl.

```javascript
authParams: {
  issuer: 'https://{yourOktaDomain}/oauth2/default'
}
```

##### `authParams.authorizeUrl`

Specify a custom authorizeUrl to perform the OIDC flow. Defaults to the issuer plus "/v1/authorize".

```javascript
authParams: {
  issuer: 'https://{yourOktaDomain}/oauth2/default',
  authorizeUrl: 'https://{yourOktaDomain}/oauth2/default/v1/authorize'
}
```

##### `authParams.authScheme`

Authentication scheme for OIDC authentication. You will normally not need to override this value. Defaults to `OAUTH2`.

```javascript
authParams: {
  authScheme: 'OAUTH2'
}
```

#### Example OpenID Connect client

```javascript
// For Social Authentication
var config = {
  baseUrl: 'https://{yourOktaDomain}',
  el: '#osw-container',
  clientId: 'GHtf9iJdr60A9IYrR0jw',
  redirectUri: 'https://acme.com/oauth2/callback/home',
  idps: [
    {type: 'GOOGLE', id: '0oaaix1twko0jyKik0g4'}
    {type: 'FACEBOOK', id: '0oar25ZnMM5LrpY1O0g3'}
    {type: 'LINKEDIN', id: '0oaaix1twko0jyKik0g4'}
  ],
   // Display External IDP buttons above the Okta login form
  idpDisplay: 'PRIMARY',
  oAuthTimeout: 300000 // 5 minutes
};

var signIn = new OktaSignIn(config);
```

```javascript
// For using Okta as an IDP
var config = {
  baseUrl: 'https://{yourOktaDomain}',
  el: '#osw-container',
  clientId: 'GHtf9iJdr60A9IYrR0jw',
  redirectUri: 'https://acme.com/oauth2/callback/home',
  authParams: {
    issuer: 'default',
    responseType: ['id_token', 'token'],
    display: 'page',
    scopes: ['openid']
  }
};

var signIn = new OktaSignIn(config);
```

### Registration

> **:warning: Beta feature:** The registration feature is currently a [Beta feature](https://developer.okta.com/docs/api/getting_started/releases-at-okta#beta).
>
> This widget functionality won't work unless your Okta organization is part of the Beta program. For help, contact support@okta.com.

To add registration into your application, configure your Okta admin settings to allow users to self register into your app. Then, set `features.registration` in the widget. You can add additional configs under the registration key on the `OktaSignIn` object.

**Note:** If you are using version 2.8 or higher of the widget, `clientId` is not required while configuring registration. Instead, the widget relies on policy setup with Self Service Registration. For help with setting up Self Service Registration contact support@okta.com. Registration should continue to work with a `clientId` set and version 2.7 or lower of the widget.

```javascript
var signIn = new OktaSignIn({
  baseUrl: 'https://{yourOktaDomain}',
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
    registration: true // REQUIRED
  }
});
```

#### Optional configuration

* **click:** Function that is called when the registration button is clicked,

  ```javascript
  // An example that adds a registration button underneath the login form on the primary auth page
  registration: {
    click: function() {
      window.location.href = 'https://acme.com/sign-up';
    }
  }
  ```

* **parseSchema:** Callback used to mold the JSON schema that comes back from the Okta API.

  ```javascript
  // The callback function is passed 3 arguments: schema, onSuccess, onFailure
  // 1) schema: json schema returned from the API.
  // 2) onSuccess: success callback.
  // 3) onFailure: failure callback. Note: accepts an errorObject that can be
  //               used to show form level or field level errors.

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

* **preSubmit:** Callback used primarily to modify the request parameters sent to the Okta API.

  ```javascript
  // The callback function is passed 3 arguments: postData, onSuccess, onFailure
  // 1) postData: form data that will be posted to the registration API.
  // 2) onSuccess: success callback.
  // 3) onFailure: failure callback. Note: accepts a errorObject that can be used
  //               to show form level or field level errors.
  preSubmit: function (postData, onSuccess, onFailure) {
    // This example will add @companyname.com to the email if user fails to add it during registration
    if (postData.username.indexOf('@acme.com') > 1) {
      return postData.username;
    } else {
      return postData.username + '@acme.com';
    }
  }
  ```

* **postSubmit:** Callback used to primarily get control and to modify the behavior post submission to registration API .

  ```javascript
  // The callback function is passed 3 arguments: response, onSuccess, onFailure
  // 1) response: response returned from the API post registration.
  // 2) onSuccess: success callback.
  // 3) onFailure: failure callback. Note: accepts an errorObject that can be used to show form level
  //               or field level errors.
  postSubmit: function (response, onSuccess, onFailure) {
    // In this example postSubmit callback is used to log the server response to the browser console
    // before completing registration flow
    console.log(response);
    // call onSuccess to finish registration flow
    onSuccess(response);
  }
  ```

* **onFailure and ErrorObject:** The onFailure callback accepts an error object that can be used to show a form level vs field level error on the registration form.

  ```javascript
  preSubmit: function (postData, onSuccess, onFailure) {
    // A Default form level error is shown if no error object is provided
    onFailure();
  }

  // Alterntively, use a form level error
  preSubmit: function (postData, onSuccess, onFailure) {
    var error = {
      "errorSummary": "Custom form level error"
    };
    onFailure(error);
  }

  // Or a field level error
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

> **:information_source: EA feature:** The Identity Provider (IdP) Discovery feature is currently an [EA feature](https://developer.okta.com/docs/api/getting_started/releases-at-okta#early-access-ea).

IdP Discovery enables you to route users to different 3rd Party IdPs that are connected to your Okta Org. Users can federate back into the primary org after authenticating at the IdP.

To use IdP Discovery in your application, first ensure that the `IDP_DISCOVERY` feature flag is enabled for your Org and configure an identity provider routing policy in the Okta admin panel. Then, in the widget configuration, set `features.idpDiscovery` to `true` and add additional configs under the `idpDiscovery` key on the `OktaSignIn` object.

```javascript
var signIn = new OktaSignIn({
  baseUrl: 'https://{yourOktaDomain}',
  idpDiscovery: {
    requestContext: '/an/app/request/context',
  },
  features: {
    idpDiscovery: true
  }
});

signIn.renderEl({
    el: '#osw-container'
  },
  function (res) {
    if (res.status === 'IDP_DISCOVERY') {
      res.idpDiscovery.redirectToIdp('/an/app/request/context');
      return;
    }
  }
);
```

The IdP Discovery authentication flow in widget will be:

1. If a routing policy with a username/domain condition is configured, the widget will enter **identifier first** flow
2. Otherwise, the widget will enter **primary authentication** flow.

For the identifier first flow:

1. The widget will display an identifier first page for the user to enter an Okta userName to determine the IdP to be used for authentication.
2. If the IdP is your Okta org, the widget will transition to the primary authentication flow.
3. If the IdP is a 3rd party IdP or a different Okta org, the widget will invoke the [success callback](#rendereloptions-success-error) with `response.status` as `IDP_DISCOVERY`.

#### Additional configuration

* **idpDiscovery.requestContext**: Context in which the user is trying to access. For example, the path of an app.

#### Additions provided in the success callback

* `response.status`
  * `IDP_DISCOVERY` when the authentication needs to be done agaist 3rd party IdP.
* `res.idpDiscovery.redirectToIdp`
  * A function used to redirect to the relative path of the 3rd party IdP. This function takes a single parameter, **idpDiscovery.requestContext**.

### Bootstrapping from a recovery token

* **recoveryToken:** Bootstrap the widget into continuing either the Forgot Password or Unlock Account flow after the recovery email has been sent to the user with the `recoveryToken`.

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

| Feature | Description |
| :------- | ----------- |
| **features.router** | Set to `true` if you want the widget to update the navigation bar when it transitions between pages. This is useful if you want the user to maintain their current state when refreshing the page, but requires that your server can handle the widget url paths. Defaults to `false`. |
| **features.rememberMe** | Display a checkbox to enable "Remember me" functionality at login. Defaults to `true`. |
| **features.autoPush** | Display a checkbox to enable "Send push automatically" functionality in the MFA challenge flow. Defaults to `false`. |
| **features.smsRecovery** | Allow users with a configured mobile phone number to recover their password using an SMS message. Defaults to `false`. |
| **features.callRecovery** | Allow users with a configured mobile phone number to recover their password using a voice call. Defaults to `false`. |
| **features.windowsVerify** | Display instructions for enrolling a windows device with Okta Verify. Defaults to `false`. |
| **features.selfServiceUnlock** | Display the "Unlock Account" link to allow users to unlock their accounts. Defaults to `false`. |
| **features.multiOptionalFactorEnroll** | Allow users to enroll in multiple optional factors before finishing the authentication flow. Default behavior is to force enrollment of all required factors and skip optional factors. Defaults to `false`. |
| **features.hideSignOutLinkInMFA** | Hides the sign out link for MFA challenge. Defaults to `false`. |
| **features.registration** | Display the registration section in the primary auth page. Defaults to `false`. |
| **features.idpDiscovery** | Enable [IdP Discovery](#idp-discovery). Defaults to `false`. |
| **features.showPasswordToggleOnSignInPage** | End users can now toggle visibility of their password on the Okta Sign-In page, allowing end users to check their password before they click Sign In. This helps prevent account lock outs caused by end users exceeding your org's permitted number of failed sign-in attempts. Note that passwords are visible for 30 seconds and then hidden automatically. Defaults to `false`. |

<!-- START GITHUB ONLY -->

## API Reference

* [renderEl](#rendereloptions-success-error)
* [hide](#hide)
* [show](#show)
* [remove](#remove)
* [on](#onevent-callback-context)
* [off](#offevent-callback)
* [session](#session)
  * [session.get](#sessiongetcallback)
  * [session.refresh](#sessionrefreshcallback)
  * [session.close](#sessionclosecallback)
* [token](#oidc-token)
  * [token.hasTokensInUrl](#oidc-tokenhastokensinurl)
  * [token.parseTokensFromUrl](#oidc-tokenparsetokensfromurlsuccess-error)
* [tokenManager](#tokenmanager)
  * [tokenManager.add](#tokenmanageraddkey-token)
  * [tokenManager.get](#tokenmanagergetkey)
  * [tokenManager.remove](#tokenmanagerremovekey)
  * [tokenManager.clear](#tokenmanagerclear)
  * [tokenManager.refresh](#tokenmanagerrefreshkey)
  * [tokenManager.on](#tokenmanageronevent-callback-context)
  * [tokenManager.off](#tokenmanageroffevent-callback)
* [Events](#events)

<!-- END GITHUB ONLY -->

### `renderEl(options, success, error)`

Renders the widget to the DOM, and passes control back to your app through success and error callback functions when the user has entered a success or error state.

* `options`
  * `el` - CSS selector which identifies the container element that the widget attaches to.
* `success` *(optional)* - Function that is called when the user has completed an authentication flow. If an [OpenID Connect redirect flow](#openid-connect) is used, this function can be omitted.
* `error` *(optional)* - Function that is called when the widget has been initialized with invalid config options, or has entered a state it cannot recover from. If omitted, a default function is used to output errors to the console.

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
      signIn.tokenManager.add('idToken', res);

      // If the widget is configured for OIDC with multiple responseTypes, the
      // response will be an array of tokens:
      // i.e. authParams.responseType = ['id_token', 'token']
      signIn.tokenManager.add('idToken', res[0]);
      signIn.tokenManager.add('accessToken', res[1]);

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

### `hide`

Hide the widget, but keep the widget in the DOM.

```javascript
signIn.hide();
```

### `show`

Show the widget if hidden.

```javascript
signIn.show();
```

### `remove`

Remove the widget from the DOM entirely.

```javascript
signIn.remove();
```

### `on(event, callback[, context])`

Subscribe to an event published by the widget.

* `event` - [Event](#events) to subscribe to
* `callback` - Function to call when the event is triggered
* `context` - Optional context to bind the callback to

```javascript
signIn.on('pageRendered', function (data) {
  console.log(data);
});
```

### `off([event, callback])`

Unsubscribe from widget events. If no callback is provided, unsubscribes all listeners from the event.

* `event` - Optional event to unsubscribe from
* `callback` - Optional callback that was used to subscribe to the event

```javascript
// Unsubscribe all listeners from all events
signIn.off();

// Unsubscribe all listeners that have been registered to the 'pageRendered' event
signIn.off('pageRendered');

// Unsubscribe the onPageRendered listener from the 'pageRendered' event
signIn.off('pageRendered', onPageRendered);
```

### session

#### `session.get(callback)`

Gets the active session, or returns `{status:inactive}` on error or no active session.

* `callback` - Function that is called with the session once the request has completed.

```javascript
signIn.session.get(function (res) {
  // Session exists, show logged in state.
  if (res.status === 'ACTIVE') {
    // showApp()
  }
  // No session, or error retrieving the session. Render the Sign-In Widget.
  else if (res.status === 'INACTIVE') {
    signIn.renderEl({
        el: '#osw-container'
      },
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

#### `session.refresh(callback)`

Refresh the current session by extending its lifetime. This can be used as a keep-alive operation.

* `callback` - Function that is called after the refresh request has completed.

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

#### `session.close(callback)`

Signs the user out of their current Okta session.

* `callback` - Function that is called once the session has been closed. If there is an error, it will be passed to the callback function.

```javascript
signIn.session.close(function (err) {
  if (err) {
    // The user has not been logged out, perform some error handling here.
    return;
  }
  // The user is now logged out. Render the Sign-In Widget.
});
```

### `OIDC` token

#### `token.hasTokensInUrl()`

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

#### `token.parseTokensFromUrl(success, error)`

Parses the access or ID Tokens from the url after a successful authentication redirect. This is used when `authParams.display = 'page'`.

* `success` - Function that is called after the tokens have been parsed and validated
* `error` - Function that is called if an error occurs while trying to parse or validate the tokens

```javascript
var signIn = new OktaSignIn({
  baseUrl: 'https://{yourOktaDomain}',
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
      signIn.tokenManager.add('idToken', res);
    },
    function error(err) {
      // handleError(err);
    }
  );
}
```

### tokenManager

#### `tokenManager.add(key, token)`

After receiving an `access_token` or `id_token`, add it to the `tokenManager` to manage token expiration and refresh operations. When a token is added to the `tokenManager`, it is automatically refreshed when it expires.

* `key` - Unique key to store the token in the `tokenManager`. This is used later when you want to get, delete, or refresh the token.
* `token` - Token object that will be added

```javascript
// Example showing a success callback when authParams.responseType = 'id_token'
signIn.renderEl({
    el: '#osw-container'
  },
  function (res) {
    if (res.status !== 'SUCCESS') {
      return;
    }

    // When specifying authParams.responseType as 'id_token' or 'token', the
    // response is the token itself
    signIn.tokenManager.add('idToken', res);
  }
);
```

#### `tokenManager.get(key)`

Get a token that you have previously added to the `tokenManager` with the given `key`.

* `key` - Key for the token you want to get

```javascript
var token = signIn.tokenManager.get('idToken');
```

#### `tokenManager.remove(key)`

Remove a token from the `tokenManager` with the given `key`.

* `key` - Key for the token you want to remove

```javascript
signIn.tokenManager.remove('idToken');
```

#### `tokenManager.clear()`

Remove all tokens from the `tokenManager`.

```javascript
signIn.tokenManager.clear();
```

#### `tokenManager.refresh(key)`

Manually refresh a token before it expires.

* `key` - Key for the token you want to refresh

```javascript
// Because the refresh() method is async, you can wait for it to complete
// by using the returned Promise:
signIn.tokenManager.refresh('idToken')
.then(function (newToken) {
  // doSomethingWith(newToken);
});

// Alternatively, you can subscribe to the 'refreshed' event:
signIn.tokenManager.on('refreshed', function (key, newToken, oldToken) {
  // doSomethingWith(newToken);
});
signIn.tokenManager.refresh('idToken');
```

#### `tokenManager.on(event, callback[, context])`

Subscribe to an event published by the `tokenManager`.

* `event` - Event to subscribe to. Possible events are `expired`, `error`, and `refreshed`.
* `callback` - Function to call when the event is triggered
* `context` - Optional context to bind the callback to

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

#### `tokenManager.off(event[, callback])`

Unsubscribe from `tokenManager` events. If no callback is provided, unsubscribes all listeners from the event.

* `event` - Event to unsubscribe from
* `callback` - Optional callback that was used to subscribe to the event

```javascript
signIn.tokenManager.off('refreshed');
signIn.tokenManager.off('refreshed', myRefreshedCallback);
```

### Events

Events published by the widget. Subscribe to these events using [on](#onevent-callback-context).

* **pageRendered** - triggered when the widget transitions to a new page, and animations have finished.

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

* **passwordRevealed** - triggered when the show password button is clicked.

## Building the widget

In most cases, you won't need to build the Widget from source. If you want to build it yourself, you'll need to follow these steps:

```bash
# Clone the repo
git clone https://github.com/okta/okta-signin-widget.git

# Navigate into the new `okta-signin-widget` folder
cd okta-signin-widget

# Install Bundler (http://bundler.io/) if you don't already have it,
# and then install our Ruby dependencies
gem install bundler
bundle install

# Install our Node dependencies
npm install

# Build the widget for development. The output will be under `dist`
npm run build:dev
```

Next, create a `.widgetrc` file in the `okta-signin-widget` directory with an entry for `baseUrl`. See [the .widgetrc config file](#the-widgetrc-config-file) for more information.

Finally, build and start a local connect server that hosts it, and launch a browser window with the widget running.

```bash
npm start
```

> **Note:** Enable CORS support for our new server by [following these instructions](http://developer.okta.com/docs/guides/okta_sign-in_widget.html#configuring-cors-support-on-your-okta-organization).

### The `.widgetrc` config file

The `.widgetrc` file is a configuration file that saves your local widget settings. Place this file in the `okta-signin-widget` directory.

```javascript
{
  // Config options that are passed to the Widget on initialization
  "widgetOptions": {
    "baseUrl": "https://{yourOktaDomain}"
  },
  // The port the local server runs on
  "serverPort": 3000
}
```

### Build and test commands

| Command | Description |
| ----------------------- | ------------------------------------------------------------------------------------ |
| `npm start`             | Build the widget, start the server, and open a browser window with the widget loaded |
| `npm run build:dev`     | Build an unminified version of the widget |
| `npm run build:release` | Build a minified, uglified version of the widget (`okta-sign-in.min.js`) and a non-minified **development** version of the widget (`okta-sign-in.js`).|
| `npm test`              | Run unit tests |
| `npm run lint`          | Run jshint and scss linting tests |

## Contributing

We're happy to accept contributions and PRs! Please see the [contribution guide](contributing.md) to understand how to structure a contribution.

[devforum]: https://devforum.okta.com/
[lang-landing]: https://developer.okta.com/code/javascript
[github-issues]: https://github.com/okta/okta-signin-widget/issues
[github-releases]: https://github.com/okta/okta-signin-widget/releases