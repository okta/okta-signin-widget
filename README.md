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
[interaction code]: https://developer.okta.com/docs/concepts/interaction-code/
[okta-auth-js]: https://github.com/okta/okta-auth-js
[Email Magic Link/OTP]: https://developer.okta.com/docs/guides/authenticators-okta-email/-/main/
[Classic Engine]: https://github.com/okta/okta-signin-widget/blob/master/docs/classic.md
[polyfill]: https://github.com/okta/okta-signin-widget/blob/master/scripts/buildtools/webpack/polyfill.js
<!-- end links -->

<!-- omit in toc -->
# Okta Sign-In Widget

The Okta Sign-In Widget is a Javascript widget that provides a fully featured and customizable login experience which can be used to authenticate and register users in web and mobile applications.

The widget is used on [Okta's default signin page](#okta-hosted-sign-in-page-default) to start an Okta SSO session and set the Okta [session cookie][] in the web browser. It can also perform an [OIDC][] flow to easily integrate your web or mobile applications into the Okta platform.

A [custom Okta-hosted signin page](#okta-hosted-sign-in-page-customizable) can be configured to use your organization's domain name and branding.

The widget can also be [embedded directly](#embedded-self-hosted) into your organization's web or mobile applications for a seamless user experience.

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
    - [Flow](#flow)
    - [Redirect Callbacks](#redirect-callbacks)
      - [OAuth callback](#oauth-callback)
      - [Social/IDP callback](#socialidp-callback)
      - [Email verify callback](#email-verify-callback)
- [API Reference](#api-reference)
  - [OktaSignIn](#oktasignin)
  - [showSignIn](#showsignin)
  - [showSignInAndRedirect](#showsigninandredirect)
  - [hide](#hide)
  - [show](#show)
  - [remove](#remove)
  - [on](#on)
  - [off](#off)
  - [authClient](#authclient)
  - [before](#before)
  - [after](#after)
- [Configuration](#configuration)
  - [Basic config options](#basic-config-options)
    - [issuer](#issuer)
    - [clientId](#clientid)
    - [redirectUri](#redirecturi)
    - [useInteractionCodeFlow](#useinteractioncodeflow)
    - [codeChallenge](#codechallenge)
    - [state](#state)
    - [otp](#otp)
    - [scopes](#scopes)
    - [idpDisplay](#idpdisplay)
  - [Brand](#brand)
    - [logo](#logo)
    - [logoText](#logotext)
    - [brandName](#brandname)
    - [colors](#colors)
      - [colors.brand](#colorsbrand)
  - [Localization](#localization)
    - [Supported languages](#supported-languages)
    - [language](#language)
    - [defaultCountryCode](#defaultcountrycode)
    - [i18n](#i18n)
  - [assets](#assets)
    - [assets.baseUrl](#assetsbaseurl)
    - [assets.languages](#assetslanguages)
    - [assets.rewrite](#assetsrewrite)
  - [Links](#links)
    - [Back to sign in link](#back-to-sign-in-link)
    - [Sign up link](#sign-up-link)
    - [registration.click](#registrationclick)
    - [Help Links](#help-links)
      - [helpLinks.help](#helplinkshelp)
      - [helpLinks.forgotPassword](#helplinksforgotpassword)
      - [helpLinks.unlock](#helplinksunlock)
      - [helpLinks.custom](#helplinkscustom)
  - [Hooks](#hooks)
  - [Username and password](#username-and-password)
    - [transformUsername](#transformusername)
  - [Registration](#registration)
    - [parseSchema](#parseschema)
    - [preSubmit](#presubmit)
    - [postSubmit](#postsubmit)
    - [Handling registration callback errors](#handling-registration-callback-errors)
      - [Use the default error](#use-the-default-error)
      - [Display a form error](#display-a-form-error)
      - [Display a form field error](#display-a-form-field-error)
  - [Custom Buttons](#custom-buttons)
    - [customButtons.title](#custombuttonstitle)
    - [customButtons.i18nKey](#custombuttonsi18nkey)
    - [customButtons.className](#custombuttonsclassname)
    - [customButtons.click](#custombuttonsclick)
  - [Feature flags](#feature-flags)
    - [features.showPasswordToggleOnSignInPage](#featuresshowpasswordtoggleonsigninpage)
    - [features.showIdentifier](#featuresshowidentifier)
    - [features.hideSignOutLinkInMFA](#featureshidesignoutlinkinmfa)
    - [features.rememberMe](#featuresrememberme)
    - [features.autoFocus](#featuresautofocus)
- [Events](#events)
  - [ready](#ready)
  - [afterError](#aftererror)
  - [afterRender](#afterrender)
- [Building the Widget](#building-the-widget)
  - [Build and test commands](#build-and-test-commands)
  - [Local development workflow using `yarn link`](#local-development-workflow-using-yarn-link)
  - [Utilizing Pseudo-loc](#utilizing-pseudo-loc)
- [Browser support](#browser-support)
- [Contributing](#contributing)

## Okta Identity Engine

The Okta [Identity Engine][] (OIE) is a platform service that allows enterprises to build more flexible access experiences that are tailored to their organizational needs. The Okta Sign-in Widget supports OIE in all [usage](#usage-guide) scenarios.

> **Note**:
Unless otherwise noted, this README assumes you are using [Identity Engine][]. Information on using the widget with the [Classic Engine][] can be found in [this document](https://github.com/okta/okta-signin-widget/blob/master/docs/classic.md)

## Related SDKs

The Sign-in Widget is self-contained and requires no other frameworks at runtime. However, there may be certain features your app needs such as token storage, renewal, or validation, which the widget does not provide.

These SDKs are fully compatible with the Okta Sign-in Widget and provide utilities to help integrate Okta [authentication][] end-to-end in your own application.

### Javascript

- [okta-auth-js](https://github.com/okta/okta-auth-js) (Browser or NodeJS)
- [okta-react](https://github.com/okta/okta-react)
- [okta-angular](https://github.com/okta/okta-angular)
- [okta-vue](https://github.com/okta/okta-vue)
  
### Java

- [okta-auth-java](https://github.com/okta/okta-auth-java)
- [okta-spring-boot](https://github.com/okta/okta-spring-boot)

### .Net

- [okta-auth-dotnet](https://github.com/okta/okta-auth-dotnet)

## Sample applications

Complete sample applications demonstrate usage of the Okta Sign-In Widget in both [Okta-hosted](#okta-hosted-sign-in-page-default) and [embedded](#embedded-self-hosted) scenarios.

- [Javascript (Browser/SPA)](https://github.com/okta/okta-auth-js/tree/master/samples/generated/static-spa)
- [Javascript (Express/NodeJS)](https://github.com/okta/okta-auth-js/tree/master/samples/generated/express-embedded-sign-in-widget)
- [React](https://github.com/okta/samples-js-react)
- [Angular](https://github.com/okta/samples-js-angular)
- [Vue](https://github.com/okta/samples-js-vue)
- [Asp.Net Core 2.x](https://github.com/okta/samples-aspnetcore)
- [ASP.Net Core 3.x](https://github.com/okta/samples-aspnetcore)
- [ASP.Net 4.x](https://github.com/okta/samples-aspnet)
- [ASP.Net Webforms](https://github.com/okta/samples-aspnet-webforms)
- [Golang](https://github.com/okta/samples-golang)
- [Java/Spring Boot](https://github.com/okta/samples-java-spring)
- [PHP](https://github.com/okta/samples-php)
- [Python/Flask](https://github.com/okta/samples-python-flask)

## Usage Guide

There are several ways to use the Okta Sign-in Widget:

- Okta provides a [default sign-in page](#okta-hosted-sign-in-page-default) for your organization, hosted at your organization's Okta URL.

- Okta supports an option to create a [custom domain][] with a highly [customizable Okta-hosted sign-in page](#okta-hosted-sign-in-page-customizable).

- You can [embed the widget](#embedded-self-hosted) directly into your application.

### Okta-hosted sign-in page (default)

Okta provides a sign-in page, available at your [organization][]'s URL, which allows the user to complete the entire authorization flow, start an SSO (Single Sign-On) session, and set the Okta [session cookie][] in the web browser. You can customize this page with a background image and logo. By default, signing in on this page redirects the user to the Okta user dashboard.

The default Okta-hosted sign-in page can also authenticate a user in an OIDC application. Your app can [redirect to a sign-in page][] to perform the [authentication][] flow, after which Okta redirects the user back to the app [callback][]. Okta provides [SDKs](#related-sdks) in many languages to help construct the redirect URL and handle the login [callback][] as part of the [hosted flow][].

Okta provides several complete [sample applications](#sample-applications) which demonstrate how to use the Okta [hosted flow][].

### Okta-hosted sign-in page (customizable)

Okta also provides a hosted sign-in page that can be customized so that it is available under a [custom domain][] which is a subdomain of your company's top-level domain. Although the page is hosted by Okta, you can [customize the template][] of this page in many powerful ways.

As far as your app is concerned, the customized widget behaves the same as the default Okta-hosted widget and you can use the same [hosted flow][].

> **Note:** There will be a configuration object on the page which contains all required values and enabled features. You will most likely not need to modify this object. If you find that you do need to modify this configuration, take care not to overwrite or remove any required values.

### Embedded (self-hosted)

For a completely seamless experience that allows for the highest level of customization, you can embed the Sign-In Widget directly into your application. This allows full use of the widget's [configuration](#configuration) and [API](#api-reference).

Using an embedded widget, client-side web and native apps can avoid the round-trip redirect of the [hosted flow][] in many cases. See [showSignIn](#showsignin).

Server-side web applications will receive [OAuth][] tokens server-side, so they **must handle a redirect callback**. These apps should use [showSignInAndRedirect](#showsigninandredirect).

You can embed the Sign-In Widget in your app by either including a script tag that pulls the widget from the [Okta CDN](#using-the-okta-cdn) or bundling the [NPM module](#using-the-npm-module) into your app.

#### Using the Okta CDN

Loading our assets directly from the CDN is a good choice if you want an easy way to get started with the Widget, don't already have an existing build process that leverages [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) for external dependencies, or any other reason where you don't want to bundle the Sign-in Widget into your application. 

The standard bundle (`okta-sign-in.min.js`) includes support for both [Classic Engine][] and the [Identity Engine][]. It also includes a [polyfill][] to ensure compatibility with older browsers such as IE11. If your application doesn't need to support IE11, you can include the `no-polyfill` bundle instead to decrease the loading time for first-time users.

| Bundle     | File Name                       | Approx. Size | Polyfill           | Notes                                      |
|------------|---------------------------------|--------------|--------------------|--------------------------------------------|
| standard   | okta-sign-in.min.js             | 1.8 MB       | :white_check_mark: | Standard bundle which includes everything  |
| no-polyfill| okta-sign-in.no-polyfill.min.js | 1.5 MB       |                    | Standard bundle without polyfill           |


To embed the Sign-in Widget via CDN, include links to the JS and CSS files in your HTML:

```html
<!-- Latest CDN production Javascript and CSS -->
<script src="https://global.oktacdn.com/okta-signin-widget/6.8.3/js/okta-sign-in.min.js" type="text/javascript"></script>

<link href="https://global.oktacdn.com/okta-signin-widget/6.8.3/css/okta-sign-in.min.css" type="text/css" rel="stylesheet"/>
```

**NOTE:** The CDN URLs contain a version number. This number should be the same for both the Javascript and the CSS file and match a version on the [releases page](https://github.com/okta/okta-signin-widget/releases). We recommend using the latest widget version.


#### Using the npm module

Using our npm module is a good choice if:

- You have a build system in place where you manage dependencies with [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
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

**NOTE:** If you're using TypeScript, you'll need to enable synthetic imports in your `tsconfig.json`.

```json
{
  ...
  "compilerOptions": {
    "allowSyntheticDefaultImports": true,
    ...
  }
}
```

Angular (TypeScript) projects require a simliar configuration, also in your `tsconfig.json`

```json
{
  ...
  "angularCompilerOptions": {
    "allowSyntheticDefaultImports": true,
    ...
  }
}
```

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

These simple examples should help you get started with using the Sign-in Widget. For complete end-to-end solutions, check out our [sample applications](#sample-applications).

##### SPA Application

A Single Page Application (SPA) runs completely in the browser. SPA applications authenticate using client-side flows and store [OAuth][] tokens in browser-based storage.

> **Note:** See [configuration](#configuration) for more information on these configuration values

```javascript
var signIn = new OktaSignIn(
  {
    issuer: 'https://{yourOktaDomain}/oauth2/default',
    clientId: '{{clientId of your OIDC app}}',
    redirectUri: '{{redirectUri configured in OIDC app}}',
    useInteractionCodeFlow: true
  }
);

signIn.showSignIn({
  // Assumes there is an empty element on the page with an id of 'osw-container'
  el: '#osw-container'
}).then(function(res) {
  // Most flows will not require any redirection. In these cases, tokens will be returned directly.
  // res.tokens is an object
  oktaSignIn.authClient.handleLoginRedirect(res.tokens);
}).catch(function(error) {
  // This function is invoked with errors the widget cannot recover from:
  // Known errors: CONFIG_ERROR, UNSUPPORTED_BROWSER_ERROR
});
```

##### Web Application

A web application runs primarily on the server. The widget, which executes client-side, will be embedded into an HTML page that includes a script block that configures and renders the widget. [OAuth][] tokens will be received server-side on the application's [login redirect callback](#oauth-callback).

> **Note:** See [configuration](#configuration) for more information on these configuration values

```javascript
var signIn = new OktaSignIn(
  {
    issuer: 'https://{yourOktaDomain}/oauth2/default',
    clientId: '{{clientId of your OIDC app}}',
    redirectUri: '{{redirectUri configured in OIDC app}}',
    useInteractionCodeFlow: true,
    state: '{{state passed from backend}}', // state can be any string, it will be passed on redirect callback
    codeChallenge: '{{PKCE code challenge from backend}}', // PKCE is required for interaction code flow
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
  // This function is invoked with errors the widget cannot recover from:
  // Known errors: CONFIG_ERROR, UNSUPPORTED_BROWSER_ERROR
});
```

#### Flow

In addition to the default authentication flow, the widget supports several pre-defined flows, which allow you to provide single-purpose HTML pages for several common use-cases.

By default, the Okta Sign-In Widget will either proceed with a current flow or start a new authenticate flow. The `flow` option allows bootstrapping the widget into a specific view such as register, unlock, or reset password. Supported flows:

- login
- signup
- resetPassword
- unlockAccount

> **Note:** A particular flow can only work if the admin has configured the org to allow the required operations
(example: if Profile Enrollment (User sign-up) in the admin console is not enabled, bootstrapping the widget with `flow: 'signup'` will result in an error)

```javascript
// login.html
new OktaSignIn({
  flow: 'login'
});

// signup.html
new OktaSignIn({
  flow: 'signup'
});

// reset_password.html
new OktaSignIn({
  flow: 'resetPassword'
});

// unlock_account.html
new OktaSignIn({
  flow: 'unlockAccount'
});
```

#### Redirect Callbacks

A redirect callback occurs when your app is reloaded in the browser as part of a [flow](#flow).
During a redirect callback, the app is loaded at a specific URL path that you have defined in your Okta App configuration. Most callbacks can only be handled once and will produce an error if there is an attempt to handle it twice. Typically, the app will redirect itself to a well known or previously saved URL path after the callback logic has been handled to avoid errors on page reload.

> **Note:** Most apps should be prepared to handle one or more redirect callbacks. Depending on how the App sign-on policy is configured, some SPA applications may be able to receive tokens without any redirect. However, logic will need to be added if the policy includes signing in with a [Social / IDP provider)](#socialidp-callback)) or allows authentication or account recovery using [email verification](#email-verify-callback).  

##### OAuth callback

The OAuth callback is the last step of the [interaction code][] flow. On successful [authentication][], the browser is redirected to Okta with information to begin a new session. Okta's servers process the information and then redirect back to your application's `redirectUri`. If successful, an [interaction code][] is present in the URL as the `interaction_code` query parameter. If unsuccessful, there is an `error` and `error_description` query parameters in the URL. Whether successful or not, the `state` parameter, which was originally passed to the widget by your application, will also be returned on the redirect. This can be used by server-side web applications to match the callback with the correct user session.

**All web applications will handle an OAuth callback**. For SPA applications, in many cases the sign-on policy will not require a redirect and these applications can receive tokens directly from [showSignIn](#showsignin). However, if the sign-on policy requires redirection for any reason (such as integration with a [Social / IDP provider](#socialidp-callback)) SPA apps will need to handle an Oauth callback. For this reason we recommend that **all SPA apps should be prepared to handle an OAuth callback**.

> **Note:** The widget does not handle an OAuth callback directly. Server-side web applications can use one of our [SDKs][#related-sdks] to help with handling the callback. SPA applications can use the [okta-auth-js][] SDK, which is included with the Sign-in Widget as the `authClient` property.

A SPA application can handle the OAuth callback client-side using the built-in `authClient`:

```javascript
// https://myapp.mycompany.com/login/callback?interaction_code=ABC&state=XYZ
if (signIn.authClient.isLoginRedirect()) {
  await signIn.authClient.handleLoginRedirect();
}
```

##### Social/IDP callback

After signing in with a 3rd party IDP, the user is redirected back to the application's `redirectUri`. If no further input is needed from the user, then this will be an [OAuth callback](#oauth-callback) containing an `interaction_code` parameter. If further input is required, then the callback will contain an `error` parameter with the value `interaction_required`. In this case, the Sign-in Widget should be loaded again so that the [flow](#flow) can continue.

Both server-side web and SPA applications should look for the `error` query parameter and, if the value is `interaction_required`, they should render the widget again using the same configuration as the first render. The `state` parameter will also be passed on the callback which can be used to match the request with the user's application session. The widget will automatically proceed with the transaction.

##### Email verify callback

Your application will need to implement an email verify callback if your sign-on policy uses [Email Magic Link/OTP][]. After the user clicks the link in an email, they are redirected back to the application's `email verify callback URI`. The query parameters passed to the application include `state` and `otp`. As with the [Social/IDP callback](#socialidp-callback), the widget should be rendered again using the same configuration. Additionally, the `otp` should be passed to the widget's constructor.

> **Note:** See [configuration](#configuration) for more information on these configuration values

```javascript
var signIn = new OktaSignIn(
  {
    issuer: 'https://{yourOktaDomain}/oauth2/default',
    clientId: '{{clientId of your OIDC app}}',
    redirectUri: '{{redirectUri configured in OIDC app}}',
    useInteractionCodeFlow: true,
    state: '{{state from URL}}',
    otp: '{{otp from URL}}'
  }
);
```

## API Reference

### OktaSignIn

Creates a new instance of the Sign-In Widget with the provided [options](#configuration).

For applications using a customized Okta-hosted widget, there will be a configuration object on the page which contains all required values. You will most likely not need to modify this object.

For applications using an embedded widget, you will need to provide an [OIDC configuration](#openid-connect):

> **Note:** See [configuration](#configuration) for more information on these configuration values

```javascript
var signIn = new OktaSignIn(
  {
    issuer: 'https://{yourOktaDomain}/oauth2/default',
    clientId: '{{clientId of your OIDC app}}',
    redirectUri: '{{redirectUri configured in OIDC app}}',
    useInteractionCodeFlow: true
  }
);
```

### showSignIn

Renders the widget to the DOM. On success, the promise resolves. On error, the promise rejects. If the sign-on policy requires a redirect to Okta or another identity provider (IdP), the browser will redirect and the promise will not resolve. The responses and errors are the same as those for [renderEl](#renderel).

> **Note**: This is the recommended way to render the widget for SPA applications. [Server-side web apps](https://developer.okta.com/code/javascript/okta_sign-in_widget/#server-side-web-application-using-authorization-code-flow) should use the [showSignInAndRedirect](#showsigninandredirect) method instead.

`showSignIn` accepts the same [options](#configuration) as the widget constructor. Options passed to the method will override options from the constructor.

> **Note:** See [configuration](#configuration) for more information on these configuration values

```javascript
var signIn = new OktaSignIn({
  issuer: 'https://{yourOktaDomain}/oauth2/default'
  clientId: '{{clientId of your OIDC app}}',
  redirectUri: '{{redirectUri configured in OIDC app}}',
  useInteractionCodeFlow: true
});

oktaSignIn.showSignIn({
  // Assumes there is an empty element on the page with an id of ‘osw-container’
  el: ‘#osw-container’,
}).then(response => {
  oktaSignIn.authClient.handleLoginRedirect(res.tokens);
}).catch(function(error) {
  // This function is invoked with errors the widget cannot recover from:
  // Known errors: CONFIG_ERROR, UNSUPPORTED_BROWSER_ERROR
  console.log('login error', error);
});
```

### showSignInAndRedirect

Renders the widget to the DOM. On successful [authentication][], the browser will be redirected to Okta with information to begin a new session. Okta's servers will process the information and then redirect back to your application's `redirectUri`. If successful, an interaction code will exist in the URL as the `interaction_code` query parameter. If unsuccessful, there will be `error` and `error_description` query parameters in the URL. Whether successful or not, the `state` parameter which was passed to the widget will also be returned on redirect. This can be used by your server-side web application to match the callback with the correct user session.

`showSignInAndRedirect` accepts the same [options](#configuration) as the widget constructor. Options passed to the method will override options from the constructor.

> **Note:** See [configuration](#configuration) for more information on these configuration values

```javascript
var signIn = new OktaSignIn({
  issuer: 'https://{yourOktaDomain}/oauth2/default',
  clientId: '{{clientId of your OIDC app}}',
  redirectUri: '{{redirectUri configured in OIDC app}}',
  useInteractionCodeFlow: true,
  state: '{{state passed from backend}}', // state can be any string, it will be passed on redirect callback
  codeChallenge: '{{PKCE code challenge from backend}}', // PKCE is required for interaction code flow
});

signIn.showSignInAndRedirect({
  // Assumes there is an empty element on the page with an id of 'osw-container'
  el: '#osw-container'
}).catch(function(error) {
  // This function is invoked with errors the widget cannot recover from:
  // Known errors: CONFIG_ERROR, UNSUPPORTED_BROWSER_ERROR
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

Provides access to the underlying [@okta/okta-auth-js][] object used by the Sign-in Widget. All methods are documented in the [API reference](https://github.com/okta/okta-auth-js#api-reference).

The `authClient` is configured using values passed to the widget, such as `clientId`, `issuer`, `redirectUri`, `state`, and `scopes`. Options which are not directly supported by the widget can be passed to AuthJS using the `authParams` object.

The `authClient` can also be created and configured outside the widget and passed to the widget as the `authClient` option. If an `authClient` option is passed, `authParams` will be ignored.

> **Note:** See [configuration](#configuration) for more information on these configuration values

```javascript
var authClient = new OktaAuth({
  issuer: 'https://{yourOktaDomain}/oauth2/default',
  clientId: '{yourClientId}',
  redirectUri: '{{redirectUri configured in OIDC app}}',
});
var config = {
  baseUrl: 'https://{yourOktaDomain}',
  authClient: authClient,
  useInteractionCodeFlow: true
};

var signIn = new OktaSignIn(config);
// signIn.authClient === authClient
```

If no `authClient` option is set, an instance will be created using the options passed to the widget and `authParams`:

```javascript
var config = {
  issuer: 'https://{yourOktaDomain}/oauth2/default',
  clientId: '{yourClientId}',
  redirectUri: '{{redirectUri configured in OIDC app}}',
  useInteractionCodeFlow: true,
  authParams: {
    ignoreSignature: true
  }
};

var signIn = new OktaSignIn(config);
// signIn.authClient.options.clientId === '{yourClientId}'
// signIn.authClient.options.ignoreSignature === true'
```

### before

Adds an asynchronous [hook](#hooks) function which will execute before a view is rendered.

> **Note:** See [configuration](#configuration) for more information on these configuration values

```javascript
var config = {
  issuer: 'https://{yourOktaDomain}/oauth2/default',
  clientId: '{yourClientId}',
  redirectUri: '{{redirectUri configured in OIDC app}}',
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

> **Note:** See [configuration](#configuration) for more information on these configuration values

```javascript
var config = {
  issuer: 'https://{yourOktaDomain}/oauth2/default',
  clientId: '{yourClientId}',
  redirectUri: '{{redirectUri configured in OIDC app}}',
  useInteractionCodeFlow: true,
};
var signIn = new OktaSignIn(config);
signIn.after('identify', async () => {
  // custom logic can go here. when the function resolves, execution will continue.
});

```

## Configuration

If you are using the [default Okta-hosted signin page](#okta-hosted-sign-in-page-default), all configuration is handled via the `Customization` section of the Admin UI.

If you are using the [custom Okta-hosted signin page](#okta-hosted-sign-in-page-customizable), a configuration object is included on the page which contains all necessary values. You will probably not need to modify this object, but you may use this object as a starting point and add additional customizations.

For embedded widgets, you should set the `issuer`, `clientId`, and `redirectUri`. Additionally you should set `useInteractionCodeFlow` to `true` to enable the OIE engine. (See [this document](https://github.com/okta/okta-signin-widget/blob/master/docs/classic.md) for details on running in [Classic Engine][].

### Basic config options

All embedded widgets should set these basic options: `issuer`, `clientId`, and `redirectUri`. 

> **Note**: Okta-hosted widgets should not set these values.

#### issuer

The URL of the [Authorization Server][] which will issue [OAuth][] tokens to your application.  

> **Note**: `https://{yourOktaDomain}` can be any Okta organization. See our [developer guide](https://developer.okta.com/docs/guides/find-your-domain/main/) for help with finding your Okta domain.

Basic configuration using the "default" [Custom Authorization Server][]:

```javascript
var config = {
  issuer: 'https://{yourOktaDomain}/oauth2/default',
  clientId: '{{clientId of your OIDC app}}',
  redirectUri: '{{redirectUri configured in OIDC app}}',
  useInteractionCodeFlow: true
}
```

A different [Custom Authorization Server][] can be specified:

```javascript
var config = {
  issuer: 'https://{yourOktaDomain}/oauth2/custom',
  clientId: '{{clientId of your OIDC app}}',
  redirectUri: '{{redirectUri configured in OIDC app}}',
  useInteractionCodeFlow: true
}
```

Some applications, such as those that require access to the Okta User API, will want to use the Okta Organization [Authorization Server][] as the issuer. In this case the `issuer` should match your Okta domain:

```javascript
var config = {
  issuer: 'https://{yourOktaDomain}',
  clientId: '{{clientId of your OIDC app}}',
  redirectUri: '{{redirectUri configured in OIDC app}}',
  useInteractionCodeFlow: true
}
```

> **Note**: The Okta Organization [Authorization Server][] is only meant for access to the Okta User API and does not support all of the features of the standard [Custom Authorization Server][], such as custom scopes on access tokens. It is generally recommended to use a [Custom Authorization Server][] to secure access to your organization's resources.

#### clientId

> **Note**: This configuration value can be found in the Okta Admin UI. See our [developer guide](https://developer.okta.com/docs/guides/find-your-app-credentials/main/) for help with finding your application's clientId

Client Id of the application.

#### redirectUri

> **Note**: This configuration value can be found in the Okta Admin UI under the application's "General Settings"

The URI to use for the [OAuth callback](#oauth-callback).

#### useInteractionCodeFlow

Enables the [interaction code][] flow in the widget. This is the only supported authentication method for embedded widgets on the [Identity Engine][]. (See [this document](https://github.com/okta/okta-signin-widget/blob/master/docs/classic.md) for details on running in [Classic Engine][]).

#### codeChallenge

The [PKCE][] code challenge. SPA applications will not need this option since the widget will manage the entire transaction. Web applications should generate their own code challenge and code secret. The code challenge is passed to the widget, and the code secret is held server-side to obtain tokens on the [redirect login callback](#oauth-callback).

> **Note**: Check out our [sample applications](#sample-applications) for complete working examples of [interaction code][] flow using [PKCE][]

#### state

An application-provided value which will be returned as a query parameter during on the [redirect login callback](#oauth-callback) or [email verify callback](#email-verify-callback). If no value is set, then a random value will be created. When handling an [email verify callback](#email-verify-callback), the value of `state` from the query parameter should be passed to the widget as a configuration option (along with [otp](#otp)). This will ensure that the widget can load and resume the current transaction.

#### otp

When handling an [email verify callback](#email-verify-callback), the value of `otp` from the query parameter should be passed to the widget as a configuration option (along with [state](#state)). This will ensure that the widget can load and resume the current transaction.

#### scopes

Defaults to `['openid', 'email']`. Specify what information to make available in the returned `id_token` or `access_token`. For OIDC, you must include `openid` as one of the scopes. For a list of available scopes, see [Scopes and Claims](https://developer.okta.com/docs/api/resources/oidc#access-token-scopes-and-claims).

#### idpDisplay
Display order for external [identity providers][] relative to the Okta login form. Defaults to `SECONDARY`.

  - `PRIMARY` - Display External IDP buttons above the Okta login form
  - `SECONDARY` - Display External IDP buttons below the Okta login form


### Brand

#### logo

Local path or URL to a logo image that is displayed at the top of the Sign-In Widget

```javascript
// Hosted on the same origin
logo: '/img/logo.png'

// Can also be a full url
logo: 'https://acme.com/img/logo.png'
```

#### logoText

Text for `alt` attribute of the logo image, logo text will only show up when logo image is not available

```javascript
// Text to describe the logo
logoText: 'logo text'
```

#### brandName

The brand or company name that is displayed in messages rendered by the Sign-in Widget (for example, "Reset your {`brandName`} password"). If no `brandName` is provided, a generic message is rendered instead (for example, "Reset your password"). You can further customize the text that is displayed with [language and text settings](https://github.com/okta/okta-signin-widget#language-and-text).

```javascript
brandName: 'Spaghetti Inc.'
```

#### colors

These options let you customize the appearance of the Sign-in Widget.

If you want even more customization, you can modify the [Sass source files](https://github.com/okta/okta-signin-widget/tree/master/assets/sass) and [build the Widget](https://github.com/okta/okta-signin-widget#building-the-widget).

##### colors.brand

Sets the brand color as the background color of the primary CTA button. Colors must be in hex format, like `#008000`.

```javascript
colors: {
  brand: '#008000'
}
```

### Localization

#### Supported languages

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

Support for additional languages can be added with the [assets.languages](#assetslanguages) option.

#### language

Set the language of the widget. If no language is specified, the widget will choose a language based on the user's browser preferences if it is supported, or defaults to `en`.

```javascript
// You can simply pass the languageCode as a string:
language: 'ja'

// Or, if you need to determine it dynamically, you can pass a
// callback function:
language: (supportedLanguages, userLanguages) => {
  // supportedLanguages is an array of languageCodes, i.e.:
  // ['cs', 'da', ...]
  //
  // userLanguages is an array of languageCodes that come from the user's
  // browser preferences
  return supportedLanguages[0];
}
```

#### defaultCountryCode

Set the default countryCode of the widget. If no `defaultCountryCode` is provided, defaults to `US`. It sets the country calling code for phone number accordingly in the widget.

#### i18n

Override the text in the widget. The full list of properties can be found in the [login.properties](https://github.com/okta/okta-signin-widget/blob/master/packages/%40okta/i18n/src/properties/login.properties) and [country.properties](https://github.com/okta/okta-signin-widget/blob/master/packages/%40okta/i18n/src/properties/country.properties) files.

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

### assets

#### assets.baseUrl

Override the base url the widget pulls its language files from. The widget is only packaged with english text by default, and loads other languages on demand from the Okta CDN. If you want to serve the language files from your own servers, update this setting.

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

> **Note:** The json files can be accessed from the `dist/labels/json` folder that is published in the [npm module](https://www.npmjs.com/package/@okta/okta-signin-widget).

#### assets.languages

Specify the list of supported languages which are hosted and accesible under the path `{assets.baseUrl}/labels/json/`. This option supersedes the [default list of supported languages](#supported-languages). If an unsupported language is requested (explicitly using the [language option](#language) or automatically by browser detection), the default language (`en`) will be used.

#### assets.rewrite

You can use this function to rewrite the asset path and filename. Use this function if you will host the asset files on your own host, and plan to change the path or filename of the assets. This is useful, for example, if you want to cachebust the files.

```javascript
assets: {
  // Note: baseUrl is still needed to set the base path
  baseUrl: '/path/to/dist',

  rewrite: (assetPath) => {
    // assetPath is relative to baseUrl
    // Example assetPath to load login for 'ja': "/labels/json/login_ja.json"
    return someCacheBust(assetPath);
  }
}
```

### Links

#### Back to sign in link

Set the following config option to override the back to sign in link URL. If not provided, the widget will navigate to Primary Auth.

```javascript
backToSignInLink: 'https://www.backtosignin.com'
```

> **Note:** For compatibility with previous widget versions, `signOutLink` is accepted as an alias for `backToSignInLink`

#### Sign up link

You can add a registration link to the primary auth page by setting the following config options.

#### registration.click

Function that is called when the registration link is clicked.

```javascript
// An example that adds a registration link underneath the login form on the primary auth page
registration: {
  click: () => {
    window.location.href = 'https://acme.com/sign-up';
  }
}
```

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

##### helpLinks.help

Custom link href for the "Help" link

##### helpLinks.forgotPassword

Custom link href for the "Forgot Password" link

##### helpLinks.unlock

Custom link href for the "Unlock Account" link. For this link to display, `features.selfServiceUnlock` must be set to `true`, and the self service unlock feature must be enabled in your admin settings.

##### helpLinks.custom

Array of custom link objects `{text, href, target}` that will be added to the *"Need help signing in?"* section. The `target` of the link is optional.

### Hooks

Asynchronous callbacks can be invoked before or after a specific view is rendered. Hooks can be used to add custom logic such as instrumentation, logging, or additional user input. Normal execution is blocked while the hook function is executing and will resume after the Promise returned from the hook function resolves. Hooks can be added via config, as shown below, or at runtime using the [before](#before) or [after](#after) methods. The full list of views can be found in [RemediationConstants.js](https://github.com/okta/okta-signin-widget/blob/master/src/v2/ion/RemediationConstants.js#L19).

```javascript
// Hooks can be set in config
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
      async function beforeSuccessRedirect() {
        // custom logic goes here
      }
    ]
  }
}

// Hooks can also be added at runtime
signIn.before('success-redirect', async () => {
  // custom logic goes here
});

signIn.after('identify', async () => {
  // custom logic goes here
});

```

### Username and password

#### transformUsername

Transforms the username before sending requests with the username to Okta. This is useful when you have an internal mapping between what the user enters and their Okta username.

```javascript
// The callback function is passed two arguments:
// 1) username: The name entered by the user
// 2) operation: The type of operation the user is trying to perform:
//      - PRIMARY_AUTH
//      - FORGOT_PASSWORD
//      - UNLOCK_ACCOUNT
transformUsername: (username, operation) => {
  // This example will append the '@acme.com' domain if the user has
  // not entered it
  return username.includes('@acme.com')
    ? username
    : username + '@acme.com';
}
```

### Registration

Callback functions can be provided which will be called at specific moments in the registration process.

```javascript
registration: {
  parseSchema: (schema, onSuccess, onFailure) => {
      // handle parseSchema callback
      onSuccess(schema);
  },
  preSubmit: (postData, onSuccess, onFailure) => {
      // handle preSubmit callback
      onSuccess(postData);
  },
  postSubmit: (response, onSuccess, onFailure) => {
      // handle postsubmit callback
      onSuccess(response);
  }
},
```

#### parseSchema

Callback used to change the JSON schema that comes back from the Okta API.

```javascript
parseSchema: (schema, onSuccess) => {
  // This example will add an additional field to the registration form.
  schema.push(
    {
      'name': 'userProfile.address',
      'type': 'text',
      'placeholder': 'Enter your street address',
      'maxLength': 255,
      'label-top': true,
      'label': 'Street Address',
      'required': true,
    }
  );
  onSuccess(schema);
}
```

#### preSubmit

Callback used primarily to modify the request parameters sent to the Okta API.

 ```javascript
preSubmit: (postData, onSuccess) => {
  // This example will append the domain name to the email address if the user forgets to add it during registration.
  if (!postData.userProfile.email.includes('@acme.com')) {
    postData.userProfile.email += '@acme.com';
  }
  }
  onSuccess(postData);
}
```

#### postSubmit

Callback used to primarily get control and to modify the behavior post submission to registration API.

```javascript
postSubmit: (response, onSuccess) => {
  // This example will log the API request body to the browser console before completing registration.
  console.log(response);
  onSuccess(response);
}
```

#### Handling registration callback errors

- **onFailure and ErrorObject:** The onFailure callback accepts an error object that can be used to show a form level vs field level error on the registration form.

##### Use the default error

```javascript
preSubmit: (postData, onSuccess, onFailure) => {
  // A generic form level error is shown if no error object is provided
  onFailure();
}
```

##### Display a form error

  ```javascript
preSubmit: (postData, onSuccess, onFailure) => {
  const error = {
    "errorSummary": "Custom form level error"
  };
  onFailure(error);
}
```

##### Display a form field error

```javascript
  preSubmit: (postData, onSuccess, onFailure) => {
    const error = {
        "errorSummary": "API Error",
        "errorCauses": [
            {
              "errorSummary": "Custom field level error",
              "property": "userProfile.email",
            }
        ]
    };
    onFailure(error);
  }
```

### Custom Buttons

You can add custom buttons underneath the login form on the primary auth page by setting the following config options. If you'd like to change the divider text, use the `i18n` config option.

```javascript
// An example that adds a custom button below the login form on the Sign in form
customButtons: [{
  title: 'Click Me',
  className: 'btn-customAuth',
  click: () => {
    // clicking on the button navigates to another page
    window.location.href = 'https://www.example.com';
  }
}]

// An example that adds a custom button with a localized title below the Sign in form
i18n: {
  en: {
    'customButton.title': 'Custom Button Title',
  },
},
customButtons: [{
  i18nKey: 'customButton.title',
  className: 'btn-customAuth',
  click: () => {
    // clicking on the button navigates to another page
    window.location.href = 'https://www.example.com';
  }
}]
```

#### customButtons.title

String that is set as the button text (set only one of `title` OR `i18nKey`)

#### customButtons.i18nKey

Custom translation key for button text specified in `i18n` config option (set only one of `title` OR `i18nKey`)

#### customButtons.className

Optional class that can be added to the button

#### customButtons.click

Function that is called when the button is clicked

### Feature flags

Enable or disable widget functionality with the following options.

```javascript
features: {
  showPasswordToggleOnSignInPage: true,
  hideSignOutLinkInMFA: false,
  rememberMe: true
}
```

#### features.showPasswordToggleOnSignInPage

Defaults to `true`.
Shows eye icon to toggle visibility of the user entered password on the Okta Sign-In page. Password is hidden by default, even when this flag is enabled. Passwords are visible for 30 seconds and then hidden automatically.

#### features.showIdentifier

Defaults to `true`.
Shows the user's identifier on any view with user context.

#### features.hideSignOutLinkInMFA

Defaults to `false`.
Hides the "Back to sign in" link for authenticator enrollment and challenge flows.

#### features.rememberMe

Defaults to `true`.
Pre-fills the identifier field with the previously used username.


#### features.autoFocus

Defaults to `true`.
Automatically focuses the first input field of any form when displayed. 

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

3. Create a `.widgetrc.js` file in the `okta-signin-widget` directory with your desired configuration:

    ```javascript
    module.exports = {
      issuer: 'https://{yourOktaDomain}/oauth2/default',
      clientId: '{{clientId of your OIDC app}}',
      redirectUri: '{{redirectUri configured in OIDC app}}',
      useInteractionCodeFlow: true,
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
cd dist
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
  // ...other widget config
  // ...
  language: 'ok-PL',
  ...
}
```

## Browser support

Need to know if the Sign-In Widget supports your browser requirements?  Please see [Platforms, Browser, and OS Support](https://help.okta.com/en/prod/Content/Topics/Miscellaneous/Platforms_Browser_OS_Support.htm).

## Contributing

We're happy to accept contributions and PRs! Please see the [contribution guide](CONTRIBUTING.md) to understand how to structure a contribution.
