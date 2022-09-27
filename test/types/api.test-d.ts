import {
  OktaSignIn,
  EventCallback,
  EventContext,
  RenderError,
  OktaSignInAPI,
  RouterEventsAPI,
  EventCallbackWithError,
  EventErrorContext
} from '@okta/okta-signin-widget';
import { OktaAuthOAuthInterface, Tokens } from '@okta/okta-auth-js';
import { expectType, expectError, expectAssignable } from 'tsd';
/* eslint-disable @typescript-eslint/no-unused-vars */

// Test simple constructor. Only baseUrl is required
const signIn: OktaSignIn = new OktaSignIn({
  baseUrl: 'https://{yourOktaDomain}',
});
expectType<OktaSignIn>(signIn);

// Test that instance can be assigned to the available interfaces
expectAssignable<OktaSignInAPI>(signIn);
expectAssignable<RouterEventsAPI>(signIn);

// $ExpectError
expectError(new OktaSignIn());

// Test authClient
expectType<OktaAuthOAuthInterface>(signIn.authClient);
expectType<Promise<boolean>>(signIn.authClient.session.exists());

// Test show, hide, remove
expectType<void>(signIn.show());
expectType<void>(signIn.hide());
expectType<void>(signIn.remove());

// Test event subscibe
signIn.on('ready', (context: EventContext) => {
  expectType<string>(context.controller);
});
signIn.on('afterError', (context: EventContext, error: EventErrorContext) => {
  expectType<string>(context.controller);
  expectType<string | undefined>(error.message);
  expectType<number | undefined>(error.statusCode);
  expectType<number | undefined>(error.xhr?.status);
});
signIn.on('afterRender', (context: EventContext) => {
  expectType<string>(context.controller);
});

// Test event unsubscribe
const eventCallback: EventCallback = (_context: EventContext) => {};
const eventCallbackWithError: EventCallbackWithError = (_context: EventContext, _error: EventErrorContext) => {};
expectType<void>(signIn.off('afterError', eventCallbackWithError));
expectType<void>(signIn.off('ready', eventCallbackWithError));

// $ExpectError
// expectError(signIn.off('afterError', eventCallback)); // TODO: callback must have error parameter
expectType<void>(signIn.off('ready', eventCallback));
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
}).then((tokens: Tokens) => {
  expectType<string | undefined>(tokens.accessToken?.accessToken);
}).catch((err: RenderError) => {
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
const renderRes = await signIn.renderEl({el: '#container'}, () => {}, (err: RenderError) => {
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
  expectType<string | undefined>(renderRes.tokens?.accessToken?.accessToken);
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


