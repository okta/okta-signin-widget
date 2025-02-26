import { RequestMock, RequestLogger, userVariables } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import ChallengeCustomAppPushPageObject from '../framework/page-objects/ChallengeCustomAppPushPageObject';
import {
  checkConsoleMessages,
  renderWidget,
  oktaDashboardContent,
  logI18nErrorsToConsole,
  checkI18nErrors,
} from '../framework/shared';

import pushPoll from '../../../playground/mocks/data/idp/idx/authenticator-verification-custom-app-push';
import pushPollReject from '../../../playground/mocks/data/idp/idx/authenticator-verification-custom-app-push-reject';
import success from '../../../playground/mocks/data/idp/idx/success';
import pushPollAutoChallenge from '../../../playground/mocks/data/idp/idx/authenticator-verification-custom-app-push-autochallenge';
import pushEnableBiometricsCustomApp from '../../../playground/mocks/data/idp/idx/custom-app-uv-verify-enable-biometrics';
import xhrSelectAuthenticatorCustomPushWithMethodSendPush from '../../../playground/mocks/data/idp/idx/authenticator-verification-data-custom-push-autoChallenge-off';
const logger = RequestLogger(/challenge|challenge\/poll|authenticators\/poll/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const pushSuccessMock = pollResponse => RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(pushPoll)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(pollResponse)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const pushSuccessMock1 = pushSuccessMock(!userVariables.gen3 ? success : pushPoll);
const pushSuccessMock2 = pushSuccessMock(success);

const pushRejectMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(pushPoll)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(pushPollReject)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(pushPoll);

const pushWaitMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(pushPoll)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(pushPoll);

const pushNoAutoChallengeMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(pushPoll)
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(pushPoll);

const pushAutoChallengeMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(pushPollAutoChallenge)
  .onRequestTo('http://localhost:3000/idp/idx/authenticators/poll')
  .respond(pushPollAutoChallenge);

const pushWaitAutoChallengeMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(pushPollAutoChallenge)
  .onRequestTo('http://localhost:3000/idp/idx/authenticators/poll')
  .respond(pushPollAutoChallenge);

const pushEnableBiometricsMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(pushPollAutoChallenge)
  .onRequestTo('http://localhost:3000/idp/idx/authenticators/poll')
  .respond(pushEnableBiometricsCustomApp);

const mockCustomAppSendPush = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticatorCustomPushWithMethodSendPush);

fixture('Challenge Custom App Push');

async function setup(t, widgetOptions) {
  const options = widgetOptions ? { render: false } : {};
  const challengeCustomAppPushPageObject = new ChallengeCustomAppPushPageObject(t);
  await challengeCustomAppPushPageObject.navigateToPage(options);
  if (widgetOptions) {
    await renderWidget(widgetOptions);
  }
  await t.expect(challengeCustomAppPushPageObject.formExists()).ok();
  return challengeCustomAppPushPageObject;
}

test.requestHooks(mockCustomAppSendPush)(
  'should load custom app view with a button and a checkbox when push is the only method type and has auto challenge schema',
  async t => {
    const challengeCustomAppPushPageObject = await setup(t);
    await checkA11y(t);
    // Custom app form class not present in gen 3
    if (!userVariables.gen3) {
      await t.expect(await challengeCustomAppPushPageObject.isCustomAppSendPushForm()).ok();
    }
    await t.expect(challengeCustomAppPushPageObject.getFormTitle()).eql('Get a push notification');
    await t.expect(challengeCustomAppPushPageObject.subtitleExists()).notOk();

    const pushButtonLabel = challengeCustomAppPushPageObject.getSaveButtonLabel();
    await t.expect(pushButtonLabel).eql('Send push');

    await t.expect(await challengeCustomAppPushPageObject.autoChallengeInputExists()).eql(true);
    await t.expect(challengeCustomAppPushPageObject.isAutoChallengeChecked()).eql(false);

    // select checkbox on click
    await challengeCustomAppPushPageObject.clickAutoChallengeCheckbox();
    await t.expect(challengeCustomAppPushPageObject.isAutoChallengeChecked()).eql(true);

    // signout link at enroll page
    await t.expect(await challengeCustomAppPushPageObject.signoutLinkExists()).ok();
    await t.expect(challengeCustomAppPushPageObject.getSignoutLinkText()).eql('Back to sign in');
  });

