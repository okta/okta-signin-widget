import { RequestLogger, RequestMock, ClientFunction, userVariables } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import { renderWidget, Constants } from '../framework/shared';
import DeviceChallengePollPageObject from '../framework/page-objects/DeviceChallengePollPageObject';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import identify from '../../../playground/mocks/data/idp/idx/identify';
import identifyWithDeviceProbingLoopback from '../../../playground/mocks/data/idp/idx/identify-with-device-probing-loopback';
import loopbackChallengeNotReceived from '../../../playground/mocks/data/idp/idx/identify-with-device-probing-loopback-challenge-not-received';
import identifyWithLoopbackFallbackAndroidWithoutLink from '../../../playground/mocks/data/idp/idx/identify-with-device-probing-loopback-challenge-not-received-android-no-link';
import identifyWithLaunchAuthenticator from '../../../playground/mocks/data/idp/idx/identify-with-device-launch-authenticator';
import identifyWithSSOExtensionFallback from '../../../playground/mocks/data/idp/idx/identify-with-apple-sso-extension-fallback';
import identifyWithSSOExtensionFallbackWithoutLink from '../../../playground/mocks/data/idp/idx/identify-with-apple-sso-extension-fallback-no-link';
import identifyWithLaunchUniversalLink from '../../../playground/mocks/data/idp/idx/identify-with-universal-link';
import identifyWithLaunchAppLink from '../../../playground/mocks/data/idp/idx/identify-with-app-link';
import userIsNotAssignedError from '../../../playground/mocks/data/idp/idx/error-user-is-not-assigned.json';

const BEACON_CLASS = 'mfa-okta-verify';

let failureCount = 0, pollingError = false, appLinkLoopBackFailed = false;
const loopbackSuccessLogger = RequestLogger(/introspect|probe|challenge/, { logRequestBody: true, stringifyRequestBody: true });
const loopbackSuccessMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond((req, res) => {
    res.statusCode = '200';
    res.headers['content-type'] = 'application/json';
    if (failureCount === 2) {
      res.setBody(identify);
    } else {
      res.setBody(identifyWithDeviceProbingLoopback);
    }
  })
  .onRequestTo({ url: /2000\/probe/, method: 'OPTIONS' })
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo({ url: /2000\/probe/, method: 'GET' })
  .respond(null, 500, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/6511\/probe/)
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/6511\/challenge/)
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'Origin, X-Requested-With, Content-Type, Accept, X-Okta-Xsrftoken',
    'access-control-allow-methods': 'POST, GET, OPTIONS'
  });

const loopbackUserCancelLogger = RequestLogger(/cancel/, { logRequestBody: true, stringifyRequestBody: true });
const loopbackUserCancelLoggerMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll\/cancel/)
  .respond(loopbackChallengeNotReceived);

const loopbackPollMockLogger = RequestLogger(/poll/, { logRequestBody: true, stringifyRequestBody: true });
const loopbackPollTimeoutMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond((req, res) => {
    return new Promise((resolve) => setTimeout(function() {
      res.statusCode = '200';
      res.headers['content-type'] = 'application/json';
      res.setBody(identifyWithDeviceProbingLoopback);
      resolve(res);
    }, Constants.TESTCAFE_DEFAULT_AJAX_WAIT + 2_000));
  })
  .onRequestTo(/2000\/probe/)
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/6511\/probe/)
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/6511\/challenge/)
  .respond((req, res) => {
    res.statusCode = req.method !== 'POST' ? 204 : 403;
    res.headers = {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'Origin, X-Requested-With, Content-Type, Accept, X-Okta-Xsrftoken',
      'access-control-allow-methods': 'POST, GET, OPTIONS'
    };
  })
  .onRequestTo(/6512\/probe/)
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/6512\/challenge/)
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'Origin, X-Requested-With, Content-Type, Accept, X-Okta-Xsrftoken',
    'access-control-allow-methods': 'POST, OPTIONS'
  });

const loopbackPollFailedMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond((req, res) => {
    res.statusCode = '400';
    res.headers['content-type'] = 'application/json';
    res.setBody(userIsNotAssignedError);
  });

const loopbackSuccessButNotAssignedAppMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond((req, res) => {
    res.headers['content-type'] = 'application/json';
    if (pollingError) {
      res.statusCode = '400';
      res.setBody(userIsNotAssignedError);
    } else {
      res.statusCode = '200';
      res.setBody(identifyWithDeviceProbingLoopback);
    }
  })
  .onRequestTo(/2000\/probe/)
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/2000\/challenge/)
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'Origin, X-Requested-With, Content-Type, Accept, X-Okta-Xsrftoken',
    'access-control-allow-methods': 'POST, OPTIONS'
  });

const loopbackChallengeErrorLogger = RequestLogger(/introspect|probe|challenge|poll|cancel/, { logRequestBody: true, stringifyRequestBody: true });
const loopbackChallengeErrorMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo({ url: /2000\/probe/, method: 'OPTIONS'})
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/2000\/probe/)
  .respond(null, 500, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/6511\/probe/)
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo({ url: /6511\/challenge/, method: 'OPTIONS'})
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo({ url: /6511\/challenge/, method: 'POST'})
  .respond(null, 500, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  });

const loopbackChallengeWrongProfileLogger = RequestLogger(/introspect|probe|challenge|poll|cancel/, { logRequestBody: true, stringifyRequestBody: true });
const loopbackChallengeWrongProfileMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo(/(2000|6512)\/probe/)
  .respond(null, 500, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/(6511|6513)\/probe/)
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/6511\/challenge/)
  .respond((req, res) => {
    res.statusCode = req.method !== 'POST' ? 204 : 503;
    res.headers = {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'Origin, X-Requested-With, Content-Type, Accept, X-Okta-Xsrftoken',
      'access-control-allow-methods': 'POST, GET, OPTIONS'
    };
  })
  .onRequestTo(/6513\/challenge/)
  .respond((req, res) => {
    res.statusCode = req.method !== 'POST' ? 204 : 500;
    res.headers = {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'Origin, X-Requested-With, Content-Type, Accept, X-Okta-Xsrftoken',
      'access-control-allow-methods': 'POST, GET, OPTIONS'
    };
  });

const loopbackFallbackLogger = RequestLogger(/introspect|probe|cancel|launch|poll/, { logRequestBody: true, stringifyRequestBody: true });
const loopbackFallbackMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll$/)
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo(/(2000|6511|6512|6513)\/probe/)
  .respond(null, 500, { 'access-control-allow-origin': '*' })
  .onRequestTo(/\/idp\/idx\/authenticators\/poll\/cancel/)
  .respond(loopbackChallengeNotReceived)
  .onRequestTo(/\/idp\/idx\/authenticators\/okta-verify\/launch/)
  .respond(identifyWithLaunchAuthenticator)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithLaunchAuthenticator);

const customURILogger = RequestLogger(/okta-verify.html/);
const customURIMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithLaunchAuthenticator)
  .onRequestTo(/\/idp\/idx\/authenticators\/okta-verify\/launch/)
  .respond(identifyWithLaunchAuthenticator)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithLaunchAuthenticator);

const universalLinkWithoutLaunchMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithSSOExtensionFallbackWithoutLink)
  .onRequestTo(/\/idp\/idx\/authenticators\/okta-verify\/launch/)
  .respond(identifyWithLaunchUniversalLink)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithLaunchUniversalLink);

const universalLinkMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithSSOExtensionFallback);

const appLinkWithoutLaunchMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll$/)
  .respond((req, res) => {
    res.headers['content-type'] = 'application/json';
    if (appLinkLoopBackFailed) {
      res.statusCode = '500';
      res.setBody(identifyWithLaunchAppLink);
    } else {
      res.statusCode = '200';
      res.setBody(identifyWithDeviceProbingLoopback);
    }
  })
  .onRequestTo(/(2000|6511|6512|6513)\/probe/)
  .respond(null, 500, { 'access-control-allow-origin': '*' })
  .onRequestTo(/\/idp\/idx\/authenticators\/poll\/cancel/)
  .respond(identifyWithLoopbackFallbackAndroidWithoutLink)
  .onRequestTo(/\/idp\/idx\/authenticators\/okta-verify\/launch/)
  .respond(identifyWithLaunchAppLink);

const LoginHintCustomURIMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(loopbackChallengeNotReceived)
  .onRequestTo(/\/idp\/idx\/authenticators\/okta-verify\/launch/)
  .respond(identifyWithLaunchAuthenticator)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithLaunchAuthenticator);

const LoginHintUniversalLinkMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(loopbackChallengeNotReceived)
  .onRequestTo(/\/idp\/idx\/authenticators\/okta-verify\/launch/)
  .respond(identifyWithLaunchUniversalLink)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithLaunchUniversalLink);

const LoginHintAppLinkMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(loopbackChallengeNotReceived)
  .onRequestTo(/\/idp\/idx\/authenticators\/okta-verify\/launch/)
  .respond(identifyWithLaunchAppLink)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithLaunchAppLink);

fixture('Device Challenge Polling View with the Loopback Server, Custom URI, App Link, and Universal Link approaches').meta('v3', true);

async function setup(t) {
  const deviceChallengePollPage = new DeviceChallengePollPageObject(t);
  await deviceChallengePollPage.navigateToPage();
  await t.expect(deviceChallengePollPage.formExists()).eql(true);
  return deviceChallengePollPage;
}

async function setupLoopbackFallback(t) {
  const deviceChallengeFalllbackPage = new IdentityPageObject(t);
  await deviceChallengeFalllbackPage.navigateToPage();
  return deviceChallengeFalllbackPage;
}

// TODO: fix quarantined test - OKTA-645716
test.skip
  .requestHooks(loopbackSuccessLogger, loopbackSuccessMock)('in loopback server approach, probing and polling requests are sent and responded', async t => {
    const deviceChallengePollPageObject = await setup(t);
    await checkA11y(t);
    await t.expect(deviceChallengePollPageObject.getBeaconClass()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Verifying your identity');
    await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().exists).eql(true);
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/introspect/)
    )).eql(1);
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 500 &&
        record.request.url.match(/2000/)
    )).eql(1);
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.method === 'get' &&
        record.request.url.match(/6511\/probe/)
    )).eql(1);
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/6511\/challenge/) &&
        record.request.body.match(/challengeRequest":"eyJraWQiOiI1/)
    )).eql(1);
    failureCount = 2;
    await t.expect(loopbackSuccessLogger.contains(record => record.request.url.match(/6512|6513/))).eql(false);

    const identityPage = new IdentityPageObject(t);
    await identityPage.fillIdentifierField('Test Identifier');
    await t.expect(identityPage.getIdentifierValue()).eql('Test Identifier');
  });

test
  .requestHooks(loopbackUserCancelLogger, loopbackUserCancelLoggerMock)('request body has reason value of true when user clicks cancel and go back link', async t => {
    loopbackPollMockLogger.clear();
    const deviceChallengePollingPage = await setup(t);
    await checkA11y(t);

    deviceChallengePollingPage.clickCancelAndGoBackLink();
    await t.expect(loopbackUserCancelLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/authenticators\/poll\/cancel/) &&
        JSON.parse(record.request.body).reason === 'USER_CANCELED' &&
        JSON.parse(record.request.body).statusCode === null
    )).eql(1);
  });

