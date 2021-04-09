import OktaSignIn from '@okta/okta-signin-widget';
import { OktaAuth, Tokens } from '@okta/okta-auth-js';
import { expectType, expectError, expectAssignable } from 'tsd';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

// Test simple constructor. Only baseUrl is required
const signIn = new OktaSignIn({
  baseUrl: 'https://{yourOktaDomain}',
});
expectType<OktaSignIn>(signIn);
// $ExpectError
expectError(new OktaSignIn());

// Test authClient
expectType<OktaAuth>(signIn.authClient);
expectType<Promise<boolean>>(signIn.authClient.session.exists());

// Test show, hide, remove
expectType<void>(signIn.show());
expectType<void>(signIn.hide());
expectType<void>(signIn.remove());

// Test event subscibe
signIn.on('ready', (context) => {
  expectType<string>(context.controller);
});
signIn.on('afterError', (context, error) => {
  expectType<string>(context.controller);
  expectType<string>(error.message);
  expectType<number | undefined>(error.statusCode);
  expectType<number | undefined>(error.xhr?.status);
});
signIn.on('afterRender', (context) => {
  expectType<string>(context.controller);
});

// Test event unsubscribe
const errorCallback: OktaSignIn.EventCallbackWithError = (_context, _error) => {};
expectType<void>(signIn.off('afterError', errorCallback));
// $ExpectError
expectError(signIn.off('ready', errorCallback));
expectType<void>(signIn.off('ready'));
expectType<void>(signIn.off());

// Test showSignInToGetTokens
expectType<Promise<Tokens>>(
  signIn.showSignInToGetTokens({
    el: '#container',
    clientId: '{clientId}',
    redirectUri: '{redirectUri}',
    scopes: ['openid', 'profile']
  })
);
signIn.showSignInToGetTokens({
  el: '#container',
}).then((tokens) => {
  expectType<string | undefined>(tokens.accessToken?.value);
}).catch((err: OktaSignIn.RenderError) => {
  expectType<string>(err.message);
});

// Test showSignInAndRedirect
expectType<void>(
  await signIn.showSignInAndRedirect({
    el: '#container',
    clientId: '{clientId}',
    redirectUri: '{redirectUri}'
  })
);

// Test renderEl
const renderRes = await signIn.renderEl({el: '#container'}, () => {}, (err) => {
  expectType<string>(err.message);
});
expectAssignable<string>(renderRes.status);
switch (renderRes.status) {
case 'FORGOT_PASSWORD_EMAIL_SENT':
case 'UNLOCK_ACCOUNT_EMAIL_SENT':
case 'ACTIVATION_EMAIL_SENT':
  expectType<string>(renderRes.username);
  break;
case 'REGISTRATION_COMPLETE':
  expectType<string>(renderRes.activationToken);
  break;
case 'SUCCESS':
  // OIDC
  expectType<string | undefined>(renderRes.tokens?.accessToken?.value);
  // non-OIDC
  expectType<string | undefined>(renderRes.user?.profile.firstName);
  if (renderRes.type === 'SESSION_SSO') {
    expectType<void | undefined>(renderRes.session?.setCookieAndRedirect('<redirectUri>'));
  } else if (renderRes.type === 'SESSION_STEP_UP') {
    expectType<void | undefined>(renderRes.stepUp?.finish());
    expectType<string | undefined>(renderRes.stepUp?.url);
  } else {
    expectType<void | undefined>(renderRes.stepUp?.finish());
  }
  break;
}