test
  .requestHooks(pushSuccessMock1)('challenge custom app push screen has right labels', async t => {
    const challengeCustomAppPushPageObject = await setup(t);
    await checkA11y(t);
    await checkConsoleMessages({
      controller: 'mfa-verify',
      formName: 'challenge-poll',
      authenticatorKey: 'custom_app',
      methodType: 'push',
    });

    const pageTitle = challengeCustomAppPushPageObject.getFormTitle();
    const pageSubtitle = challengeCustomAppPushPageObject.getFormSubtitle();
    const pushBtn = challengeCustomAppPushPageObject.getPushButton();
    const a11ySpan = challengeCustomAppPushPageObject.getA11ySpan();
    // no a11y span in gen 3
    if (!userVariables.gen3) {
      await t.expect(pushBtn.textContent).contains('Push notification sent');
      await t.expect(a11ySpan.textContent).contains('Push notification sent');
      await t.expect(challengeCustomAppPushPageObject.isPushButtonDisabled()).eql(true);
      await t.expect(pageTitle).contains('Verify with Custom Push');
    } else {
      await t.expect(pageTitle).contains('Push notification sent');
      await t.expect(pageSubtitle).contains('Respond on your mobile device to continue.');
    }

    // Verify links
    await t.expect(await challengeCustomAppPushPageObject.verifyWithSomethingElseLinkExists()).ok();
    await t.expect(challengeCustomAppPushPageObject.getSwitchAuthenticatorLinkText()).eql('Verify with something else');
    await t.expect(await challengeCustomAppPushPageObject.signoutLinkExists()).ok();
    await t.expect(challengeCustomAppPushPageObject.getSignoutLinkText()).eql('Back to sign in');
  });

test
  .requestHooks(pushAutoChallengeMock)('challenge custom app push screen has right labels, custom logo and auto challenge checkbox', async t => {
    const challengeCustomAppPushPageObject = await setup(t);
    await checkA11y(t);
    await checkConsoleMessages({
      controller: 'mfa-verify',
      formName: 'challenge-poll',
      authenticatorKey: 'custom_app',
      methodType: 'push',
    });

    const pageTitle = challengeCustomAppPushPageObject.getFormTitle();
    const pageSubtitle = challengeCustomAppPushPageObject.getFormSubtitle();
    const pushBtn = challengeCustomAppPushPageObject.getPushButton();
    const a11ySpan = challengeCustomAppPushPageObject.getA11ySpan();
    const logoSelector = challengeCustomAppPushPageObject.getBeaconSelector();
    const logoBgImage = challengeCustomAppPushPageObject.getBeaconBgImage();
    // no a11y span in gen 3
    if (!userVariables.gen3) {
      await t.expect(pushBtn.textContent).contains('Push notification sent');
      await t.expect(a11ySpan.textContent).contains('Push notification sent');
      await t.expect(challengeCustomAppPushPageObject.isPushButtonDisabled()).eql(true);
      await t.expect(pageTitle).contains('Verify with Custom Push Authenticator');
    } else {
      await t.expect(pageTitle).contains('Push notification sent');
      await t.expect(pageSubtitle).contains('Respond on your mobile device to continue.');
    }
    
    await t.expect(logoSelector).contains('custom-app-logo');
    // gen 3 uses img element with src attribute while gen 2 uses background-image style prop
    if(userVariables.gen3) {
      await t.expect(logoBgImage).match(/.*\/img\/icons\/mfa\/customPushLogo\.svg$/);
    } else {
      await t.expect(logoBgImage).match(/^url\(".*\/img\/icons\/mfa\/customPushLogo\.svg"\)$/);
    }

    await t.expect(await challengeCustomAppPushPageObject.autoChallengeInputExists()).eql(true);
    await t.expect(challengeCustomAppPushPageObject.isAutoChallengeChecked()).ok();

    // make sure checkbox is visible
    await t.expect(await challengeCustomAppPushPageObject.autoChallengeInputIsVisible()).ok();

    // unselect checkbox on click
    await challengeCustomAppPushPageObject.clickAutoChallengeCheckbox();
    await t.expect(challengeCustomAppPushPageObject.isAutoChallengeChecked()).notOk();

    // Verify links
    await t.expect(await challengeCustomAppPushPageObject.verifyWithSomethingElseLinkExists()).ok();
    await t.expect(challengeCustomAppPushPageObject.getSwitchAuthenticatorLinkText()).eql('Verify with something else');
    await t.expect(await challengeCustomAppPushPageObject.signoutLinkExists()).ok();
    await t.expect(challengeCustomAppPushPageObject.getSignoutLinkText()).eql('Back to sign in');
  });