test
  .requestHooks(loopbackPollMockLogger, loopbackPollFailedMock)('next poll should not start if previous is failed', async t => {
    loopbackPollMockLogger.clear();
    await setup(t);
    await checkA11y(t);
    await t.wait(10_000);

    await t.expect(loopbackPollMockLogger.count(
      record => {
        return record.request.url.match(/\/idp\/idx\/authenticators\/poll/);
      })).eql(1);
  });

test
  .requestHooks(loopbackPollMockLogger, loopbackPollTimeoutMock).skip('new poll does not starts until last one is ended', async t => {
    loopbackPollMockLogger.clear();
    await setup(t);
    await checkA11y(t);
    // This test verify if new /poll calls are made only if the previous one was finished instead of polling with fixed interval.
    // Updating /poll response to take 5 sec to response.
    // Then counting the number of calls that should be done in time interval. Default Timeout for /poll is 2 sec.
    // Expecting to get only 2 calls(first at 2nd sec, second at 9th(5 sec response + 2 sec timeout) second).
    await t.wait(10_000);

    await t.expect(loopbackPollMockLogger.count(
      record => record.request.url.match(/\/idp\/idx\/authenticators\/poll/)
    )).eql(2);
  });

test
  .requestHooks(loopbackChallengeErrorLogger, loopbackChallengeErrorMock)('in loopback server approach, will cancel polling when challenge errors out', async t => {
    const deviceChallengePollPageObject = await setup(t);
    await checkA11y(t);
    await t.expect(deviceChallengePollPageObject.getBeaconClass()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Verifying your identity');
    await t.expect(deviceChallengePollPageObject.getFooterLink().exists).eql(false);
    await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().exists).eql(true);
    await t.expect(loopbackChallengeErrorLogger.count(
      record => record.response.statusCode === 200 &&
                record.request.url.match(/introspect/)
    )).eql(1);
    await t.expect(loopbackChallengeErrorLogger.count(
      record => record.response.statusCode === 500 &&
                record.request.url.match(/2000/)
    )).eql(1);
    await t.expect(loopbackChallengeErrorLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.method === 'get' &&
        record.request.url.match(/6511\/probe/)
    )).eql(1);
    await t.expect(loopbackChallengeErrorLogger.count(
      record => record.response.statusCode === 500 &&
        record.request.method === 'post' &&
        record.request.url.match(/6511\/challenge/)
    )).eql(1);
    await t.expect(loopbackChallengeErrorLogger.count(
      record => record.response.statusCode === 200 &&
              record.request.url.match(/\/idp\/idx\/authenticators\/poll/)
    )).gte(1);
    await t.expect(loopbackChallengeErrorLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/authenticators\/poll\/cancel/) &&
        JSON.parse(record.request.body).reason === 'OV_RETURNED_ERROR'
    )).eql(1);
    await t.expect(loopbackSuccessLogger.contains(record => record.request.url.match(/6512|6513/))).eql(false);
  });

test
  .requestHooks(loopbackChallengeWrongProfileLogger, loopbackChallengeWrongProfileMock)('in loopback server approach, will cancel polling when challenge errors out with non-503 status', async t => {
    const deviceChallengePollPageObject = await setup(t);
    await checkA11y(t);
    await t.expect(deviceChallengePollPageObject.getBeaconClass()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Verifying your identity');
    await t.expect(deviceChallengePollPageObject.getFooterLink().exists).eql(false);
    await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().exists).eql(true);
    await t.wait(5000); // wait a moment for all probes to fail
    await t.expect(loopbackChallengeWrongProfileLogger.count(
      record => record.response.statusCode === 200 &&
                record.request.url.match(/introspect/)
    )).eql(1);
    await t.expect(loopbackChallengeWrongProfileLogger.count(
      record => record.response.statusCode === 500 &&
                record.request.url.match(/(2000|6512)\/probe/)
    )).eql(2);
    await t.expect(loopbackChallengeWrongProfileLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.method === 'get' &&
        record.request.url.match(/(6511|6513)\/probe/)
    )).eql(2);
    await t.expect(loopbackChallengeWrongProfileLogger.count(
      record => record.response.statusCode === 503 &&
        record.request.method === 'post' &&
        record.request.url.match(/6511\/challenge/)
    )).eql(1);
    await t.expect(loopbackChallengeWrongProfileLogger.count(
      record => record.response.statusCode === 500 &&
        record.request.method === 'post' &&
        record.request.url.match(/6513\/challenge/)
    )).eql(1);
    await t.expect(loopbackChallengeWrongProfileLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/authenticators\/poll\/cancel/) &&
        JSON.parse(record.request.body).reason === 'OV_RETURNED_ERROR' &&
        JSON.parse(record.request.body).statusCode === 500
    )).eql(1);
  });

