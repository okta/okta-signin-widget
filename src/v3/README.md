# SIW Next

Okta Sign In Widget Next is only available for OIE-enabled Orgs (Okta Identity Engine).

## Pre-requisites

node >=v12.22 <16

## Getting Started

```sh
# clone the repo
git clone https://github.com/okta/siw-next.git

# checkout develop branch
git checkout develop

# install dependencies
yarn # disregard warnings about missing react and react-dom peer dependencies

# run linter and auto-fix problems
yarn lint --fix

# run unit tests
yarn jest

# run e2e tests
yarn test:e2e

# run in development mode
yarn dev # follow the below instructions to set env vars before running the development server
```

Open your browser to http://localhost:3000 (default port).

### Test Org

Follow [these instructions to create an OIE Preview Org](https://oktawiki.atlassian.net/l/c/C6XKAt7g)

1. Create an OIE Preview org: <https://developer.okta.com/signup/oie-preview.html>
2. Create a new Application in the Admin UI by clicking Applications > Application > Create App Integration.
   1. Create an OIDC App
   2. Use Single-Page Application (SPA)
   3. There are many options that can be changed later. A good place to start is with “Authorization Code” and “Interaction Code” grant types selected.
   4. Add `localhost:3000` or your local widget hostname to the "Base URIs" list
3. Copy the Client ID value to your widget configuration. The Issuer value is https://${yourOieOrg}.oktapreview.com/oauth2/default.
4. You should be able to run the widget locally (with mocks turned off) and login to your OIE org now.

### Mocks Service

Enable mocks when running the local development server using `yarn dev` and then adding `?siw-use-mocks=true` to the page URL. This will use mock responses instead of making requests to your org.

By default, a simple authentication scenario is mocked. If you would like to load a different scenario, it can be specified using an additional query parameter, `siw-mock-scenario`. The list of mock scenarios you can specify here are defined in `src/mocks/scenario`.

**Example**

To load a scenario called `authenticator-verification-email`, navigate to the URL `http://localhost:3000/?siw-use-mocks=true&siw-mock-scenario=authenticator-verification-email`.

#### Defining a new mock scenario

To define a new mock scenario, add a new file under `src/mocks/scenario/{mock-scenario-name}.ts` where `mock-scenario-name` is a `kebab-case` description of the scenario. You must also import this file in the `src/mocks/scenario/index.ts` root file:

```ts
// src/mocks/scenario/index.ts
import "./mock-scenario-name";
```

Here is what an example mock scenario definition looks like:

```ts
// src/mocks/scenario/mock-scenario-name.ts
import { scenario } from '../registry';

scenario('mock-scenario-name', (rest) => {
   rest.post('*/my-api-endpoint', async (req, res, ctx) => {
      return res(
         ctx.status(200),
      );
   }),
});
```

See documentation for [Mock Service Worker](https://mswjs.io/docs/) for more information on how to write the mocks themselves.

### Set Environment Variables

Copy `.env.example` to `.env` in the project root and set your environment variables.

NOTE: Environment variables are read once at development server startup. To reload values, stop and restart the development server (`yarn dev`).

```sh
# find these values in your admin dashboard
PREACT_APP_CLIENT_ID=0do780g0401ver9aji1u
PREACT_APP_ISSUER=https://oie-1234567.oktapreview.com/oauth2/default
PREACT_APP_USE_PKCE=true # true|false
```

### Authenticators

#### WebAuthN

The WebAuthN authenticator is one of many multifactor authentication types Okta offers. You can find more information about the Credentials Management API [here](https://medium.com/webauthnworks/introduction-to-webauthn-api-5fd1fb46c285) including examples of how it is used to create and retrieve credentials.

**Testing**

You can utilize the Mock Scenario to test the _Enrollment Flow_, however, there is an issue using Mocks to Test the Verification Flow. The reason for this is because the mock data surfaced from the Identify request does not match or contain the proper identifiers stored on your browser. For this, I would recommend using your Test Org (Okta preview) to test the WebAuthN Verification flow.

E2E

> Follow the instructions above to set up your .env file
> Follow [these](https://oktawiki.atlassian.net/wiki/spaces/eng/pages/2442758711/IDX+SDK+-+WebAuthn+Manual+Test+Plan) directions to create the appropriate policies and rules in your Test Org to trigger the WebAuthN authenticator to be offered in the Sign in Widget.
> After setting up the policies in your Test org, start the app locally and sign in with a user that has MFA enabled.
> These instructions apply to both the Enrollment (for a user that has not previously enrolled with WebAuthN) and Verification Flows.

Mocks

> Start the app locally
> Use this URL to test the **Enrollment Flow** _http://localhost:3000?siw-use-mocks=true&siw-mock-scenario=webauthn-enroll-mfa_
> Use this URL to test the **Verification Flow** _http://localhost:3000?siw-use-mocks=true&siw-mock-scenario=webauthn-verify-mfa_ But please note, as mentioned above, the verification flow will give an error in the Browser prompt that the Identity could not be verified preventing you from authenticating.

### Customizations

SIW Next uses React.  
If you want to customize the appearence of widget, using [before](/README.md#before) and [after](/README.md#after) hooks to manipulate DOM is not suitable.  
Instead you can use new `afterTransform` hook to manipulate state of SIW to be rendered.  

Example:

```js
signIn.afterTransform('*', ({ formBag }) => {
  const customLink = {
    type: 'Link',
    contentType: 'footer',
    options: {
      href: 'https://www.okta.com/terms-of-service/',
      target: '_blank',
      step: '',
      label: 'Terms of Service',
      dataSe: 'customLink',
    },
  };
  formBag.uischema.elements.push(customLink);
});
```

This hook adds custom link to the bottom of every page (because `*` is used as first parameter).  
If you want to apply hook to a specific form only, put its [name](#form-name) instead of `*` as first parameter.  

See [`formBag`](#formbag) section for decription of the form bag object.  

`context` object includes useful metadata: `formName` (see [Form name](#form-name)), optional `userInfo`, `currentAuthenticator`, `deviceEnrollment`, `nextStep`, `idxContext`.  

See examples of `afterTransform` hooks usage for different pages in [the playground](/playground/hooks/index.ts).  
Use this URL to activate hooks in the playground: `http://localhost:3000/?customize=1`  

#### Form name

- If IDX response contains no remediatons or only one skip remediation:
  - If IDX response contains error message, then form name is `terminal`
  - If raw IDX response contains `deviceEnrollment`, then form name is `device-enrollment-terminal`
- In other cases form name equals `remediation.value[0].name` from IDX response

Examples:

- [`enroll-authenticator`](/playground/mocks/data/idp/idx/authenticator-enroll-email.json)
- [`terminal`](/playground/mocks/data/idp/idx/terminal-return-expired-email.json)
- [`terminal`](/playground/mocks/data/idp/idx/safe-mode-optional-enrollment.json)
- [`device-enrollment-terminal`](/playground/mocks/data/idp/idx/oda-enrollment-android.json)

(For the source code see function [`getFormNameForTransaction`](/src/v3/src/util/getEventContext.ts)).  

#### `formBag`

Type definition: [FormBag](/src/v3/src/types/schema.ts#L43).  

To see demonstration of different elements can be used in `formBag.uischema.elements`:

- Add `'_ui-demo'` as first element of `idx['/idp/idx/introspect']` in [responseConfig](/playground/mocks/config/responseConfig.js#L22)
- Run `yarn workspace v3 dev`
- Open `http://localhost:3000/`

(For the source code of this demo see [transformEnumerateComponents](/src/v3/src/transformer/layout/development/transformEnumerateComponents.ts))

React components to be rendered by type: see [renderers](/src/v3/src/components/Form/renderers.tsx)  

#### Custom profile fields for user registration

Custom profile fields should be added in Okta admin panel (`Directory -> Profile Editor`) if value needs to be saved.  
Custom profile fields display can be configured at `Security -> Profile Enrollment` page.  
See [Create a custom profile enrollment form](https://help.okta.com/oie/en-us/content/topics/identity-engine/policies/create-profile-enrollment-form.htm).  
Eg. hook for [enroll-profile](/playground/hooks/pages/enroll-profile.ts) page expects custom string profile field with name `custom_string` to be added with Okta admin panel.  

Fake custom profile fields (value of those can't be saved) can be added with [`registration.parseSchema`](/README.md#parseschema) callback.  
Eg. checkbox to agree to terms and conditions could be added with this callback without saving value to backend
  (see `custom_bool` in [hooks/pages/enroll-profile.ts](/playground/hooks/pages/enroll-profile.ts)).  

#### Style customizations

CSS selectors for style customizations can be tricky to write cause Gen3 doesn't use classes for key elements.  
But you can use `data-se` attribute for key elements and `:has()` selector for their parents/ancestors.  

Example of style customizations in the playground: see [customize.css](/playground/hooks/css/customize.css)  

#### Using hooks in Sign-in page code editor for custom domain

To customize styling:

1. Paste content of [customize.css](/playground/hooks/css/customize.css)  inside `<style nonce="{{nonceValue}}">`

2. Paste the following line after `oktaSignIn.renderEl(...)`:

   ```js
   document.querySelector('#okta-login-container').classList.add('siw-customized');
   ```

`afterTransform` hooks should be added after creating instance of `OktaSignIn` (`oktaSignIn = new OktaSignIn(config);`).

To copy hook code examples and paste into code editor please use JS version of code.  
For example [enroll-authenticator.ts](/playground/hooks/pages/enroll-authenticator.ts) (TS version) is used for the playground, but [enroll-authenticator.js](/playground/hooks/pages/enroll-authenticator.js) (JS version) can be used for copy-pasting.  