test
  .requestHooks(pushNoAutoChallengeMock)('challenge custom app push screen does not have checkbox when autoChallenge object is missing from IDX remediation response', async t => {
    const challengeCustomAppPushPageObject = await setup(t);
    await checkA11y(t);
    
    // all UI elements should be present except the checkbox
    const pageTitle = challengeCustomAppPushPageObject.getFormTitle();
    const pageSubtitle = challengeCustomAppPushPageObject.getFormSubtitle();
    const pushBtn = challengeCustomAppPushPageObject.getPushButton();
    const a11ySpan = challengeCustomAppPushPageObject.getA11ySpan();
    const logoSelector = challengeCustomAppPushPageObject.getBeaconSelector();
    const logoBgImage = challengeCustomAppPushPageObject.getBeaconBgImage();
    // no a11y span in gen 3
    if (!userVariables.gen3) {
      await t.expect(pushBtn.textContent).contains('Push notification sent');
      await t.expect(a11ySpan.textContent).contains('Push notification sent');
      await t.expect(challengeCustomAppPushPageObject.isPushButtonDisabled()).eql(true);
      await t.expect(pageTitle).contains('Verify with Custom Push');
    } else {
      await t.expect(pageTitle).contains('Push notification sent');
      await t.expect(pageSubtitle).contains('Respond on your mobile device to continue.');
    }
    await t.expect(logoSelector).contains('custom-app-logo');
    // gen 3 uses img element with src attribute while gen 2 uses background-image style prop
    if(userVariables.gen3) {
      await t.expect(logoBgImage).match(/.*\/img\/icons\/mfa\/customPushLogo\.svg$/);
    } else {
      await t.expect(logoBgImage).match(/^url\(".*\/img\/icons\/mfa\/customPushLogo\.svg"\)$/);
    }

    // Verify links
    await t.expect(await challengeCustomAppPushPageObject.verifyWithSomethingElseLinkExists()).ok();
    await t.expect(challengeCustomAppPushPageObject.getSwitchAuthenticatorLinkText()).eql('Verify with something else');
    await t.expect(await challengeCustomAppPushPageObject.signoutLinkExists()).ok();
    await t.expect(challengeCustomAppPushPageObject.getSignoutLinkText()).eql('Back to sign in');

    // assert checkbox not visible
    await t.expect(await challengeCustomAppPushPageObject.autoChallengeInputIsVisible()).notOk();
  });

test
  .requestHooks(pushSuccessMock1)('challenge custom push screen has right labels and logo', async t => {
    const challengeCustomAppPushPageObject = await setup(t);
    await checkA11y(t);
    await checkConsoleMessages({
      controller: 'mfa-verify',
      formName: 'challenge-poll',
      authenticatorKey: 'custom_app',
      methodType: 'push',
    });

    const pageTitle = challengeCustomAppPushPageObject.getFormTitle();
    const pageSubtitle = challengeCustomAppPushPageObject.getFormSubtitle();
    const pushBtn = challengeCustomAppPushPageObject.getPushButton();
    const a11ySpan = challengeCustomAppPushPageObject.getA11ySpan();
    const logoSelector = challengeCustomAppPushPageObject.getBeaconSelector();
    const logoBgImage = challengeCustomAppPushPageObject.getBeaconBgImage();
    // no a11y span in gen 3
    if (!userVariables.gen3) {
      await t.expect(pushBtn.textContent).contains('Push notification sent');
      await t.expect(a11ySpan.textContent).contains('Push notification sent');
      await t.expect(challengeCustomAppPushPageObject.isPushButtonDisabled()).eql(true);
      await t.expect(pageTitle).contains('Verify with Custom Push');
    } else {
      await t.expect(pageTitle).contains('Push notification sent');
      await t.expect(pageSubtitle).contains('Respond on your mobile device to continue.');
    }
    await t.expect(logoSelector).contains('custom-app-logo');
    // gen 3 uses img element with src attribute while gen 2 uses background-image style prop
    if(userVariables.gen3) {
      await t.expect(logoBgImage).match(/.*\/img\/icons\/mfa\/customPushLogo\.svg$/);
    } else {
      await t.expect(logoBgImage).match(/^url\(".*\/img\/icons\/mfa\/customPushLogo\.svg"\)$/);
      await t.expect(logoSelector).contains('mfa-custom-app');
    }
    await t.expect(await challengeCustomAppPushPageObject.autoChallengeInputExists()).notOk();

    // Verify links
    await t.expect(await challengeCustomAppPushPageObject.verifyWithSomethingElseLinkExists()).ok();
    await t.expect(challengeCustomAppPushPageObject.getSwitchAuthenticatorLinkText()).eql('Verify with something else');
    await t.expect(await challengeCustomAppPushPageObject.signoutLinkExists()).ok();
    await t.expect(challengeCustomAppPushPageObject.getSignoutLinkText()).eql('Back to sign in');
  });