test
  .requestHooks(loopbackSuccessLogger, loopbackSuccessButNotAssignedAppMock)('loopback succeeds but user is not assigned to app, then clicks cancel link', async t => {
    const deviceChallengePollPageObject = await setup(t);
    await checkA11y(t);
    await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().exists).eql(true);

    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/introspect/)
    )).eql(1);
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.method === 'get' &&
        record.request.url.match(/2000\/probe/)
    )).eql(1);
    await t.expect(loopbackSuccessLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/2000\/challenge/) &&
        record.request.body.match(/challengeRequest":"eyJraWQiOiI1/)
    )).eql(1);

    await t.expect(loopbackSuccessLogger.contains(record => record.request.url.match(/6511/))).eql(false);
    await t.expect(loopbackSuccessLogger.contains(record => record.request.url.match(/6512/))).eql(false);
    await t.expect(loopbackSuccessLogger.contains(record => record.request.url.match(/6513/))).eql(false);

    pollingError = true;
    await t.expect(deviceChallengePollPageObject.getFooterSignOutLink().exists).eql(true);
  });

test
  .requestHooks(loopbackFallbackLogger, loopbackFallbackMock)('loopback fails and falls back to custom uri', async t => {
    loopbackFallbackLogger.clear();
    const deviceChallengeFalllbackPage = await setupLoopbackFallback(t);
    await t.expect(deviceChallengeFalllbackPage.getFormTitle()).eql('Sign In');
    await t.expect(loopbackFallbackLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/introspect/)
    )).eql(1);
    await t.expect(loopbackFallbackLogger.count(
      record => record.response.statusCode === 500 &&
        record.request.url.match(/2000|6511|6512|6513/)
    )).eql(4);
    await t.expect(loopbackFallbackLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/authenticators\/poll\/cancel/) &&
        JSON.parse(record.request.body).reason === 'OV_UNREACHABLE_BY_LOOPBACK' &&
        JSON.parse(record.request.body).statusCode === null
    )).eql(1);
    deviceChallengeFalllbackPage.clickOktaVerifyButton();
    const deviceChallengePollPageObject = new DeviceChallengePollPageObject(t);
    await t.expect(deviceChallengePollPageObject.getBeaconClass()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Click "Open Okta Verify" on the browser prompt');
    await deviceChallengePollPageObject.hasText('Didn’t get a prompt?');
    await deviceChallengePollPageObject.hasText('Open Okta Verify');
    await deviceChallengePollPageObject.hasText('Don’t have Okta Verify?');
    await deviceChallengePollPageObject.hasText('Download here');
    await t.expect(deviceChallengePollPageObject.getDownloadOktaVerifyLink()).eql('https://apps.apple.com/us/app/okta-verify/id490179405');
    await t.expect(deviceChallengePollPageObject.getFooterSignOutLink().exists).eql(true);
  });

