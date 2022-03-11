<!-- START GITHUB ONLY -->
[<img src="https://aws1.discourse-cdn.com/standard14/uploads/oktadev/original/1X/0c6402653dfb70edc661d4976a43a46f33e5e919.png" align="right" width="256px"/>](https://devforum.okta.com/)
[![Support](https://img.shields.io/badge/support-developer%20forum-blue.svg)](https://devforum.okta.com)
[![Build Status](https://travis-ci.org/okta/okta-signin-widget.svg?branch=master)](https://travis-ci.org/okta/okta-signin-widget)
[![npm version](https://img.shields.io/npm/v/@okta/okta-signin-widget.svg?style=flat-square)](https://www.npmjs.com/package/@okta/okta-signin-widget)
<!-- END GITHUB ONLY -->

<!-- links -->
[devforum]: https://devforum.okta.com/
[lang-landing]: https://developer.okta.com/code/javascript
[github-issues]: https://github.com/okta/okta-signin-widget/issues
[deployment-checklist]: https://developer.okta.com/docs/guides/production-deployment/deployment-checklist/
[organization]: https://developer.okta.com/docs/concepts/okta-organizations/
[custom domain]: https://developer.okta.com/docs/guides/custom-url-domain/overview/
[customize the template]: https://developer.okta.com/docs/guides/style-the-widget/style-okta-hosted/
[gallery]: https://developer.okta.com/login-widget-gallery/
[authentication]: https://developer.okta.com/docs/concepts/authentication/
[OIDC]: https://developer.okta.com/docs/reference/api/oidc/
[identity providers]: https://developer.okta.com/docs/concepts/identity-providers/
[session cookie]: https://developer.okta.com/docs/guides/session-cookie/overview/
[hosted flow]: https://developer.okta.com/docs/concepts/okta-hosted-flows/
[redirect to a sign-in page]: https://developer.okta.com/docs/guides/sign-into-web-app/go/redirect-to-sign-in/
[callback]: https://developer.okta.com/docs/guides/sign-into-web-app/go/define-callback/
[authorization code flow]: https://developer.okta.com/docs/concepts/oauth-openid/#authorization-code-flow
[PKCE]: https://developer.okta.com/docs/concepts/oauth-openid/#authorization-code-flow-with-pkce
[implicit flow]: https://developer.okta.com/docs/concepts/oauth-openid/#implicit-flow
[OAuth]: https://developer.okta.com/docs/concepts/oauth-openid/
[Custom Authorization Server]: https://developer.okta.com/docs/guides/customize-authz-server/overview/
[Authorization Server]: https://developer.okta.com/docs/concepts/auth-servers/#which-authorization-server-should-you-use
[Social Login]: https://developer.okta.com/docs/concepts/social-login/
[Identity Engine]: https://developer.okta.com/docs/guides/oie-intro/
<!-- end links -->

<!-- omit in toc -->
# Okta Sign-In Widget

The Okta Sign-In Widget is a Javascript widget that provides a fully featured and customizable login experience which can be used to authenticate users of web and mobile applications.

The widget is used on Okta's default signin page to start an Okta SSO session and set the Okta [session cookie][] in the web browser. The widget can also perform a complete [OIDC][] flow and/or integrate with external [identity providers][].

See the [Usage Guide](#usage-guide) for more information on how to get started using the Sign-in Widget.

<!-- TOC is generated using Markdown All in One -->
- [Okta Identity Engine](#okta-identity-engine)
- [Related SDKs](#related-sdks)
  - [Javascript](#javascript)
  - [Java](#java)
  - [.Net](#net)
- [Sample applications](#sample-applications)
- [Usage Guide](#usage-guide)
  - [Okta-hosted sign-in page (default)](#okta-hosted-sign-in-page-default)
  - [Okta-hosted sign-in page (customizable)](#okta-hosted-sign-in-page-customizable)
  - [Embedded (self-hosted)](#embedded-self-hosted)
    - [Using the Okta CDN](#using-the-okta-cdn)
    - [Using the npm module](#using-the-npm-module)
    - [Examples](#examples)
      - [SPA Application](#spa-application)
      - [Web Application](#web-application)
  - [Non-OIDC Applications](#non-oidc-applications)
- [API Reference](#api-reference)
  - [Interaction Code Flow](#interaction-code-flow)
  - [OktaSignIn](#oktasignin)
  - [showSignIn](#showsignin)
  - [showSignInToGetTokens](#showsignintogettokens)
  - [showSignInAndRedirect](#showsigninandredirect)
  - [renderEl](#renderel)
    - [success](#success)
  - [hide](#hide)
  - [show](#show)
  - [remove](#remove)
  - [on](#on)
  - [off](#off)
  - [authClient](#authclient)
  - [before](#before)
  - [after](#after)
- [Configuration](#configuration)
  - [OIDC Applications](#oidc-applications)
  - [Basic config options](#basic-config-options)
  - [Username and password](#username-and-password)
  - [Language and text](#language-and-text)
  - [Colors](#colors)
  - [Links](#links)
    - [Help Links](#help-links)
    - [Sign Out Link](#sign-out-link)
  - [Buttons](#buttons)
    - [Custom Buttons](#custom-buttons)
    - [Registration Button](#registration-button)
  - [Registration](#registration)
  - [IdP Discovery](#idp-discovery)
    - [Additional configuration](#additional-configuration)
  - [OpenID Connect](#openid-connect)
  - [Smart Card IdP](#smart-card-idp)
  - [Bootstrapping from a recovery token](#bootstrapping-from-a-recovery-token)
  - [Feature flags](#feature-flags)
  - [Hooks](#hooks)
- [Events](#events)
  - [ready](#ready)
  - [afterError](#aftererror)
  - [afterRender](#afterrender)
  - [pageRendered](#pagerendered)
- [Building the Widget](#building-the-widget)
  - [Build and test commands](#build-and-test-commands)
  - [Local development workflow using `yarn link`](#local-development-workflow-using-yarn-link)
  - [Utilizing Pseudo-loc](#utilizing-pseudo-loc)
- [Browser support](#browser-support)
- [Contributing](#contributing)

## Okta Identity Engine

The Okta [Identity Engine][] (OIE) is a platform service that allows enterprises to build more flexible access experiences that are tailored to their organizational needs. The Okta Sign-in Widget supports OIE in all [usage](#usage-guide) scenarios.

## Related SDKs

The Sign-in Widget is self-contained and requires no other frameworks at runtime. However, there may be certain features your app needs such as token storage, renewal, or validation, which the widget does not provide.

These SDKs are fully compatible with the Okta Sign-in Widget and provide utilities to help integrate Okta [authentication][] end-to-end in your own application.

### Javascript

- [okta-auth-js](https://github.com/okta/okta-auth-js)
- [okta-react](https://github.com/okta/okta-react)
- [okta-angular](https://github.com/okta/okta-angular)
- [okta-vue](https://github.com/okta/okta-vue)
- [oidc-middleware](https://github.com/okta/okta-oidc-js/tree/master/packages/oidc-middleware) (Express / NodeJS)
  
### Java

- [okta-auth-java](https://github.com/okta/okta-auth-java)
- [okta-spring-boot](https://github.com/okta/okta-spring-boot)

### .Net

- [okta-auth-dotnet](https://github.com/okta/okta-auth-dotnet)

## Sample applications

Complete sample applications demonstrate usage of the Okta Sign-In Widget in both [Okta-hosted](#okta-hosted-sign-in-page-default) and [embedded](#embedded-self-hosted) scenarios.

- [Javascript](https://github.com/okta/okta-auth-js/tree/master/samples)
- [React](https://github.com/okta/samples-js-react)
- [Angular](https://github.com/okta/samples-js-angular)
- [Vue](https://github.com/okta/samples-js-vue)
- [Asp.Net Core 2.x](https://github.com/okta/samples-aspnetcore)
- [ASP.Net Core 3.x](https://github.com/okta/samples-aspnetcore)
- [ASP.Net 4.x](https://github.com/okta/samples-aspnet)
- [ASP.Net Webforms](https://github.com/okta/samples-aspnet-webforms)
- [Golang](https://github.com/okta/samples-golang)
- [Java/Spring Boot](https://github.com/okta/samples-java-spring)
- [NodeJS/Express](https://github.com/okta/samples-nodejs-express-4)
- [PHP](https://github.com/okta/samples-php)
- [Python/Flask](https://github.com/okta/samples-python-flask)

## Usage Guide

There are several ways to use the Okta Sign-in Widget:

- Okta provides a [default sign-in page](#okta-hosted-sign-in-page-default) for your organization, hosted at your organization's Okta URL.

- Okta supports an option to create a [custom domain][] with a highly [customizable Okta-hosted sign-in page](#okta-hosted-sign-in-page-customizable).

- You can [embed the widget](#embedded-self-hosted) directly into your application.

### Okta-hosted sign-in page (default)

Okta provides a sign-in page, available at your [organization][]'s URL, which allows the user to complete the entire authorization flow, start an SSO (Single Sign-On) session, and set the Okta [session cookie][] in the web browser. You can customize this page with a background image and logo. By default, signing in on this page redirects the user to the Okta user dashboard.

The default Okta-hosted sign-in page can also authenticate a user in an OIDC application. Your app can [redirect to a sign-in page][] to perform the [authentication][] flow, after which Okta redirects the user back to the app [callback][]. Okta provides [SDKs](#sdks) in many languages to help construct the redirect URL and handle the login [callback][] as part of the [hosted flow][].

Okta provides several complete [sample applications](#sample-applications) which demonstrate how to use the Okta [hosted flow][].

### Okta-hosted sign-in page (customizable)

Okta also provides a hosted sign-in page that can be customized so that it is available under a [custom domain][] which is a subdomain of your company's top-level domain. Although the page is hosted by Okta, you can [customize the template][] of this page in many powerful ways.

As far as your app is concerned, the customized widget behaves the same as the default Okta-hosted widget and you can use the same [hosted flow][].

### Embedded (self-hosted)

For a completely seamless experience that allows for the highest level of customization, you can embed the Sign-In Widget directly into your application. This allows full use of the widget's [configuration](#configuration) and [API](#api-reference).

Using an embedded widget for client-side web and native apps can avoid the round-trip redirect of the [hosted flow][]. An embedded widget can perform the [OIDC][] flow and return [OAuth][] tokens directly within the application. See [showSignInToGetTokens](#showsignintogettokens).

Server-side web applications using the [authorization code flow][] complete the [OIDC][] flow and receive [OAuth][] tokens on the server, so they **must use a redirect flow**. These apps should use [showSignInAndRedirect](#showsigninandredirect).

Organizations using the Okta [Identity Engine][] should follow the [interaction code flow](#interaction-code-flow).

You can embed the Sign-In Widget in your app by either including a script from the Okta CDN or bundling the npm module [@okta/okta-signin-widget](https://www.npmjs.com/package/@okta/okta-signin-widget) with your app.

#### Using the Okta CDN

Loading our assets directly from the CDN is a good choice if you want an easy way to get started with the widget or don't already have an existing build process that leverages [npm](https://www.npmjs.com/) for external dependencies.

To embed the Sign-in Widget via CDN, include links to the JS and CSS files in your HTML:

```html
<!-- Latest CDN production Javascript and CSS -->
<script src="https://global.oktacdn.com/okta-signin-widget/6.1.2/js/okta-sign-in.min.js" type="text/javascript"></script>

<link href="https://global.oktacdn.com/okta-signin-widget/6.1.2/css/okta-sign-in.min.css" type="text/css" rel="stylesheet"/>
```

The CDN URLs contain a version number. This number should be the same for both the Javascript and the CSS file and match a version on the [releases page](../../releases).

The standard JS asset served from our CDN includes polyfills via [`core-js`](https://github.com/zloirock/core-js) and [`regenerator-runtime`](https://github.com/facebook/regenerator/blob/master/packages/regenerator-runtime/runtime.js) to ensure compatibility with older browsers.

```html
<!-- Latest CDN production Javascript without polyfills -->
<script src="https://global.oktacdn.com/okta-signin-widget/6.1.2/js/okta-sign-in.no-polyfill.min.js" type="text/javascript"></script>
```

#### Using the npm module

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

This installs the latest version of the Sign-in Widget to your project's `node_modules` directory.

The widget source files and assets are installed to `node_modules/@okta/okta-signin-widget/dist`, and have this directory structure:

```bash
node_modules/@okta/okta-signin-widget/dist/
├── css/
│   │   # Main CSS file for widget styles
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

3. Make sure you include ES6 polyfills with your bundler if you need the broadest browser support. 

#### Examples

##### SPA Application

Although a `redirectUri` is required in the configuration, no redirection occurs using this flow. The Sign-in Widget will communicate with Okta and receive tokens directly.

```javascript
var signIn = new OktaSignIn(
  {
    baseUrl: 'https://{yourOktaDomain}',
    clientId: '{{clientId of your OIDC app}}',
    redirectUri: '{{redirectUri configured in OIDC app}}'
  }
);

signIn.showSignInToGetTokens({
  // Assumes there is an empty element on the page with an id of 'osw-container'
  el: '#osw-container'
}).then(function(tokens) {
  // Store tokens
}).catch(function(error) {
  // Handle error
});
```

[PKCE][] is enabled by default for new SPA applications. (SPA applications can enable or disable `PKCE` in the Okta Admin Console under the `General Settings` for the application.) Although [PKCE][] is recommended for SPA applications, the [implicit flow][] is supported. To use [implicit flow][] in a SPA Application, set `authParams.pkce` to `false`, as shown:

```javascript
var signIn = new OktaSignIn(
  {
    baseUrl: 'https://{yourOktaDomain}',
    clientId: '{{clientId of your OIDC app}}',
    redirectUri: '{{redirectUri configured in OIDC app}}',
    authParams: {
      pkce: false,
    }
  }
);
```

##### Web Application

This example uses the [authorization code flow][]

```javascript
var signIn = new OktaSignIn(
  {
    baseUrl: 'https://{yourOktaDomain}',
    clientId: '{{clientId of your OIDC app}}',
    redirectUri: '{{redirectUri configured in OIDC app}}',
    authParams: {
      pkce: false,
      responseType: 'code'
    }
  }
);

// When the authorization flow is complete there will be a redirect to Okta.
// Okta's servers will process the information and then redirect back to your application's `redirectUri`
// If successful, an authorization code will exist in the URL as the "code" query parameter
// If unsuccesful, there will be an "error" query parameter in the URL
signIn.showSignInAndRedirect({
  // Assumes there is an empty element on the page with an id of 'osw-container'
  el: '#osw-container'
}).catch(function(error) {
  // Handle error
});
```

### Non-OIDC Applications

In most cases, the widget will be used to authenticate users into an [OIDC][] application. However, the Sign-in widget can also be used to authenticate a user outside of an OIDC application.

To disable OIDC, do not set an [OIDC configuration](#openid-connect). The [renderEl](#renderel) method can be used to perform the authentication flow.

> **Note**:
 [API](#api-reference) methods used to obtain tokens, such as [showSignInToGetTokens](#showsignintogettokens) or [showSignInAndRedirect](#showsigninandredirect) require an [OIDC configuration](#openid-connect)

```javascript
var signIn = new OktaSignIn({
  baseUrl: 'https://{yourOktaDomain}',
})

signIn.renderEl({
    // Assumes there is an empty element on the page with an id of 'osw-container'
    el: '#osw-container'
}).then(function(res) {
  if (res.status === 'SUCCESS') {
    // user is authenticated
    console.log('user is authenticated', res.user);
  }
})
```

## API Reference

### Interaction Code Flow

Support for the interaction code grant is available for organizations with the [Identity Engine](#okta-identity-engine) feature enabled. Please visit [Migrating to OIE](https://developer.okta.com/docs/guides/migrate-to-oie/) for more details.

Documentation for configuring the Okta Sign-in Widget for the interaction code grant is [available here](https://github.com/okta/okta-signin-widget/blob/master/docs/interaction_code_flow.md#setup).

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

For [OIDC][] applications, including [Social Login][], you will want to provide the [OIDC configuration](#openid-connect):

```javascript
var signIn = new OktaSignIn(
  {
    baseUrl: 'https://{yourOktaDomain}',
    clientId: '{{clientId of your OIDC app}}',
    redirectUri: '{{redirectUri configured in OIDC app}}'
  }
);
```

### showSignIn

> **Note**:
 The showSignIn method is backward compatible. You can use it with both Okta Identity Engine (as of Widget v5.5.0) and Okta Classic Engine.

Recommended for most use cases. [Server-side web apps](https://developer.okta.com/code/javascript/okta_sign-in_widget/#server-side-web-application-using-authorization-code-flow) should use the [showSignInAndRedirect](#showsigninandredirect) method.

Renders the widget to the DOM to prompt the user to sign in. On success, the promise resolves. On error, the promise rejects. If a redirect, redirects to Okta or another identity provider (IdP). The responses and errors are the same as those for [renderEl](#renderel).

The following properties are available when using the `showSignIn` method:
* `el` *(optional) - CSS selector which identifies the container element that the widget attaches to. If omitted, defaults to the value passed in during the construction of the Widget.
* `clientId` (optional) - Client Id pre-registered with Okta for the OIDC authentication flow. If omitted, defaults to the value passed in during the construction of the Widget.
* `redirectUri` (optional) - The URL that is redirected to after authentication. You must be pre-register this URL as part of client registration. Defaults to the current origin.
* `scopes` *(optional)* - Specify what information to make available in the returned access or ID token. If omitted, defaults to the value of `authParams.scopes` passed in during construction of the Widget. Defaults to `['openid', 'email']`.

Here is a code snippet that shows how to use `showSignIn`:
```javascript
var signIn = new OktaSignIn({
   // Assumes there is an empty element on the page with an id of ‘osw-container’
  el: ‘#osw-container’,
  clientId: '{{clientId of your OIDC app}}',
  redirectUri: '{{redirectUri configured in OIDC app}}',
  baseUrl: ‘https://{yourOktaDomain},
  authParams: {
    issuer: 'https://{yourOktaDomain}/oauth2/default'
  }
});

oktaSignIn.showSignIn().then(response
=> {
oktaSignIn.authClient.handleLoginRedirect(res.tokens);
})
  .catch(function(error) {
    // This function is invoked with errors the widget cannot recover from:
    // Known errors: CONFIG_ERROR, UNSUPPORTED_BROWSER_ERROR
    console.log('login error', error);
  });
```

### showSignInToGetTokens

Returns a Promise. Renders the widget to the DOM to prompt the user to sign in. On successful [authentication][], the Promise will be resolved to an object containing [OAuth][] tokens.

* `options`
  * `el` *(optional) - CSS selector which identifies the container element that the widget attaches to. If omitted, defaults to the value passed in during the construction of the Widget.
  * `clientId` *(optional)* - Client Id pre-registered with Okta for the [OIDC][] authentication flow. If omitted, defaults to the value passed in during the construction of the Widget.
  * `redirectUri` *(optional)* - The url that is redirected to after [authentication][]. This must be pre-registered as part of client registration. Defaults to the current origin.
  * `scopes` *(optional)* - Specify what information to make available in the returned access or ID token. If omitted, defaults to the value of `authParams.scopes` passed in during construction of the Widget. Defaults to `['openid', 'email']`

```javascript
var signIn = new OktaSignIn({
  // Assumes there is an empty element on the page with an id of 'osw-container'
  el: '#osw-container',
  clientId: '{{myClientId}}',
  redirectUri: '{{redirectUri configured in OIDC app}}',
  baseUrl: 'https://{yourOktaDomain}'
});

signIn.showSignInToGetTokens({
  scopes: ['openid', 'profile'] // optional
}).then(function(tokens) {
  // Store tokens
}).catch(function(error) {
  // This function is invoked with errors the widget cannot recover from:
  // Known errors: CONFIG_ERROR, UNSUPPORTED_BROWSER_ERROR
});
```

### showSignInAndRedirect

Returns a Promise. Renders the widget to the DOM to prompt the user to sign in. On successful [authentication][], the browser will be redirected to Okta with information to begin a new session. Okta's servers will process the information and then redirect back to your application's `redirectUri`. If successful, an authorization code will exist in the URL as the "code" query parameter. If unsuccessful, there will be an "error" query parameter in the URL.

* `options`
  * `el` *(optional) - CSS selector which identifies the container element that the widget attaches to. If omitted, defaults to the value passed in during the construction of the Widget.
  * `clientId` *(optional)* - Client Id pre-registered with Okta for the [OIDC][] authentication flow. If omitted, defaults to the value passed in during the construction of the Widget.
  * `redirectUri` *(optional)* - The url that is redirected to after [authentication][]. This must be pre-registered as part of client registration. Defaults to the current origin.

```javascript
var signIn = new OktaSignIn({
  // Assumes there is an empty element on the page with an id of 'osw-container'
  el: '#osw-container'
  baseUrl: 'https://{yourOktaDomain}',
  clientId: '{{clientId of your OIDC app}}',
  redirectUri: '{{redirectUri configured in OIDC app}}',
  authParams: {
    pkce: false,
    responseType: 'code'
  }
});

signIn.showSignInAndRedirect().catch(function(error) {
  // This function is invoked with errors the widget cannot recover from:
  // Known errors: CONFIG_ERROR, UNSUPPORTED_BROWSER_ERROR
});
```

### renderEl

Returns a Promise. Renders the widget to the DOM. On success, the promise will resolve. On error, the promise will reject. Also accepts a `success` or `error` callback function.

> :warning: This method provides access to internal and/or undocumented features for non-OIDC flows. For OIDC flows, we recommend using [showSignInToGetTokens](#showsignintogettokens) or [showSignAndRedirect](#showsigninandredirect).

- `options`
  - `el` *(optional)* - CSS selector which identifies the container element that the widget attaches to. If omitted, defaults to the value passed in during the construction of the Widget.
- `success` *(optional)* - Function that is called when the user has completed an authentication flow. If an [OpenID Connect redirect flow](#openid-connect) is used, this function can be omitted. See below for more details.
- `error` *(optional)* - Function that is called when the widget has been initialized with invalid config options, or has entered a state it cannot recover from. If omitted, a default function is used to output errors to the console.

#### success

Function that handles non-error events, including the completion of a successful authentication flow by a user. Also handles other flows such as reset password and self-registration flows.

_OIDC vs Non-OIDC Configurations:_

New integrations are recommended to use OIDC as it uses a more lightweight REST-based protocol and has more widespread usage. Less common is the need for non-OIDC integrations in self-hosted applications, however one example of this usage is when using the Okta-hosted sign-in widget to redirect a user to the Okta Dashboard after authentication.

*`res` parameter:*

This `success` function will be called with an object, that can have various properties, depending on how the widget is configured:

```javascript
success({
  status: String,
  username: optional<string>,
  activationToken: optional<object>,
  tokens: optional<object>,
  type: optional<string>,
  user: optional<object>,
  stepUp: optional<function>,
  session: optional<object>,
  next: optional<function>,
})
```

- `status` *(string)* - Always present. One of: `FORGOT_PASSWORD_EMAIL_SENT`, `UNLOCK_ACCOUNT_EMAIL_SENT`, `ACTIVATION_EMAIL_SENT`, `REGISTRATION_COMPLETE`, or `SUCCESS`

- `username` *(optional\<string\>)* - Only present when `status` is one of `FORGOT_PASSWORD_EMAIL_SENT`, `UNLOCK_ACCOUNT_EMAIL_SENT`, `ACTIVATION_EMAIL_SENT`, or `REGISTRATION_COMPLETE`.

- `activationToken` *(optional\<object\>)* - Only present when `status` is `REGISTRATION_COMPLETE`.

- `tokens` *(optional\<object\>)* - Only present when widget is in an OIDC configuration, and `status` is `SUCCESS`. Depending on the widget `responseType` configuration, this will contain an `accessToken` only or both `accessToken` and `idToken`.

- `type` *(optional\<string\>)* - Only present when widget is in a non-OIDC configuration and `status` is `SUCCESS`. One of `SESSION_STEP_UP`, or `SESSION_SSO`.

- `user` *(optional\<object\>)* - Only present when widget is in a non-OIDC configuration, `status` is `SUCCESS`, and `type` is `SESSION_STEP_UP`.

- `stepUp` *(optional\<function\>)* - Only present when widget is in a non-OIDC configuration, `status` is `SUCCESS`, and `type` is `SESSION_STEP_UP`. `res.stepUp.finish()` call redirect the user to the URL at `res.stepUp.url`.

- `next` *(optional\<function\>)* - May be present when widget is in a non-OIDC configuration, `status` is `SUCCESS`, and the response contains a redirect URL. Calling this function redirects the user.

- `session` *(optional\<object\>)* - Only present when widget is in a non-OIDC configuration, `status` is `SUCCESS`, and `type` is `SESSION_SSO`. `res.session.setCookieAndRedirect(url)` redirects the user to the passed URL.

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
signIn.authClient.session.exists()
.then(function(exists) {
  if (exists){
    console.log('A session exists!');
  } else {
    console.log('A session does not exist.');
  };
});
```

The `authClient` can be set directly in the configuration:

```javascript
var authClient = new OktaAuth({
  issuer: 'https://{yourOktaDomain}/oauth2/default',
  clientId: '{yourClientId}'
});
var config = {
  baseUrl: 'https://{yourOktaDomain}',
  authClient: authClient
};

var signIn = new OktaSignIn(config);
// signIn.authClient === authClient
```

If no `authClient` option is set, an instance will be created using `authParams`:

```javascript
var config = {
  baseUrl: 'https://{yourOktaDomain}',
  authParams: {
    issuer: 'https://{yourOktaDomain}/oauth2/default',
    clientId: '{yourClientId}'  
  }
};

var signIn = new OktaSignIn(config);
// signIn.authClient.options.clientId === '{yourClientId}'
```

### before

> **Note**: This function is only supported when using the [Okta Identity Engine](#okta-identity-engine)

Adds an asynchronous [hook](#hooks) function which will execute before a view is rendered.

```javascript
var config = {
  baseUrl: 'https://{yourOktaDomain}',
  authParams: {
    issuer: 'https://{yourOktaDomain}/oauth2/default',
    clientId: '{yourClientId}'  
  },
  useInteractionCodeFlow: true
};
var signIn = new OktaSignIn(config);
signIn.before('success-redirect', async () => {
  // custom logic can go here. when the function resolves, execution will continue.
});

```

### after

> **Note**: This function is only supported when using the [Okta Identity Engine](#okta-identity-engine)

Adds an asynchronous [hook](#hooks) function which will execute after a view is rendered.

```javascript
var config = {
  baseUrl: 'https://{yourOktaDomain}',
  authParams: {
    issuer: 'https://{yourOktaDomain}/oauth2/default',
    clientId: '{yourClientId}'  
  },
  useInteractionCodeFlow: true
};
var signIn = new OktaSignIn(config);
signIn.after('identify', async () => {
  // custom logic can go here. when the function resolves, execution will continue.
});

```

## Configuration

For non-OIDC applications, the only required configuration option is `baseUrl`. All others are optional.

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
    // Configuration for the internal authClient. See https://github.com/okta/okta-auth-js#configuration-options
  }
};

var signIn = new OktaSignIn(config);
```

### OIDC Applications

For OIDC applications, you need to set the `clientId` and `redirectUri`. If `issuer` is not set, it will be inferred from `baseUrl`.

```javascript
var config = {
  baseUrl: 'https://{yourOktaDomain}', // issuer will be https://{yourOktaDomain}/oauth2/default
  clientId: '{{clientId of your OIDC app}}',
  redirectUri: '{{redirectUri configured in OIDC app}}'
}
```

By default, the issuer ([Authorization Server][]) will be set to the default [Custom Authorization Server][].

```javascript
// default issuer
config.baseUrl + '/oauth2/default'
```

A different [Custom Authorization Server][] can be specified by setting the `issuer` explicitly:

```javascript
var config = {
  issuer: 'https://{yourOktaDomain}/oauth2/custom',
  clientId: '{{clientId of your OIDC app}}',
  redirectUri: '{{redirectUri configured in OIDC app}}'
}
```

If `issuer` is set, there is no need to set `baseUrl`.

Some applications, such as those that require access to the Okta User API, will want to use the Okta Organization [Authorization Server][] as the issuer. In this case the `issuer` should match your Okta domain:

```javascript
var config = {
  issuer: 'https://{yourOktaDomain}',
  clientId: '{{clientId of your OIDC app}}',
  redirectUri: '{{redirectUri configured in OIDC app}}',
}
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

- **logoText:** Text for `alt` attribute of the logo image, logo text will only show up when logo image is not available

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

  **Note:** If you want to use language that is not supported by widget, you need to host `login_{lang}.json` and `country_{lang}.json` files that should be accesible under path `{assets.baseUrl}/labels/json/`, where `{lang}` is your language code and `{assets.baseUrl}` is url to your assets (can be `/` to point on current domain). Example of JSON language files you can find after building widget in folder `packages/@okta/i18n/src/json`. The list of supported languages can be specified with the `assets.languages` option.

- **defaultCountryCode:** Set the default countryCode of the widget. If no `defaultCountryCode` is provided, defaults to `US`. It sets the country calling code for phone number accordingly in the widget.

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

- **assets.languages** Specify the list of supported languages which are hosted and accesible under the path `{assets.baseUrl}/labels/json/`. This option supersedes the default list of supported languages. If an unsupported language is requested (explicitly using the `language` option or automatically by browser detection), the default language (`en`) will be used.

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
  factorPage: {
    text: 'Need help with MFA?',
    href: 'https://acme.com/mfa-help',
  },
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

- **helpLinks.factorPage** - Custom link object `{text, href}` that will be added to all MFA pages.

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
    window.location.href = 'https://www.example.com';
  }
}]

// An example that adds a custom button with a localized title underneath the login form on the primary auth page
i18n: {
  en: {
    'customButton.title': 'Custom Button Title',
  },
},
customButtons: [{
  i18nKey: 'customButton.title',
  className: 'btn-customAuth',
  click: function() {
    // clicking on the button navigates to another page
    window.location.href = 'https://www.example.com';
  }
}]
```

- **customButtons.title** - String that is set as the button text (set only one of `title` OR `i18nKey`)

- **customButtons.i18nKey** - Custom translation key for button text specified in `i18n` config option (set only one of `title` OR `i18nKey`)

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

IdP Discovery enables you to route users to different 3rd Party IdPs that are connected to your Okta Org. Users can federate back into the primary org after authenticating at the IdP.

To use IdP Discovery in your application, configure an [identity provider routing rule](https://help.okta.com/en/prod/Content/Topics/Security/configure-routing-rules.htm) in the Okta admin panel.
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

**Note:** IdP Discovery is supported for Okta-hosted Widget setup only. IdP Discovery for self-hosted Widget is not officialy supported by v1 API and requires an extra step to complete OIDC flow. This step involves calling [`session.exists`](https://github.com/okta/okta-auth-js#sessionexists) and [`token.getWithoutPrompt`](https://github.com/okta/okta-auth-js#tokengetwithoutpromptoptions) methods which rely on third party cookies to be available. The below snippet applies to a SPA app hosting Sign-In Widget:

```javascript
var signIn = new OktaSignIn({
  baseUrl: 'https://{yourOktaDomain}',
  clientId: '{appClientId}',
  ... ...
  features: {
    idpDiscovery: true
  },
  idpDiscovery: {
    requestContext: window.location.href
  }
});

... ...

// after successful authentication with IdP
signIn.authClient.session.exists().then(function (sessionExists) {
  if (sessionExists) {
    signIn.authClient.token.getWithoutPrompt().then(function (response) {
      signIn.authClient.tokenManager.setTokens(response.tokens);
    });
  }
}
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

Options for the [OAuth][] Open ID Connect ([OIDC][]) authentication flow.

OIDC flow is required for [Social Login][].

| **Note**: Configuration values can be found in the Okta Admin UI under the application's "General Settings"

- **issuer:** Specify a custom issuer to perform the [OIDC][] flow. Defaults to the baseUrl plus "/oauth2/default". See the guide on setting up a [Custom Authorization Server][] for more information.

- **clientId:** Client Id of the application. Required for OIDC flow. If this option is not set, all other options in [this section](#openid-connect) are ignored.

    ```javascript
    clientId: 'GHtf9iJdr60A9IYrR0jw'
    ```

- **redirectUri:** For redirect flows, this URI will be used as the [callback][] url. If no `redirectUri` is provided, defaults to the current origin. (In this example, `https://acme.com`)

    ```javascript
    redirectUri: 'https://acme.com/oauth2/callback/home'
    ```

| **Note**: The value for `redirectUri` (or current origin) **must be listed** in the set of "Login Redirect URIs" shown on the application's "General Settings" in the Okta Admin UI

- **idps:** External Identity Providers to use in OIDC authentication, also known as [Social Login][]. Supported IDPs are declared with a `type` and will get distinct styling and default i18n text, while any other entry will receive a general styling and require text to be provided.  Each IDP can have additional CSS classes added via an optional `className` property.

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

    The `APPLE`, `FACEBOOK`, `GOOGLE`, `LINKEDIN`, and `MICROSOFT` IdP types are available to all organizations. The following IdP types are currently in [Self-Service Early Access](https://developer.okta.com/docs/reference/releases-at-okta/#early-access-ea): `ADOBE`, `AMAZON`, `DISCORD`, `FACEBOOK`, `GITHUB`, `GITLAB`, `LINE`, `ORCID`, `PAYPAL`, `PAYPAL_SANDBOX`, `QUICKBOOKS`, `SALESFORCE`, `SPOTIFY`, `XERO`, `YAHOO`, and `YAHOOJP`.

- **idpDisplay:** Display order for external [identity providers][] relative to the Okta login form. Defaults to `SECONDARY`.

    - `PRIMARY` - Display External IDP buttons above the Okta login form
    - `SECONDARY` - Display External IDP buttons below the Okta login form

    ```javascript
    idpDisplay: 'PRIMARY'
    ```

- **oAuthTimeout:** Timeout for [OIDC][] authentication flow requests, in milliseconds. If the authentication flow takes longer than this timeout value, an error will be thrown and the flow will be cancelled. Defaults to `12000`.

    ```javascript
    oAuthTimeout: 300000 // 5 minutes
    ```

- **authClient:** An [AuthJS](https://github.com/okta/okta-auth-js) instance. This will be available on the widget instance as the [authClient](#authclient) property. 
 **Note:** If the `authClient` option is used, `authParams` will be ignored.

- **authParams:** An object containing configuration which is used to create the internal [authClient`](#authclient). Selected options are described below. See the full set of [Configuration options](https://github.com/okta/okta-auth-js#configuration-options). Certain options, such as `clientId`, `redirectUri`, and `issuer` can be set either as top-level configuration options or inside `authParams`. Values in `authParams` are more specific and will override values specified at the top-level.

- **authParams.pkce:** Set to `false` to disable [PKCE][] flow

- **authParams.display:** Specify how to display the [authentication][] UI for external [identity providers][]. Defaults to `popup`.

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

- **authParams.responseMode:** Specify how the [authorization][] response should be returned. You will generally not need to set this unless you want to override the default values for your `authParams.display` and `authParams.responseType` settings.

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

- **authParams.responseType:** Specify the response type for [OIDC][] [authentication][]. Defaults to `['id_token', 'token']`.

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

- **authParams.scopes:** Specify what information to make available in the returned `id_token` or `access_token`. For [OIDC][], you must include `openid` as one of the scopes. Defaults to `['openid', 'email']`.

    Valid OIDC scopes: `openid`, `email`, `profile`, `address`, `phone`

    ```javascript
    authParams: {
      scopes: ['openid', 'email', 'profile', 'address', 'phone']
    }
    ```

- **authParams.state:** Specify a state that will be validated in an [OAuth][] response. This is usually only provided during redirect flows to obtain an authorization code. Defaults to a random string. This value can be retrieved from the URL on the login redirect [callback][]. For more information on handling the redirect [callback][], see [authClient.token.parseFromUrl()](https://github.com/okta/okta-auth-js#tokenparsefromurloptions)

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

- **authParams.issuer:** Specify a custom issuer to perform the [OIDC][] flow. Defaults to the baseUrl plus "/oauth2/default". See the guide on setting up a [Custom Authorization Server][] for more information.

    ```javascript
    authParams: {
      issuer: 'https://{yourOktaDomain}/oauth2/default'
    }
    ```

- **authParams.authorizeUrl:** Specify a custom authorizeUrl to perform the [OIDC][] flow. Defaults to the issuer plus "/v1/authorize".

    ```javascript
    authParams: {
      issuer: 'https://{yourOktaDomain}/oauth2/default',
      authorizeUrl: 'https://{yourOktaDomain}/oauth2/default/v1/authorize'
    }
    ```

- **authScheme:** Authentication scheme for [OIDC][] [authentication][]. You will normally not need to override this value. Defaults to `OAUTH2`.

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

- **features.scrollOnError** - By default, errors will be scrolled into view. Set to `false` to disable this behavior.

- **features.skipIdpFactorVerificationBtn** - Automatically redirects to the selected Identity Provider when selected from the list of factors. Defaults to `false`.

### Hooks

> **Note**: Hooks are only supported when using the [Okta Identity Engine](#okta-identity-engine)

Asynchronous callbacks can be invoked before or after a specific view is rendered. Hooks can be used to add custom logic such as tracking, logging, or additional user input. Normal execution is blocked while the hooks is executing and will resume after the Promise returned from the hook function resolves. Hooks can be added via config, as shown below, or at runtime using the [before](#before) or [after](#after) methods. The full list of views can be found in [RemediationConstants.js](https://github.com/okta/okta-signin-widget/blob/master/src/v2/ion/RemediationConstants.js#L19).

```javascript
// Hooks can be added via config
const config = {
  hooks: {
    'identify': {
      after: [
        async function afterIdentify() {
          // custom logic goes here
        }
      ]
    },
    'success-redirect': {
      before: [
        async function afterIdentify() {
          // custom logic goes here
        }
      ]
    }
  }
};

// Hooks can also be added at runtime
signIn.before('success-redirect', async () => {
  // custom logic goes here
});

signIn.after('identify', async () => {
  // custom logic goes here
});

```

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
// Overriding the "Back to sign in" click action on the Forgot Password page
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

3. Create a `.widgetrc.js` file in the `okta-signin-widget` directory with an entry for `baseUrl`.

    ```javascript
    module.exports = {
      baseUrl: 'https://{yourOktaDomain}',
      logoText: 'Windico',
      features: {
        rememberMe: true,
      },
    }
    ```

4. Build the widget, start a local connect server that hosts it, and launch a browser window with the widget running.

    ```bash
    yarn start
    ```

    or start local connect server in watch mode, changes in `src/` and `assets/sass/` folders will trigger browser auto reload.

    ```bash
    yarn start --watch
    ```

5. Finally, enable CORS support for our new server by [following these instructions](http://developer.okta.com/docs/guides/okta_sign-in_widget.html#configuring-cors-support-on-your-okta-organization). You can now authenticate to Okta using your very own, customizable widget!

### Build and test commands

| Command                           | Description                                                                                                                                            |
|-----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| `yarn start`                      | Build the widget, start the server, and open a browser window with the widget loaded                                                                   |
| `yarn start --watch`              | Build the widget, start the server, and open a browser window with the widget loaded and watch on widget js and sass changes                           |
| `yarn build:dev`                  | Build an unminified version of the widget                                                                                                              |
| `yarn build:release`              | Build a minified, uglified version of the widget (`okta-sign-in.min.js`) and a non-minified **development** version of the widget (`okta-sign-in.js`). |
| `yarn test -t karma`              | Run unit tests using Karma                                                                                                                             |
| `yarn test -t karma --suiteHelp`  | Display optional test suite options                                                                                                                    |
| `yarn test -t jest`               | Run unit tests using Jest                                                                                                                              |
| `yarn test -t jest --suiteHelp`   | Display optional test suite options                                                                                                                    |
| `yarn test -t testcafe <browser>` | Run testcafe tests on selected browser (example: `yarn test -t testcafe chrome`)                                                                       |
| `yarn lint`                       | Run eslint and scss linting tests                                                                                                                      |

### Local development workflow using `yarn link`

When developing locally, you may want to test local changes to the widget in another project, which is also local. To use `yarn link` locally, follow these steps:

In `okta-signin-widget` directory:

```bash
yarn build:release
yarn link
yarn build:webpack-dev --output-path ./dist/js --output-filename okta-sign-in.entry.js --watch
```

This will watch for changes in signin widget source code and automatically rebuild to the dist directory.

In your other local project directory:

```bash
yarn link @okta/okta-signin-widget
```

### Utilizing Pseudo-loc

> :warning: This tool requires access to Okta's internal registry via the VPN.

A pseudo-localized language is a test language created to identify issues with the internationalization process. Generated from `login.properties` English resources, the pseudo-loc properties file can be used to test UI's for English leaks and CSS layout issues caused due to localization.

To generate pseudo-loc, run the following command:

```sh
# Navigate into the pseudo-loc package
[okta-signin-widget]$ cd packages/@okta/pseudo-loc/

# Install all required dependencies and generate login_ok_PL.properties
# NOTE: This requires VPN access
[pseudo-loc]$ yarn install
[pseudo-loc]$ yarn pseudo-loc
```

Finally, update the `.widgetrc.js` file to use the `ok_PL` language, and start the [widget playground](#build-and-test-commands).

```js
module.exports = {
  baseUrl: 'https://{yourOktaDomain}',
  language: 'ok-PL',
  ...
}
```

## Browser support

Need to know if the Sign-In Widget supports your browser requirements?  Please see [Platforms, Browser, and OS Support](https://help.okta.com/en/prod/Content/Topics/Miscellaneous/Platforms_Browser_OS_Support.htm).

## Contributing

We're happy to accept contributions and PRs! Please see the [contribution guide](CONTRIBUTING.md) to understand how to structure a contribution.