test
  .requestHooks(pushNoAutoChallengeMock)(`challenge custom app push screen does not have checkbox
    when autoChallenge object is missing from IDX remediation response`, async t => {
    
    const challengeCustomAppPushPageObject = await setup(t);
    
    // all UI elements should be present except the checkbox
    const pageTitle = challengeCustomAppPushPageObject.getFormTitle();
    const pageSubtitle = challengeCustomAppPushPageObject.getFormSubtitle();
    const pushBtn = challengeCustomAppPushPageObject.getPushButton();
    const a11ySpan = challengeCustomAppPushPageObject.getA11ySpan();
    const logoSelector = challengeCustomAppPushPageObject.getBeaconSelector();
    // no a11y span in gen 3
    if (!userVariables.gen3) {
      await t.expect(pushBtn.textContent).contains('Push notification sent');
      await t.expect(a11ySpan.textContent).contains('Push notification sent');
      await t.expect(challengeCustomAppPushPageObject.isPushButtonDisabled()).eql(true);
      await t.expect(pageTitle).contains('Verify with Custom Push');
    } else {
      await t.expect(pageTitle).contains('Push notification sent');
      await t.expect(pageSubtitle).contains('Respond on your mobile device to continue.');
    }
    await t.expect(logoSelector).contains('custom-app-logo');

    // Verify links
    await t.expect(await challengeCustomAppPushPageObject.verifyWithSomethingElseLinkExists()).ok();
    await t.expect(challengeCustomAppPushPageObject.getSwitchAuthenticatorLinkText()).eql('Verify with something else');
    await t.expect(await challengeCustomAppPushPageObject.signoutLinkExists()).ok();
    await t.expect(challengeCustomAppPushPageObject.getSignoutLinkText()).eql('Back to sign in');

    // assert checkbox not visible
    await t.expect(await challengeCustomAppPushPageObject.autoChallengeInputIsVisible()).notOk();
  });

test
  .requestHooks(logger, pushSuccessMock1)('challenge Custom App push request', async t => {
    await setup(t);
    await checkA11y(t);
    if (userVariables.gen3) {
      // switch to success mock response
      await t.removeRequestHooks(pushSuccessMock1);
      await t.addRequestHooks(pushSuccessMock2);
      // wait for additional poll
      await t.wait(4000);
    }
    const successPage = new SuccessPageObject(t);
    const pageUrl = await successPage.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
    // polling issue in v3 - https://oktainc.atlassian.net/browse/OKTA-587189
    // logger.count not consistent in v3
    if (!userVariables.gen3) {
      await t.expect(logger.count(() => true)).eql(1);
    }

    const { request: {
      body: answerRequestBodyString,
      method: answerRequestMethod,
      url: answerRequestUrl,
    }
    } = logger.requests[0];
    const answerRequestBody = JSON.parse(answerRequestBodyString);
    await t.expect(answerRequestBody).eql({
      stateHandle: '02XxswQHZqCz4aWbqQFNXYRC4HHoqd76NBC-FIGbbH'
    });
    await t.expect(answerRequestMethod).eql('post');
    await t.expect(answerRequestUrl).eql('http://localhost:3000/idp/idx/challenge/poll');
  });