const getPageUrl = ClientFunction(() => window.location.href);
test
  .requestHooks(loopbackFallbackLogger, appLinkWithoutLaunchMock)('loopback fails and falls back to app link', async t => {
    loopbackFallbackLogger.clear();
    const deviceChallengeFalllbackPage = await setupLoopbackFallback(t);
    await t.expect(deviceChallengeFalllbackPage.getFormTitle()).eql('Sign In');
    await t.expect(loopbackFallbackLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/introspect/)
    )).eql(1);
    await t.expect(loopbackFallbackLogger.count(
      record => record.response.statusCode === 500 &&
        record.request.url.match(/2000|6511|6512|6513/)
    )).eql(4);
    await t.expect(loopbackFallbackLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/authenticators\/poll\/cancel/)
    )).eql(1);
    appLinkLoopBackFailed = true;
    deviceChallengeFalllbackPage.clickOktaVerifyButton();
    const deviceChallengePollPageObject = new DeviceChallengePollPageObject(t);
    await t.expect(deviceChallengePollPageObject.getBeaconClass()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Sign in with Okta FastPass');

    await t.expect(await deviceChallengePollPageObject.hasSpinner()).eql(true);
    await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().exists).eql(true);

    await t.wait(5000); // wait for FASTPASS_FALLBACK_SPINNER_TIMEOUT

    await t.expect(deviceChallengePollPageObject.waitForPrimaryButtonAfterSpinner().innerText).eql('Open Okta Verify');

    await t.expect(deviceChallengePollPageObject.hasAppLinkContent()).eql(true);
    await t.expect(deviceChallengePollPageObject.getPrimaryButtonText()).eql('Open Okta Verify');
    if(!userVariables.v3) {
      await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().exists).eql(false);
    }
    await t.expect(deviceChallengePollPageObject.getFooterSignOutLink().innerText).eql('Back to sign in');
    deviceChallengePollPageObject.clickLaunchOktaVerifyButton();
    await t.expect(getPageUrl()).contains('okta-verify.html');
  });

test
  .requestHooks(customURILogger, customURIMock)('in custom URI approach, Okta Verify is launched', async t => {
    const deviceChallengePollPageObject = await setup(t);
    await checkA11y(t);
    await t.wait(100); // opening the page in iframe takes just a moment
    await t.expect(customURILogger.count(
      record => record.request.url.match(/okta-verify.html/) // in iframe
    )).eql(1);
    await deviceChallengePollPageObject.clickLaunchOktaVerifyButton();
    await t.wait(100); // opening the page in iframe takes just a moment
    await t.expect(customURILogger.count(
      record => record.request.url.match(/okta-verify.html/) // in iframe
    )).eql(2);
  });

test
  .requestHooks(customURILogger, customURIMock)('in custom URI approach, Okta Verify iframe should be single and hidden', async t => {
    const deviceChallengePollPageObject = await setup(t);
    let iframe = deviceChallengePollPageObject.getIframe();
    await t.expect(iframe.exists).ok({ timeout: 100 });
    let attributes = await deviceChallengePollPageObject.getCustomUriIframeAttributes();
    await t.expect(attributes.src).contains('okta-verify.html');
    await t.expect(iframe.visible).eql(false);

    await deviceChallengePollPageObject.clickLaunchOktaVerifyButton();
    iframe = await deviceChallengePollPageObject.getIframe();
    await t.expect(iframe.exists).ok({ timeout: 100 });
    attributes = await deviceChallengePollPageObject.getCustomUriIframeAttributes();
    await t.expect(attributes.src).contains('okta-verify.html');
    await t.expect(iframe.visible).eql(false);
    await t.expect(deviceChallengePollPageObject.getIframe().count).eql(1);
  });

