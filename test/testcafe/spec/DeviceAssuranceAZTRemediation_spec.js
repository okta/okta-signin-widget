import { RequestLogger, RequestMock, userVariables } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import deviceAssuranceAdpRemediationAppLinkFallbackMultipleOptionsResponse from '../../../playground/mocks/data/idp/idx/end-user-remediation-adp-remediation-app-link-fallback-with-multiple-options.json';
import deviceAssuranceAdpRemediationAppLinkFallbackSingleOptionResponse from '../../../playground/mocks/data/idp/idx/end-user-remediation-adp-remediation-app-link-fallback-with-single-option.json';
import deviceAssuranceAdpRemediationMessageFallbackMultipleOptionsResponse from '../../../playground/mocks/data/idp/idx/end-user-remediation-adp-remediation-message-fallback-with-multiple-options.json';
import deviceAssuranceAdpRemediationMessageFallbackSingleOptionResponse from '../../../playground/mocks/data/idp/idx/end-user-remediation-adp-remediation-message-fallback-with-single-option.json';

import TerminalPageObjectV3 from '../framework/page-objects/TerminalPageObjectV3';
import TerminalPageObject from '../framework/page-objects/TerminalPageObject';

const oktaVerifyAppContent = `
  <h1>Okta Verify Landing Page</h1>
`;

const ovAppLogger = RequestLogger(/okta-verify.html/);
const loopbackServerLogger = RequestLogger(/probe|remediation/,
  { logRequestBody: true, stringifyRequestBody: true });