test
  .requestHooks(logger, pushWaitMock)('challenge Custom App push polling', async t => {
    await setup(t);
    await checkA11y(t);
    await t.wait(4000);
    // polling API should be called
    // polling issue in v3 - https://oktainc.atlassian.net/browse/OKTA-587189
    // logger.count not consistent in v3
    if (!userVariables.gen3) {
      await t.expect(logger.count(() => true)).eql(1);
    }

    const { request: {
      body: answerRequestBodyString,
      method: answerRequestMethod,
      url: answerRequestUrl,
    }
    } = logger.requests[0];
    const answerRequestBody = JSON.parse(answerRequestBodyString);
    await t.expect(answerRequestBody).eql({
      stateHandle: '02XxswQHZqCz4aWbqQFNXYRC4HHoqd76NBC-FIGbbH'
    });
    await t.expect(answerRequestMethod).eql('post');
    await t.expect(answerRequestUrl).eql('http://localhost:3000/idp/idx/challenge/poll');

    await t.wait(3000); // 7 sec total elapsed
    // polling issue in v3 - https://oktainc.atlassian.net/browse/OKTA-587189
    if (!userVariables.gen3) {
      await t.expect(logger.count(() => true)).eql(1);
    }

    await t.wait(1000); // 8 sec total elapsed
    // polling issue in v3 - https://oktainc.atlassian.net/browse/OKTA-587189
    // logger.count not consistent in v3
    if (!userVariables.gen3) {
      await t.expect(logger.count(() => true)).eql(2);
    }

    const { request: {
      method: answerRequestMethod2,
      url: answerRequestUrl2,
    }
    } = logger.requests[1];
    await t.expect(answerRequestMethod2).eql('post');
    await t.expect(answerRequestUrl2).eql('http://localhost:3000/idp/idx/challenge/poll');
  });

test
  .requestHooks(logger, pushWaitAutoChallengeMock)('Call Custom App push polling and checkbox should be clickable after polling started', async t => {
    const challengeCustomAppPushPageObject = await setup(t);
    await checkA11y(t);
    await t.expect(await challengeCustomAppPushPageObject.autoChallengeInputExists()).ok();
    await t.expect(challengeCustomAppPushPageObject.isAutoChallengeChecked()).eql(true);

    await setup(t);
    await checkA11y(t);
    await t.wait(4000);
    // polling API should be called
    // polling issue in v3 - https://oktainc.atlassian.net/browse/OKTA-587189
    // logger.count not consistent in v3
    if (!userVariables.gen3) {
      await t.expect(logger.count(() => true)).eql(1);
    }

    // logger request order not consistent in v3
    const autoChallengeLoggerRequest = userVariables.gen3
      ? logger.requests.find(({ request }) => JSON.parse(request.body).autoChallenge === true)
      : logger.requests[0];

    const { request: {
      body: answerRequestBodyString,
      method: answerRequestMethod,
      url: answerRequestUrl,
    }
    } = autoChallengeLoggerRequest;
    const answerRequestBody = JSON.parse(answerRequestBodyString);
    await t.expect(answerRequestBody).contains({
      stateHandle: '02TcECA1PvSpQTx8Zqo08SSYj88KsXxwNKV4PGvVpF',
      autoChallenge: true,
    });
    await t.expect(answerRequestMethod).eql('post');
    await t.expect(answerRequestUrl).eql('http://localhost:3000/idp/idx/authenticators/poll');

    await t.wait(3000); // 7 sec total elapsed
    // polling issue in v3 - https://oktainc.atlassian.net/browse/OKTA-587189
    // logger.count not consistent in v3
    if (!userVariables.gen3) {
      await t.expect(logger.count(() => true)).eql(1);
    }

    await t.wait(1000); // 8 sec total elapsed
    // polling issue in v3 - https://oktainc.atlassian.net/browse/OKTA-587189
    // logger.count not consistent in v3
    if (!userVariables.gen3) {
      await t.expect(logger.count(() => true)).eql(2);
    }

    const { request: {
      method: answerRequestMethod2,
      url: answerRequestUrl2,
    }
    } = logger.requests[1];    
    await t.expect(answerRequestMethod2).eql('post');
    await t.expect(answerRequestUrl2).eql('http://localhost:3000/idp/idx/authenticators/poll');

    // unselect checkbox on click to ensure its still accessible while polling
    await challengeCustomAppPushPageObject.clickAutoChallengeCheckbox();
    await t.expect(challengeCustomAppPushPageObject.isAutoChallengeChecked()).eql(false);
  });
  