test
  .requestHooks(loopbackFallbackLogger, universalLinkWithoutLaunchMock)('SSO Extension fails and falls back to universal link', async t => {
    loopbackFallbackLogger.clear();
    const deviceChallengeFalllbackPage = await setupLoopbackFallback(t);
    await t.expect(deviceChallengeFalllbackPage.getFormTitle()).eql('Sign In');
    await t.expect(loopbackFallbackLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/introspect/)
    )).eql(1);
    deviceChallengeFalllbackPage.clickOktaVerifyButton();
    const deviceChallengePollPageObject = new DeviceChallengePollPageObject(t);
    await t.expect(deviceChallengePollPageObject.getBeaconClass()).contains(BEACON_CLASS);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Sign in with Okta FastPass');
    await t.expect(await deviceChallengePollPageObject.hasSpinner()).eql(true);
    await t.expect(deviceChallengePollPageObject.getPrimaryButtonText()).eql('Open Okta Verify');
    if(!userVariables.v3) {
      await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().exists).eql(false);
    }
    deviceChallengePollPageObject.clickLaunchOktaVerifyButton();
    await t.expect(getPageUrl()).contains('okta-verify.html');
  });

test
  .requestHooks(loopbackFallbackLogger, universalLinkMock)('clicking the launch Okta Verify button opens the universal link', async t => {
    loopbackFallbackLogger.clear();
    const deviceChallengeFalllbackPage = await setupLoopbackFallback(t);
    await t.expect(deviceChallengeFalllbackPage.getFormTitle()).eql('Sign In');
    await t.expect(loopbackFallbackLogger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/introspect/)
    )).eql(1);
    deviceChallengeFalllbackPage.clickOktaVerifyButton();
    await t.expect(getPageUrl()).contains('okta-verify.html');
  });

test
  .requestHooks(LoginHintCustomURIMock)('expect login_hint in CustomURI', async t => {
    const identityPage = await setupLoopbackFallback(t);
    await renderWidget({
      features: { },
    });

    // enter username as login_hint on the SIW page
    const username = 'john.smith@okta.com';
    await identityPage.fillIdentifierField(username);
    identityPage.clickOktaVerifyButton();
    const deviceChallengePollPageObject = new DeviceChallengePollPageObject(t);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Click "Open Okta Verify" on the browser prompt');

    // verify login_hint has been appended to the customURI url in the iframe
    const attributes = await deviceChallengePollPageObject.getCustomUriIframeAttributes();
    await t.expect(attributes.src).contains('login_hint='+encodeURIComponent(username));
  });

test
  .requestHooks(LoginHintUniversalLinkMock)('expect login_hint in UniversalLink', async t => {
    const identityPage = await setupLoopbackFallback(t);
    await renderWidget({
      features: { },
    });

    const username = 'john.smith@okta.com';
    await identityPage.fillIdentifierField(username);
    identityPage.clickOktaVerifyButton();
    const deviceChallengePollPageObject = new DeviceChallengePollPageObject(t);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Sign in with Okta FastPass');

    deviceChallengePollPageObject.clickLaunchOktaVerifyButton();
    // verify login_hint has been appended to the universal link url
    await t.expect(getPageUrl()).contains('login_hint='+encodeURIComponent(username));
  });

test
  .requestHooks(LoginHintAppLinkMock)('expect login_hint in AppLink', async t => {
    const identityPage = await setupLoopbackFallback(t);
    await renderWidget({
      features: { },
    });

    const username = 'john.smith@okta.com';
    await identityPage.fillIdentifierField(username);
    identityPage.clickOktaVerifyButton();
    const deviceChallengePollPageObject = new DeviceChallengePollPageObject(t);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Sign in with Okta FastPass');

    await t.expect(await deviceChallengePollPageObject.hasSpinner()).eql(true);
    await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().exists).eql(true);

    await t.wait(5000); // wait for FASTPASS_FALLBACK_SPINNER_TIMEOUT

    await t.expect(deviceChallengePollPageObject.waitForPrimaryButtonAfterSpinner().innerText).eql('Open Okta Verify');
    await t.expect(deviceChallengePollPageObject.getFooterSignOutLink().innerText).eql('Back to sign in');
    await t.expect(await deviceChallengePollPageObject.hasSpinner()).eql(false);

    deviceChallengePollPageObject.clickLaunchOktaVerifyButton();
    // verify login_hint has been appended to the app link url
    await t.expect(getPageUrl()).contains('login_hint='+encodeURIComponent(username));
  });