const singleOptionRemediationSuccessfulLoopbackMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(deviceAssuranceAdpRemediationAppLinkFallbackSingleOptionResponse)
  .onRequestTo(/6511|6512|6513\/probe/)
  .respond(null, 500, { 
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/2000\/probe/)
  .respond(null, 200, { 
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/2000\/remediation/)
  .respond(null, 200, { 
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/okta-verify.\/html/)
  .respond(oktaVerifyAppContent);

const singleRemediationOptionMultipleLoopbackPortsFoundOnlyOneSuccessRequestMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(deviceAssuranceAdpRemediationAppLinkFallbackSingleOptionResponse)
  .onRequestTo(/6511|6512\/probe/)
  .respond(null, 500, { 
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/6513\/probe/)
  .respond(null, 200, { 
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/6513\/remediation/)
  .respond(null, 500, { 
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/2000\/probe/)
  .respond(null, 200, { 
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/2000\/remediation/)
  .respond(null, 200, { 
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/okta-verify.\/html/)
  .respond(oktaVerifyAppContent);

const singleOptionRemediationAppLinkFallbackMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(deviceAssuranceAdpRemediationAppLinkFallbackSingleOptionResponse)
  .onRequestTo(/6511|6512|2000|6513\/probe/)
  .respond(null, 500, { 
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/okta-verify.\/html/)
  .respond(oktaVerifyAppContent);

const multipleOptionsRemediationAppLinkFallbackMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(deviceAssuranceAdpRemediationAppLinkFallbackMultipleOptionsResponse)
  .onRequestTo(/6511|6512|2000|6513\/probe/)
  .respond(null, 500, { 
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/okta-verify.\/html/)
  .respond(oktaVerifyAppContent);

const singleOptionRemediationMessageFallbackMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(deviceAssuranceAdpRemediationMessageFallbackSingleOptionResponse)
  .onRequestTo(/6511|6512|2000|6513\/probe/)
  .respond(null, 500, { 
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/okta-verify.\/html/)
  .respond(oktaVerifyAppContent);

const multipleOptionsRemediationMessageFallbackMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(deviceAssuranceAdpRemediationMessageFallbackMultipleOptionsResponse)
  .onRequestTo(/6511|6512|2000|6513\/probe/)
  .respond(null, 500, { 
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/okta-verify.\/html/)
  .respond(oktaVerifyAppContent);

fixture('Device Assurance Android Zero Trust Remediation Tests');

async function setup(t) {
  const terminalPageObject = userVariables.gen3 ? new TerminalPageObjectV3(t) : new TerminalPageObject(t);
  await terminalPageObject.navigateToPage();
  // ensure form has loaded
  await t.expect(terminalPageObject.formExists()).eql(true);
  return terminalPageObject;
}

test.requestHooks(loopbackServerLogger, singleOptionRemediationSuccessfulLoopbackMock)('should render AZT ADP install end user remediation error message and on click should trigger successful loopback to remediate', async t => {
  ovAppLogger.clear();
  loopbackServerLogger.clear();

  const terminalViewPage = await setup(t);
  await checkA11y(t);

  await t.expect(terminalViewPage.form.getErrorBoxCallout().withText('Your device doesn\'t meet the security requirements').exists).eql(true);
  await t.expect(terminalViewPage.form.getErrorBoxCallout().withText('To sign in, make the following updates. Then, access the app again.').exists).eql(true);

  await t.expect(terminalViewPage.form.getErrorBoxAnchor('https://okta.com/android-lock-screen').withExactText('Enable lock screen').exists).eql(true);
  await t.expect(await terminalViewPage.adpInstallRemediationLinkExists()).eql(true);

  await t.expect(terminalViewPage.form.getErrorBoxCallout().withText('follow the instructions on the help page').find('a[href="https://okta.com/help"]').exists).eql(true);

  await terminalViewPage.clickADPInstallRememdiationLink();
  
  // Assert loopback request was successful
  await t.expect(loopbackServerLogger.contains(
    record => record.response.statusCode === 200 &&
      record.request.method === 'get' &&
      record.request.url.match(/remediation/)
  )).eql(true);
});

test.requestHooks(loopbackServerLogger, singleRemediationOptionMultipleLoopbackPortsFoundOnlyOneSuccessRequestMock)('should render AZT ADP install end user remediation error message and on click should trigger successful loopback with multiple found ports but only one with successful action request', async t => {
  ovAppLogger.clear();
  loopbackServerLogger.clear();

  const terminalViewPage = await setup(t);
  await checkA11y(t);

  await t.expect(terminalViewPage.form.getErrorBoxCallout().withText('Your device doesn\'t meet the security requirements').exists).eql(true);
  await t.expect(terminalViewPage.form.getErrorBoxCallout().withText('To sign in, make the following updates. Then, access the app again.').exists).eql(true);

  await t.expect(terminalViewPage.form.getErrorBoxAnchor('https://okta.com/android-lock-screen').withExactText('Enable lock screen').exists).eql(true);
  await t.expect(await terminalViewPage.adpInstallRemediationLinkExists()).eql(true);

  await t.expect(terminalViewPage.form.getErrorBoxCallout().withText('follow the instructions on the help page').find('a[href="https://okta.com/help"]').exists).eql(true);

  await terminalViewPage.clickADPInstallRememdiationLink();
  
  // Assert loopback request was successful
  await t.expect(loopbackServerLogger.contains(
    record => record.response.statusCode === 200 &&
      record.request.method === 'get' &&
      record.request.url.match(/remediation/)
  )).eql(true);
});

test.requestHooks(loopbackServerLogger, ovAppLogger, singleOptionRemediationAppLinkFallbackMock)('should render AZT ADP install end user remediation error message and on click should trigger unsuccessful loopback requests and fallback to App link redirect', async t => {
  ovAppLogger.clear();
  loopbackServerLogger.clear();

  const terminalViewPage = await setup(t);
  await checkA11y(t);

  await t.expect(terminalViewPage.form.getErrorBoxCallout().withText('Your device doesn\'t meet the security requirements').exists).eql(true);
  await t.expect(terminalViewPage.form.getErrorBoxCallout().withText('To sign in, make the following updates. Then, access the app again.').exists).eql(true);

  await t.expect(terminalViewPage.form.getErrorBoxAnchor('https://okta.com/android-lock-screen').withExactText('Enable lock screen').exists).eql(true);
  await t.expect(await terminalViewPage.adpInstallRemediationLinkExists()).eql(true);

  await t.expect(terminalViewPage.form.getErrorBoxCallout().withText('follow the instructions on the help page').find('a[href="https://okta.com/help"]').exists).eql(true);

  await terminalViewPage.clickADPInstallRememdiationLink();
  
  // Assert probing failed
  await t.expect(loopbackServerLogger.count(
    record => record.response.statusCode === 500 &&
      record.request.url.match(/probe/)
  )).eql(4);

  // Verify we have been redirected
  await t.expect(ovAppLogger.count(
    record => record.response.statusCode === 200
      && record.request.url.match(/okta-verify.html/) // redirect to OV App link
  )).eql(1);
});

test.requestHooks(loopbackServerLogger, ovAppLogger, multipleOptionsRemediationAppLinkFallbackMock)('should render AZT ADP install end user remediation error message with multiple remediation options and on click should trigger unsuccessful loopback requests and fallback to App link redirect', async t => {
  ovAppLogger.clear();
  loopbackServerLogger.clear();

  const terminalViewPage = await setup(t);
  await checkA11y(t);

  await t.expect(terminalViewPage.form.getErrorBoxCallout().withText('Your device doesn\'t meet the security requirements').exists).eql(true);
  await t.expect(terminalViewPage.form.getErrorBoxCallout().withText('To sign in, pick an option and make the updates. Then, access the app again.').exists).eql(true);

  await t.expect(terminalViewPage.form.getErrorBoxAnchor('https://okta.com/android-upgrade-os').withExactText('Update to Android 100').exists).eql(true);
  await t.expect(terminalViewPage.form.getErrorBoxAnchor('https://okta.com/android-biometric-lock').withExactText('Enable lock screen and biometrics').exists).eql(true);

  await t.expect(terminalViewPage.form.getErrorBoxAnchor('https://okta.com/android-lock-screen').withExactText('Enable lock screen').exists).eql(true);
  await t.expect(await terminalViewPage.adpInstallRemediationLinkExists()).eql(true);

  await t.expect(terminalViewPage.form.getErrorBoxCallout().withText('follow the instructions on the help page').find('a[href="https://okta.com/help"]').exists).eql(true);

  await terminalViewPage.clickADPInstallRememdiationLink();
  
  // Assert probing failed
  await t.expect(loopbackServerLogger.count(
    record => record.response.statusCode === 500 &&
      record.request.url.match(/probe/)
  )).eql(4);

  // Verify we have been redirected
  await t.expect(ovAppLogger.count(
    record => record.response.statusCode === 200
      && record.request.url.match(/okta-verify.html/) // redirect to OV App link
  )).eql(1);
});

test.requestHooks(loopbackServerLogger, ovAppLogger, singleOptionRemediationMessageFallbackMock)('should render AZT ADP install end user remediation error message and on click should trigger unsuccessful loopback requests and fallback to an updated message', async t => {
  ovAppLogger.clear();
  loopbackServerLogger.clear();

  const terminalViewPage = await setup(t);
  await checkA11y(t);

  await t.expect(terminalViewPage.form.getErrorBoxCallout().withText('Your device doesn\'t meet the security requirements').exists).eql(true);
  await t.expect(terminalViewPage.form.getErrorBoxCallout().withText('To sign in, make the following updates. Then, access the app again.').exists).eql(true);

  await t.expect(terminalViewPage.form.getErrorBoxAnchor('https://okta.com/android-lock-screen').withExactText('Enable lock screen').exists).eql(true);
  await t.expect(await terminalViewPage.adpInstallRemediationLinkExists()).eql(true);

  await t.expect(terminalViewPage.form.getErrorBoxCallout().withText('follow the instructions on the help page').find('a[href="https://okta.com/help"]').exists).eql(true);

  await terminalViewPage.clickADPInstallRememdiationLink();
  
  // Assert probing failed
  await t.expect(loopbackServerLogger.count(
    record => record.response.statusCode === 500 &&
      record.request.url.match(/probe/)
  )).eql(4);

  // Assert remediation message has updated text
  await t.expect(await terminalViewPage.adpOVInstallInstructionsMessageExists()).eql(true);
});

test.requestHooks(loopbackServerLogger, ovAppLogger, multipleOptionsRemediationMessageFallbackMock)('should render AZT ADP install end user remediation error message with multiple remediation options and on click should trigger unsuccessful loopback requests and fallback to an updated message', async t => {
  ovAppLogger.clear();
  loopbackServerLogger.clear();

  const terminalViewPage = await setup(t);
  await checkA11y(t);

  await t.expect(terminalViewPage.form.getErrorBoxCallout().withText('Your device doesn\'t meet the security requirements').exists).eql(true);
  await t.expect(terminalViewPage.form.getErrorBoxCallout().withText('To sign in, pick an option and make the updates. Then, access the app again.').exists).eql(true);

  await t.expect(terminalViewPage.form.getErrorBoxAnchor('https://okta.com/android-upgrade-os').withExactText('Update to Android 100').exists).eql(true);
  await t.expect(terminalViewPage.form.getErrorBoxAnchor('https://okta.com/android-biometric-lock').withExactText('Enable lock screen and biometrics').exists).eql(true);

  await t.expect(terminalViewPage.form.getErrorBoxAnchor('https://okta.com/android-lock-screen').withExactText('Enable lock screen').exists).eql(true);
  await t.expect(await terminalViewPage.adpInstallRemediationLinkExists()).eql(true);

  await t.expect(terminalViewPage.form.getErrorBoxCallout().withText('follow the instructions on the help page').find('a[href="https://okta.com/help"]').exists).eql(true);

  await terminalViewPage.clickADPInstallRememdiationLink();
  
  // Assert probing failed
  await t.expect(loopbackServerLogger.count(
    record => record.response.statusCode === 500 &&
      record.request.url.match(/probe/)
  )).eql(4);

  // Assert remediation message has updated text
  await t.expect(await terminalViewPage.adpOVInstallInstructionsMessageExists()).eql(true);
});