test
  .requestHooks(logger, pushRejectMock)('challenge Custom App reject push and then resend', async t => {
    const challengeCustomAppPushPageObject = await setup(t);
    await checkA11y(t);
    const errorBox = challengeCustomAppPushPageObject.getErrorBox();
    await t.expect(errorBox.innerText)
      .contains('You have chosen to reject this login.');
    await t.expect(challengeCustomAppPushPageObject.getResendPushButtonText())
      .eql('Resend push notification');
    // polling issue in v3 - https://oktainc.atlassian.net/browse/OKTA-587189
    // logger.count not consistent in v3
    if (!userVariables.gen3) {
      await t.expect(logger.count(() => true)).eql(1);
    }
    // To make sure polling stops after reject
    await t.wait(5000);

    // polling issue in v3 - https://oktainc.atlassian.net/browse/OKTA-587189
    // logger.count not consistent in v3
    if (!userVariables.gen3) {
      await t.expect(logger.count(() => true)).eql(1);
    }

    await challengeCustomAppPushPageObject.clickResendPushButton();
    // polling issue in v3 - https://oktainc.atlassian.net/browse/OKTA-587189
    // logger.count not consistent in v3
    if (!userVariables.gen3) {
      await t.expect(logger.count(() => true)).eql(2);
    }

    const { request: {
      body: requestBodyString,
      method: requestMethod,
      url: requestUrl,
    }
    } = logger.requests[1];
    const requestBody = JSON.parse(requestBodyString);
    await t.expect(requestBody).eql({
      authenticator: {
        id: 'aut198w4v0f8dr8gT0g4',
        methodType: 'push'
      },
      stateHandle: '02jScqx_dpaclG7Hury1J4J2qS2B_bltQte8eCSQUe'
    });
    await t.expect(requestMethod).eql('post');
    await t.expect(requestUrl).eql('http://localhost:3000/idp/idx/challenge');
  });

test
  .requestHooks(pushWaitMock)('Warning callout appears after 30 seconds', async t => {
    const challengeCustomAppPushPageObject = await setup(t);
    await checkA11y(t);
    await t.wait(10000);
    await t.expect(challengeCustomAppPushPageObject.getWarningBox().length).eql(0);
    await t.wait(20100); // Total > 30s
    const warningBox = challengeCustomAppPushPageObject.getWarningBox();
    await t.expect(warningBox.innerText)
      .contains('Haven\'t received a push notification yet? Try opening Custom Push on your phone.');
  });

test
  .requestHooks(pushWaitMock)('Warning timer should be stopped on view destroy', async t => {
    const challengeCustomAppPushPageObject = await setup(t);
    await checkA11y(t);
    await logI18nErrorsToConsole();
    await challengeCustomAppPushPageObject.clickGoBackLink();
    await t.wait(30100);
    await checkI18nErrors([]);
  });

test.requestHooks(pushSuccessMock1)('should show custom factor page link', async t => {
  const challengeCustomAppPushPageObject = await setup(t, {
    helpLinks: {
      factorPage: {
        text: 'custom factor page link',
        href: 'https://acme.com/what-is-okta-autheticators'
      }
    }
  });
  await checkA11y(t);

  await t.expect(challengeCustomAppPushPageObject.getFactorPageHelpLinksLabel()).eql('custom factor page link');
  await t.expect(challengeCustomAppPushPageObject.getFactorPageHelpLink()).eql('https://acme.com/what-is-okta-autheticators');
});

test
  .requestHooks(logger, pushEnableBiometricsMock)('challenge custom app resend push with uv enable biometrics message', async t => {
    const challengeCustomAppPushPageObject = await setup(t);
    await checkA11y(t);
    await challengeCustomAppPushPageObject.waitForErrorBox();

    const errorTitle = challengeCustomAppPushPageObject.getErrorTitle();
    await t.expect(errorTitle.innerText).contains('Enable biometrics in Custom Push Authenticator');

    const errorBox = challengeCustomAppPushPageObject.getErrorBox();
    await t.expect(errorBox.innerText).contains('Your response was received, but your organization requires biometrics—like a fingerprint or facial scan—for access. Make sure your device meets the following requirements, then try again:');
    await t.expect(errorBox.innerText).contains('Your device supports biometrics'); // bullet #1
    await t.expect(errorBox.innerText).contains('Custom Push Authenticator is up-to-date'); // bullet #2
    await t.expect(errorBox.innerText).contains('In Custom Push Authenticator, biometrics are enabled for your account'); // bullet #3

    await t.expect(challengeCustomAppPushPageObject.getResendPushButtonText()).contains('Resend push notification');
    await t.expect(challengeCustomAppPushPageObject.isResendPushButtonDisabled()).eql(false);
  });
