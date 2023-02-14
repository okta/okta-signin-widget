# Okta Sign-In Widget

The Okta Sign-In Widget is an HTML/CSS/JS widget that provides out-of-the-box authentication and identity experiences for your organization's apps. It's the pre-built and customizable solution used by the Okta Workforce Identity Cloud.

This Readme is specific to the **3rd-generation** widget.

**Table of contents**
- [Okta Sign-In Widget](#okta-sign-in-widget)
  - [Generation overview](#generation-overview)
  - [Deployment Models](#deployment-models)
    - [Redirect to Okta-hosted](#redirect-to-okta-hosted)
    - [Customer embedded](#customer-embedded)
    - [Non-SIW or SDK app (brief mention)](#non-siw-or-sdk-app-brief-mention)
  - [Type of Applications](#type-of-applications)
    - [OIDC](#oidc)
    - [Non-OIDC](#non-oidc)
  - [Implementation Section](#implementation-section)
    - [Okta Hosted Setup](#okta-hosted-setup)
    - [Customer Hosted Set Up](#customer-hosted-set-up)
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

The 3rd-generation Sign-in Widget is more accessible, and uses modern frameworks with a better user and developer experience. It's built from the ground up for the Okta Identity Engine, and removes support for the Okta Classic Engine.

If you're using previous generation with code customization, this new generation has breaking changes that will require manual upgrade. If you don't have code customizations, upgrading should be simple.

| Widget generation  | Included in release versions   | Okta platform   | Internal frameworks   |
| ---                | ---                            | ---             | ---                   |
| 1st                | v1–9                           | Classic         | Backbone, bespoke UI framework |
| 2nd                | v5–9                           | OIE   | Backbone, bespoke UI framework |
| 3rd                | v10+                           | OIE             | Preact, MUI |

⚠️ The **3rd-gen widget is currently in beta** and does not have complete feature parity with previous generations.

Future releases will add more features over time, but 3rd-gen widget will become Generally Available without complete feature parity.

Previous generations will remain supported during the transition, and have more feature releases of their own on the way.

Eventually, previous generations will be sunset. We expect this to be gradual with multiple phases; more details to come.


## Deployment Models

Learn more about [redirect vs embedded](https://developer.okta.com/docs/concepts/redirect-vs-embedded/).

### Redirect to Okta-hosted

Introduction & when to use this
CDN
* Recommended for Workforce & Business Partner Apps
Example Application Link (Sample)
Branding/Customization touchpoints

### Customer embedded 
Introduction & when to use this
* Not recommended for Workforce & Business Partner Apps
NPM vs CDN
Example Application Link (Sample)

### Non-SIW or SDK app (brief mention)
Introduction & when to use this
* Not recommended for Workforce & Business Partner Apps
Link out to one of the SDKs (link to all related SDKs


## Type of Applications 
### OIDC
* SPA Introduction
* Web Introduction
### Non-OIDC
* SAML?


## Implementation Section
### Okta Hosted Setup 
1. Create an okta org
2. Sign In Widget section
3. Brand and customize
4. Customize domain


### Customer Hosted Set Up
1. Set Up
NPM or CDN

2. Config Options Reference
All the options here or a file called Config.MD hosts all the SIW config options with explanation with example code for each

3. API Reference
All the APIs here or a file called API.md hosts all the SIW APIs and each API call has input, output params, and what the function does with example code.

4. Samples
Full samples are each their own repos. Each sample has a one-page Readme.MD to show how to get the samples to work. 
These samples are not generated and the flow of code is simple and easy to understand. Right now it’s hard to follow the flow of code. Samples must always use the latest widget versions.


## Migrating to the 3rd generation

To migrate to the latest widget, first determine whether your org uses Classic or Identity Engine. All new orgs created after March 1, 2022 are Identity Engine orgs.

In the Admin Console footer, find the Okta version. It looks like `Version 2023.04.1 E`.

`C` means your org is Classic; `E` means Identity Engine.

* If your org is Classic, you need to upgrade to Identity Engine before migrating to the latest widget. [Learn more about upgrading to Identity Engine.](https://help.okta.com/oie/en-us/Content/Topics/identity-engine/oie-upgrade-eligibility.htm)

* If your org uses Identity Engine, you're ready to plan your widget migration.

Start by evaluating whether the 3rd-generation widget supports everything you need.

X

Y

Z


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

#### Authenticators

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
