# Okta Sign-In Widget

The Okta Sign-In Widget is an HTML/CSS/JS widget that provides out-of-the-box authentication and identity experiences for your organization's apps. It's the pre-built and customizable solution used by the Okta Workforce Identity Cloud.

This README is for the Sign-In Widget (third generation). The third generation is more accessible, and uses modern frameworks with a better user and developer experience. It's built from the ground up for the Okta Identity Engine, and removes support for the Okta Classic Engine.

**Table of contents**
- [Okta Sign-In Widget](#okta-sign-in-widget)
  - [Generation overview](#generation-overview)
    - [Browsers](#browsers)
    - [Deployment](#deployment)
    - [Authenticators](#authenticators)
    - [Branding](#branding)
  - [Compare generations](#compare-generations)
  - [Type of Applications](#type-of-applications)
    - [OIDC](#oidc)
    - [Non-OIDC](#non-oidc)
  - [Okta deployment models](#okta-deployment-models)
    - [Redirect (Okta-hosted)](#redirect-okta-hosted)
    - [Embedded (self-hosted)](#embedded-self-hosted)
  - [Migrating to the 3rd generation](#migrating-to-the-3rd-generation)
  - [Advanced](#advanced)
    - [Contributing code (Contributions.md)](#contributing-code-contributionsmd)
    - [Building the SIW on your own](#building-the-siw-on-your-own)
      - [Pre-requisites](#pre-requisites)
      - [Getting Started](#getting-started)
      - [Test Org](#test-org)
      - [Mocks Service](#mocks-service)
          - [Defining a new mock scenario](#defining-a-new-mock-scenario)
      - [Set Environment Variables](#set-environment-variables)
      - [Authenticators](#authenticators)
        - [WebAuthN](#webauthn)

## Generation overview

If your org prioritizes accessibility requirements or wants to avoid future migration efforts, consider enabling the third generation Sign-In Widget.

If your org uses registration hooks, CSS styling, or one of the unsupported authenticators, you shouldn't enable the third generation yet. Those features may be available in future releases. See [Sign-In Widget (third generation)](LINK) for updates.

### Browsers

The third generation Sign-In Widget supports most [standard browsers](https://help.okta.com/oie/en-us/Content/Topics/Miscellaneous/Platforms_Browser_OS_Support.htm). It doesn't support these browsers:

- Internet Explorer
- Embedded browsers like Microsoft Office
- Hardware integrations like hand-held Android devices

### Deployment

You can use the third generation Sign-In Widget in the following ways:

- Redirect authentication, sign-in page (default): Okta provides a sign-in page that is available at your org's URL. By default, a user who signs in on this page is redirected to the Okta user dashboard.
- Redirect authentication, sign-in page (customizable): Okta provides a sign-in page that you can customize and make available under a custom domain that is a subdomain of your company's top-level domain.

The third generation Sign-In Widget doesn't support embedded authentication.

See [Okta deployment models - redirect vs. embedded](https://developer.okta.com/docs/concepts/redirect-vs-embedded/).

### Authenticators

The third generation Sign-In Widget doesn't currently support these authenticators:

- Duo Security
- RSA
- Symantec VIP
- IdP authenticator
- Social login
- Custom Authenticator

### Branding

The third generation Sign-In Widget makes multibrand customization easier, but it doesn't support custom CSS overrides. If your org uses the code editor to customize a sign-in page, those customizations don't migrate. See [Style the sign-in page](https://developer.okta.com/docs/guides/custom-widget/main/).

## Compare generations

| Feature | Second generation | Third generation |
| ---                | ---                            | ---             |
| Deployment | Redirect (Okta-hosted)</br>Embedded (self-hosted)</br>Pinning to a specific Okta-hosted version | Redirect (Okta-hosted)</br>Automatic deployment of latest EA version |
| Authenticators | Email</br>Password</br>Okta Verify (Okta FastPass, push, TOTP)</br>WebAuthn</br>Smart Card IdP</br>Google Authenticator</br>YubiKey OTP</br>SMS</br>Security Question</br>Custom</br>Duo Security</br>RSA</br>Symantec VIP</br>IdP authenticator</br>Social login | Email</br>Password</br>Okta Verify (Okta FastPass, push, TOTP)</br>WebAuthn</br>Smart Card IdP</br>Google Authenticator</br>YubiKey OTP</br>SMS</br>Security Question |
| Flows | Profile enrollment</br>Authenticator enrollment</br>Authenticator verification</br>Forgot password</br>Account unlock | Profile enrollment</br>Authenticator enrollment</br>Authenticator verification</br>Forgot password</br>Account unlock |
| Globalization | Right-to-left languages (requires customization)</br>All out-of-the-box translations</br>String customization</br>Bring your own language | All out-of-the-box translations</br>String customization</br>Bring your own language |
| Branding | Branding and multibrands</br>CSS overrides (code editor) | Branding and multibrands |


## Type of Applications

### OIDC

* SPA Introduction
* Web Introduction

### Non-OIDC

* SAML?


## Okta deployment models

### Redirect (Okta-hosted)

A user sign-in flow that grants authentication control to Okta by redirecting to an Okta hosted sign-in page using open protocols like OAuth 2.0 and SAML. See [Redirect authentication](https://developer.okta.com/docs/guides/redirect-authentication/).

### Embedded (self-hosted)

The third generation Sign-In Widget doesn't support embedded authentication. See [Embedded (self-hosted), second generation](https://github.com/okta/okta-signin-widget#embedded-self-hosted).

## Migrating to the third generation

To migrate from a previous generation widget, first ensure that your org uses the Okta Identity Engine. All new orgs created after March 1, 2022 are Identity Engine orgs.

To determine whether your org uses Classic or Identity Engine, check the Admin Console footer. The bottom of every page includes a version string that looks like `Version 2023.04.1 E`.

`C` means your org is Classic; `E` means Identity Engine.

* If your org is Classic, you need to upgrade to Identity Engine before migrating to the latest widget. [Learn more about upgrading to Identity Engine.](https://help.okta.com/oie/en-us/Content/Topics/identity-engine/oie-upgrade-eligibility.htm)

* If your org uses Identity Engine, you're ready to plan your widget migration.

Start by evaluating whether the 3rd-generation widget supports everything you need. TODO supported capabilities

TODO start with proof of concept, test org

TODO enable EA

TODO check brand color contrast

TODO check sign-in page widget version

### Restore the second generation widget

If you enable the third generation widget and find that it doesn't work for your org yet, you can restore the second generation.

1. In the Admin Console, go to **Settings** > **Features**.

1. Select the **Sign-In Widget third generation** toggle to turn it off.

1. Click **Save**.

## Advanced

### Contributing code (Contributions.md)

### Building the SIW on your own

#### Pre-requisites

node >=v12.22 <16

#### Getting Started

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

Open your browser to http://localhost:8080 (default port).

#### Test Org

Follow [these instructions to create an OIE Preview Org](https://oktawiki.atlassian.net/l/c/C6XKAt7g)

1. Create an OIE Preview org: <https://developer.okta.com/signup/oie-preview.html>
2. Create a new Application in the Admin UI by clicking Applications > Application > Create App Integration.
   1. Create an OIDC App
   2. Use Single-Page Application (SPA)
   3. There are many options that can be changed later. A good place to start is with “Authorization Code” and “Interaction Code” grant types selected.
   4. Add `localhost:8080` or your local widget hostname to the "Base URIs" list
3. Copy the Client ID value to your widget configuration. The Issuer value is https://${yourOieOrg}.oktapreview.com/oauth2/default.
4. You should be able to run the widget locally (with mocks turned off) and login to your OIE org now.

#### Mocks Service

Enable mocks when running the local development server using `yarn dev` and then adding `?siw-use-mocks=true` to the page URL. This will use mock responses instead of making requests to your org.

By default, a simple authentication scenario is mocked. If you would like to load a different scenario, it can be specified using an additional query parameter, `siw-mock-scenario`. The list of mock scenarios you can specify here are defined in `src/mocks/scenario`.

**Example**

To load a scenario called `authenticator-verification-email`, navigate to the URL `http://localhost:8080/?siw-use-mocks=true&siw-mock-scenario=authenticator-verification-email`.

###### Defining a new mock scenario

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

#### Set Environment Variables

Copy `.env.example` to `.env` in the project root and set your environment variables.

NOTE: Environment variables are read once at development server startup. To reload values, stop and restart the development server (`yarn dev`).

```sh
# find these values in your admin dashboard
PREACT_APP_CLIENT_ID=0do780g0401ver9aji1u
PREACT_APP_ISSUER=https://oie-1234567.oktapreview.com/oauth2/default
PREACT_APP_USE_PKCE=true # true|false
```

##### WebAuthN

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
> Use this URL to test the **Enrollment Flow** _http://localhost:8080?siw-use-mocks=true&siw-mock-scenario=webauthn-enroll-mfa_
> Use this URL to test the **Verification Flow** _http://localhost:8080?siw-use-mocks=true&siw-mock-scenario=webauthn-verify-mfa_ But please note, as mentioned above, the verification flow will give an error in the Browser prompt that the Identity could not be verified preventing you from authenticating.
