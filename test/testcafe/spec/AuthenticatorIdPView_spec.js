import { RequestMock, RequestLogger } from 'testcafe';
import IdPAuthenticatorPageObject from '../framework/page-objects/IdPAuthenticatorPageObject';
import xhrEnrollIdPAuthenticator from '../../../playground/mocks/data/idp/idx/authenticator-enroll-idp.json';
import xhrEnrollIdPAuthenticatorError from '../../../playground/mocks/data/idp/idx/error-authenticator-enroll-idp.json';
import xhrVerifyIdPAuthenticator from '../../../playground/mocks/data/idp/idx/authenticator-verification-idp.json';
import xhrVerifyIdPAuthenticatorSingleRemediation from '../../../playground/mocks/data/idp/idx/authenticator-verification-idp-single-remediation.json';
import xhrVerifyIdPAuthenticatorError from '../../../playground/mocks/data/idp/idx/error-authenticator-verification-idp.json';

const logger = RequestLogger(/introspect/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const enrollMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrEnrollIdPAuthenticator)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrEnrollIdPAuthenticator)
  .onRequestTo('http://localhost:3000/sso/idps/0oa69chx4bZyx8O7l0g4?stateToken=02TptqPN4BOLIwMAGUVLPlZVJEnONAq7xkg19dy6Gk')
  .respond('<html><h1>An external IdP login page for testcafe testing</h1></html>');

const enrollErrorMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrEnrollIdPAuthenticatorError);

const verifyMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrVerifyIdPAuthenticatorSingleRemediation)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrVerifyIdPAuthenticatorSingleRemediation)
  .onRequestTo('http://localhost:3000/sso/idps/0oa69chx4bZyx8O7l0g4?stateToken=02TptqPN4BOLIwMAGUVLPlZVJEnONAq7xkg19dy6Gk')
  .respond('<html><h1>An external IdP login page for testcafe testing</h1></html>');

const verifyMockWithSelect = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrVerifyIdPAuthenticator)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrVerifyIdPAuthenticator)
  .onRequestTo('http://localhost:3000/sso/idps/0oa69chx4bZyx8O7l0g4?stateToken=02TptqPN4BOLIwMAGUVLPlZVJEnONAq7xkg19dy6Gk')
  .respond('<html><h1>An external IdP login page for testcafe testing</h1></html>');

const verifyErrorMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrVerifyIdPAuthenticatorError);

async function setup(t, isVerify) {
  const pageObject = new IdPAuthenticatorPageObject(t);
  await pageObject.navigateToPage();

  const { log } = await t.getBrowserConsoleMessages();
  await t.expect(log.length).eql(3);
  await t.expect(log[0]).eql('===== playground widget ready event received =====');
  await t.expect(log[1]).eql('===== playground widget afterRender event received =====');
  await t.expect(JSON.parse(log[2])).eql({
    controller: null,
    formName: isVerify ? 'challenge-authenticator' : 'enroll-authenticator',
    authenticatorKey: 'external_idp',
    methodType: 'idp'
  });
  return pageObject;
}

fixture('Enroll IdP Authenticator');
test
  .requestHooks(logger, enrollMock)('enroll with IdP authenticator', async t => {
    const pageObject = await setup(t);

    await t.expect(pageObject.getPageTitle()).eql('Set up IDP Authenticator');
    await t.expect(pageObject.getPageSubtitle()).eql('Clicking below will redirect to enrollment in IDP Authenticator');
    await pageObject.submit();

    const pageUrl = await pageObject.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/sso/idps/0oa69chx4bZyx8O7l0g4?stateToken=02TptqPN4BOLIwMAGUVLPlZVJEnONAq7xkg19dy6Gk');
  });

test
  .requestHooks(logger, enrollErrorMock)('enroll with IdP authenticator surfaces error messages', async t => {
    const pageObject = await setup(t);

    await t.expect(pageObject.getPageTitle()).eql('Set up IDP Authenticator');
    await t.expect(pageObject.getPageSubtitle()).eql('Clicking below will redirect to enrollment in IDP Authenticator');
    await t.expect(pageObject.getErrorFromErrorBox()).eql('Unable to enroll authenticator. Try again.');
  });

fixture('Verify IdP Authenticator');
test
  .requestHooks(logger, verifyMock)('verify with IdP authenticator', async t => {
    const pageObject = await setup(t, true);

    await t.expect(pageObject.getPageTitle()).eql('Verify with IDP Authenticator');
    await t.expect(pageObject.getPageSubtitle()).eql('You will be redirected to verify with IDP Authenticator');
    await pageObject.submit();

    const pageUrl = await pageObject.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/sso/idps/0oa69chx4bZyx8O7l0g4?stateToken=02TptqPN4BOLIwMAGUVLPlZVJEnONAq7xkg19dy6Gk');
  });

test
  .requestHooks(logger, verifyMockWithSelect)('verify with IdP authenticator and multiple remediation forms', async t => {
    const pageObject = await setup(t, true);

    await t.expect(pageObject.getPageTitle()).eql('Verify with IDP Authenticator');
    await t.expect(pageObject.getPageSubtitle()).eql('You will be redirected to verify with IDP Authenticator');
    await pageObject.submit();

    const pageUrl = await pageObject.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/sso/idps/0oa69chx4bZyx8O7l0g4?stateToken=02TptqPN4BOLIwMAGUVLPlZVJEnONAq7xkg19dy6Gk');
  });

test
  .requestHooks(logger, verifyErrorMock)('verify with IdP authenticator surfaces error messages', async t => {
    const pageObject = await setup(t, true);

    await t.expect(pageObject.getPageTitle()).eql('Verify with IDP Authenticator');
    await t.expect(pageObject.getPageSubtitle()).eql('You will be redirected to verify with IDP Authenticator');
    await t.expect(pageObject.getErrorFromErrorBox()).eql('Unable to verify authenticator. Try again.');
  });
