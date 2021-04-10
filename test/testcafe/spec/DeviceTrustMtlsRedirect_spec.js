import {ClientFunction, RequestLogger, RequestMock, Selector} from 'testcafe';
import identify from '../../../playground/mocks/data/idp/idx/identify';
import deviceTrustRedirect from '../../../playground/mocks/data/idp/idx/device-trust-mtls-redirect';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';

const logger = RequestLogger(/idx/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const deviceTrustRedirectMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identify)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(deviceTrustRedirect)
  .onRequestTo('http://dv1-devtrust.okta1.com/user/settings/certificate/challenge?relaystate=abcdUXb8DPNhsc6Evt7GXYa123')
  .respond('<html><h1>Device Trust certificate challenge redirect testcafe testing</h1></html>');


fixture ('Device Trust Mtls Redirect');

test.requestHooks(logger, deviceTrustRedirectMock)('Should navigate to device trust mtls challenge after identify', async t => {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.clickNextButton();

  const { log } = await t.getBrowserConsoleMessages();
  await t.expect(JSON.parse(log[4])).eql({
    controller: null,
    formName: 'success-redirect',
  });

  await t.expect(Selector('h1').innerText).eql('Device Trust certificate challenge redirect testcafe testing');
  const pageUrl = await ClientFunction(() => window.location.href)();
  await t.expect(pageUrl).eql('http://dv1-devtrust.okta1.com/user/settings/certificate/challenge?relaystate=abcdUXb8DPNhsc6Evt7GXYa123');
});

