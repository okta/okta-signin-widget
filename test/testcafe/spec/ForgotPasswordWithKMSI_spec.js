import { ClientFunction, RequestMock, RequestLogger, Selector, userVariables } from 'testcafe';
import BasePageObject from '../framework/page-objects/BasePageObject';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import FactorEnrollPasswordPageObject from '../framework/page-objects/FactorEnrollPasswordPageObject';
import PostAuthKeepMeSignedInPageObject from '../framework/page-objects/PostAuthKeepMeSignedInPageObject';

import xhrWellKnown from '../../../playground/mocks/data/oauth2/well-known-openid-configuration.json';
import xhrInteract from '../../../playground/mocks/data/oauth2/interact.json';
import xhrIdentifyWithPassword from '../../../playground/mocks/data/idp/idx/identify-with-password';
import xhrIdentifyRecovery from '../../../playground/mocks/data/idp/idx/identify-recovery';
import xhrResetPassword from '../../../playground/mocks/data/idp/idx/authenticator-reset-password';
import xhrPostAuthKeepMeSignedIn from '../../../playground/mocks/data/idp/idx/post-auth-keep-me-signed-in';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';
import { oktaDashboardContent } from '../framework/a11y';

// OKTA-1152243: Forgot password flow with POST KMSI.
//
// Flow: identify-with-password → [click Forgot Password] → identify-recovery
//   → submit identifier → reset-password → submit new password → keep-me-signed-in → success
//
// Gen2 (oauth2 embedded): clicking "Forgot Password" triggers restartLoginFlow('resetPassword'),
//   which starts a new interact/introspect. The bug was that auth-js threw
//   "No remediation can match current flow" when keep-me-signed-in appeared
//   after password reset because it's not in PasswordRecoveryFlow.
//
// Gen3: clicking "Forgot Password" calls idx.proceed with the action directly
//   (POSTs to /idp/idx/recover). The flow stays 'default' so the bug doesn't apply,
//   but we still verify the full forgot-password-with-KMSI flow works.

// Introspect returns identify-with-password on first call.
// In gen2 oauth2 mode, restartLoginFlow triggers a second interact/introspect
// which should return identify-recovery.
let introspectCount = 0;
const introspectHandler = (req, res) => {
  introspectCount++;
  const response = introspectCount <= 1 ? xhrIdentifyWithPassword : xhrIdentifyRecovery;
  res.setBody(response);
};

// Single mock covering both gen2 and gen3 paths:
// - Gen2 (oauth2): uses well-known, interact, introspect(x2). Skips /recover.
// - Gen3 (stateToken): uses introspect(x1), /recover. Skips oauth2 endpoints.
const mock = RequestMock()
  .onRequestTo('http://localhost:3000/oauth2/default/.well-known/openid-configuration')
  .respond(xhrWellKnown, 200)
  .onRequestTo('http://localhost:3000/oauth2/default/v1/interact')
  .respond(xhrInteract, 200)
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(introspectHandler)
  // gen3: forgot password action POSTs here
  .onRequestTo('http://localhost:3000/idp/idx/recover')
  .respond(xhrIdentifyRecovery)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrResetPassword)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrPostAuthKeepMeSignedIn)
  .onRequestTo('http://localhost:3000/idp/idx/keep-me-signed-in')
  .respond(xhrSuccess)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const renderWidget = ClientFunction((settings) => {
  window.renderPlaygroundWidget(settings);
});

const logger = RequestLogger(/idp\/idx/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

fixture('Forgot Password with POST KMSI')
  .beforeEach(() => {
    introspectCount = 0;
  });

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  const basePage = new BasePageObject(t);

  if (userVariables.gen3) {
    // Gen3: default playground stateToken mode
    await basePage.navigateToPage();
  } else {
    // Gen2: oauth2 embedded mode to trigger restartLoginFlow('resetPassword')
    await basePage.navigateToPage({ render: false });
    await basePage.mockCrypto();
    await renderWidget({
      stateToken: undefined,
      clientId: 'fake',
      redirectUri: 'http://doesnot-matter',
      authScheme: 'oauth2',
      authParams: {
        pkce: true,
        state: 'mock-state'
      }
    });
  }

  await t.expect(identityPage.formExists()).eql(true);
  return identityPage;
}

test
  .requestHooks(logger, mock)('should show KMSI after forgot password reset', async t => {
    const identityPage = await setup(t);

    // Step 1: On identify-with-password page, click "Forgot password?" link
    await t.expect(await identityPage.hasForgotPasswordLinkText()).ok();
    const forgotPasswordLink = Selector('[data-se="forgot-password"]');
    await t.click(forgotPasswordLink);

    // Step 2: Recovery page. Enter identifier and submit.
    const identityRecoveryPage = new IdentityPageObject(t);
    await t.expect(identityRecoveryPage.formExists()).eql(true);
    await identityRecoveryPage.fillIdentifierField('testUser@okta.com');
    await identityRecoveryPage.clickNextButton();

    // Step 3: Reset password page. Enter new password and submit.
    const resetPasswordPage = new FactorEnrollPasswordPageObject(t);
    await t.expect(resetPasswordPage.formExists()).eql(true);
    await resetPasswordPage.fillPassword('Abcd1234!@');
    await resetPasswordPage.fillConfirmPassword('Abcd1234!@');
    await resetPasswordPage.clickResetPasswordButton();

    // Step 4: KMSI page should appear (this is where the gen2 bug manifested).
    const kmsiPage = new PostAuthKeepMeSignedInPageObject(t);
    await t.expect(kmsiPage.getFormTitle()).eql('Keep me signed in');
    await t.expect(kmsiPage.getAcceptButtonText()).eql('Stay signed in');
    await t.expect(kmsiPage.getRejectButtonText()).eql('Don\'t stay signed in');
  });
