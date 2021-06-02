
<!-- omit in toc -->
# Okta Sign-In Widget for Interaction Code

- [Setup](#setup)
- [Getting started](#getting-started)
- [Configuration options](#configuration-options)
  - [Brand](#brand)
    - [logo](#logo)
    - [logoText](#logotext)
    - [brandName](#brandname)
    - [colors](#colors)
      - [colors.brand](#colorsbrand)
  - [Localization](#localization)
    - [language](#language)
    - [defaultCountryCode](#defaultcountrycode)
    - [i18n](#i18n)
  - [assets](#assets)
    - [assets.baseUrl](#assetsbaseurl)
    - [assets.rewrite](#assetsrewrite)
  - [Links](#links)
    - [Sign out link](#sign-out-link)
    - [Sign up link](#sign-up-link)
    - [registration.click](#registrationclick)
    - [Help Links](#help-links)
      - [helpLinks.help](#helplinkshelp)
      - [helpLinks.forgotPassword](#helplinksforgotpassword)
      - [helpLinks.unlock](#helplinksunlock)
      - [helpLinks.custom](#helplinkscustom)
  - [Hooks](#hooks)
    - [transformUsername](#transformusername)
    - [Registration hooks](#registration-hooks)
      - [parseSchema](#parseschema)
      - [preSubmit](#presubmit)
      - [postSubmit](#postsubmit)
    - [Handling registration hook errors](#handling-registration-hook-errors)
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
    - [features.hideSignOutLinkInMFA](#featureshidesignoutlinkinmfa)

## Setup

To begin using the Interaction code flow in the Okta Sign-In Widget follow this [migration guide](https://developer.okta.com/docs/guides/migrate-to-oie/).

## Getting started

The only configuration required to initialize the Okta Sign-In Widget is the `baseUrl`.

```javascript
const signIn = new OktaSignIn(
  {
    baseUrl: 'https://{yourOktaDomain}',
  }
);
```

## Configuration options

There are many different ways the Okta Sign-In Widget can be customized.

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

  Text for `alt` attribute of the logo image, logo text will only show up when logo image is not avaiable

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

#### defaultCountryCode

Set the default countryCode of the widget. If no `defaultCountryCode` is provided, defaults to `US`. It sets the country calling code for phone number accordingly in the widget.

#### i18n

Override the text in the widget. The full list of properties can be found in the [login.properties](packages/@okta/i18n/src/properties/login.properties) and [country.properties](packages/@okta/i18n/src/properties/country.properties) files.

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

  **Note:** The json files can be accessed from the `dist/labels/json` folder that is published in the [npm module](https://www.npmjs.com/package/@okta/okta-signin-widget).

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

#### Sign out link

Set the following config option to override the sign out link URL. If not provided, the widget will navigate to Primary Auth.

  ```javascript
  signOutLink: 'https://www.signmeout.com'
  ```

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

#### Registration hooks

Hook into registration events.

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

##### parseSchema

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

##### preSubmit

Callback used primarily to modify the request parameters sent to the Okta API.

 ```javascript
    preSubmit: (postData, onSuccess) => {
      // This example will append the domain name to the email address if the user forgets to add it during registration.
      if (postData.userProfile.email.includes('@acme.com')) {
        postData.userProfile.email;
      } else {
        postData.userProfile.email + '@acme.com';
      }
      onSuccess(postData);
    }
  ```

##### postSubmit

Callback used to primarily get control and to modify the behavior post submission to registration API.

```javascript
  postSubmit: (response, onSuccess) => {
    // This example will log the API request body to the browser console before completing registration.
    console.log(response);
    onSuccess(response);
  }
```

#### Handling registration hook errors

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
    hideSignOutLinkInMFA: false
  }
  ```

#### features.showPasswordToggleOnSignInPage

  Defaults to `true`.
  Shows eye icon to toggle visibility of the user entered password on the Okta Sign-In page. Password is hidden by default, even when this flag is enabled. Passwords are visible for 30 seconds and then hidden automatically.

#### features.hideSignOutLinkInMFA

  Defaults to `false`.
  Hides the "Back to sign in" link for authenticator enrollment and challenge flows.