// Test constructor with full config
const signIn2 = new OktaSignIn({
  baseUrl: 'https://{yourOktaDomain}',
  clientId: '{yourClientId}',
  redirectUri: '{{redirectUri configured in OIDC app}}',
  authParams: {
    display: 'page',
    responseType: ['id_token', 'token'],
    scopes: ['openid', 'email', 'profile', 'address', 'phone'],
    state: '8rFzn3MH5q',
    responseMode: 'form_post',
    nonce: '51GePTswrm',
    pkce: false,
    issuer: 'https://{yourOktaDomain}/oauth2/default',
    clientId: '{yourClientId}',
    authorizeUrl: 'https://{yourOktaDomain}/oauth2/default/v1/authorize',
    authScheme: 'OAUTH2',
  },
  logo: '/path/to/logo.png',
  logoText: 'logo text',
  helpSupportNumber: '(123) 456-7890',
  brandName: 'Spaghetti Inc.',
  language: 'en',
  i18n: {
    en: {
      'primaryauth.title': 'Sign in to Acme',
      'primaryauth.username.placeholder': 'Your Acme Username',
      'country.AF': 'Afghanistan, edited',
      'country.AL': 'Albania, edited'
    },
    ja: {
      'primaryauth.title': 'ACMEにサインイン',
      'primaryauth.username.placeholder': 'ACMEのユーザー名'
    }
  },
  username: 'john@acme.com',
  transformUsername: (username, _operation) => {
    return username.indexOf('@acme.com') > -1
      ? username
      : username + '@acme.com';
  },
  policyId: '1234',
  processCreds: (creds) => {
    expectType<string>(creds.username);
    expectType<string>(creds.password);
  },
  assets: {
    baseUrl: '/path/to/dist',
    rewrite: (assetPath) => {
      expectType<string>(assetPath);
      return assetPath;
    }
  },
  colors: {
    brand: '#008000',
  },
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
  },
  signOutLink: 'https://www.signmeout.com',
  customButtons: [{
    title: 'Click Me',
    className: 'btn-customAuth',
    click: () => {
      window.location.href = 'https://www.example.com';
    }
  }, {
    i18nKey: 'customButton.title',
    className: 'btn-customAuth',
    click: () => {
      window.location.href = 'https://www.example.com';
    }
  }],
  registration: {
    click: () => {
      window.location.href = 'https://acme.com/sign-up';
    },
    parseSchema: (schema, onSuccess, _onFailure) => {
      schema.profileSchema.properties.address = {
        type: 'string',
        description: 'Street Address',
        default: 'Enter your street address',
        maxLength: 255
      };
      const countryCode: OktaSignIn.Registration.FieldStringWithFormatAndEnum = {
        type: 'country_code',
        enum: ['US', 'CA'],
        oneOf: [
          {title: 'Canada', const: 'CA'},
          {title: 'United States', const: 'US'},
        ]
      };
      schema.profileSchema.properties['country_code'] = countryCode;
      schema.profileSchema.fieldOrder.push('address');
      schema.profileSchema.required.push('country_code');
      onSuccess(schema);
    },
    preSubmit: (postData, onSuccess, onFailure) => {
      const username = <string> postData.username;
      if (username.indexOf('@acme.com') === -1) {
        postData.username += '@acme.com';
      }
      onSuccess(postData);
      const err: OktaSignIn.Error = {
        errorSummary: 'API Error',
        errorCauses: [
          {
            domain: 'registration request',
            errorSummary: 'A user with this Email already exists',
            locationType: 'body',
            reason: 'UNIQUE_CONSTRAINT',
            location: 'email',
          }
        ]
      };
      onFailure(err);
    },
    postSubmit: (response, onSuccess, _onFailure) => {
      onSuccess(response);
    }
  },
  features: {
    registration: true,
    idpDiscovery: true,
    autoPush: true,
    multiOptionalFactorEnroll: true,
  },
  idps: [
    {type: 'GOOGLE', id: '0oaaix1twko0jyKik0g1'},
    {type: 'FACEBOOK', id: '0oar25ZnMM5LrpY1O0g2'},
    {type: 'APPLE', id: '0oaaix1twko0jyKik0g3'},
    {type: 'MICROSOFT', id: '0oaaix1twko0jyKik0g4'},
    {type: 'LINKEDIN', id: '0oaaix1twko0jyKik0g5'},
    {id: '0oabds23xM3ssMjosl0g5', text: 'Login with Joe', className: 'with-joe' }
  ],
  idpDisplay: 'PRIMARY',
  idpDiscovery: {
    requestContext: 'http://rain.okta1.com:1802/app/UserHome',
  },
  oAuthTimeout: 300000,
  piv: {
    certAuthUrl: '/your/cert/validation/endpoint',
    text: 'Authenticate with a Smart Card',
    className: 'custom-style',
    isCustomDomain: true,
  },
  recoveryToken: 'x0whAcR02i0leKtWMZVc',
  stateToken: '00eL1hS274lCJnfPCifGwB-jNgwNeKlviamZhdloF1',
  relayState: '%2Fapp%2FUserHome',
  globalSuccessFn: (res) => {
    expectAssignable<string>(renderRes.status);
  },
  globalErrorFn: (err) => {
    expectType<string>(err.message);
  },
  apiVersion: '1.0.0',
  consent: {
    cancel: () => {}
  },
});
expectType<OktaSignIn>(signIn2);

expectType<OktaSignIn>(new OktaSignIn({
  baseUrl: 'https://{yourOktaDomain}',
  language: (supportedLanguages, userLanguages) => {
    return supportedLanguages[0];
  }
}));

expectError(new OktaSignIn({
  // $ExpectError
  language: 'unsupported',
}));
