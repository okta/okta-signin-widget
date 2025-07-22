import { RequestMock, RequestLogger, userVariables } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import { checkConsoleMessages, overrideWidgetOptions } from '../framework/shared';
import IdPAuthenticatorPageObject from '../framework/page-objects/IdPAuthenticatorPageObject';
import xhrEnrollIdPAuthenticator from '../../../playground/mocks/data/idp/idx/authenticator-enroll-idp.json';
import xhrEnrollIdPAuthenticatorCustomLogo from '../../../playground/mocks/data/idp/idx/authenticator-enroll-idp-custom-logo.json';
import xhrEnrollIdPAuthenticatorError from '../../../playground/mocks/data/idp/idx/error-authenticator-enroll-idp.json';
import xhrEnrollIdpAuthentiatorErrorCustomLogo from '../../../playground/mocks/data/idp/idx/error-authenticator-enroll-idp-custom-logo.json';
import xhrVerifyIdPAuthenticator from '../../../playground/mocks/data/idp/idx/authenticator-verification-idp.json';
import xhrVerifyIdPAuthenticatorCustomLogo from '../../../playground/mocks/data/idp/idx/authenticator-verification-idp-custom-logo.json';
import xhrVerifyIdPAuthenticatorSingleRemediation from '../../../playground/mocks/data/idp/idx/authenticator-verification-idp-single-remediation.json';
import xhrVerifyIdPAuthenticatorError from '../../../playground/mocks/data/idp/idx/error-authenticator-verification-idp.json';
import xhrVerifyIdpAuthentiatorErrorCustomLogo from '../../../playground/mocks/data/idp/idx/error-authenticator-verification-idp-custom-logo.json';

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

const enrollMockCustomLogo = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrEnrollIdPAuthenticatorCustomLogo)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrEnrollIdPAuthenticatorCustomLogo)
  .onRequestTo('http://localhost:3000/sso/idps/0oa69chx4bZyx8O7l0g4?stateToken=02TptqPN4BOLIwMAGUVLPlZVJEnONAq7xkg19dy6Gk')
  .respond('<html><h1>An external IdP login page for testcafe testing</h1></html>');

const enrollErrorMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrEnrollIdPAuthenticatorError);

const enrollErrorCustomLogoMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrEnrollIdpAuthentiatorErrorCustomLogo);

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

const verifyMockCustomLogo = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrVerifyIdPAuthenticatorCustomLogo)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrVerifyIdPAuthenticatorCustomLogo)
  .onRequestTo('http://localhost:3000/sso/idps/0oa69chx4bZyx8O7l0g4?stateToken=02TptqPN4BOLIwMAGUVLPlZVJEnONAq7xkg19dy6Gk')
  .respond('<html><h1>An external IdP login page for testcafe testing</h1></html>');

const verifyErrorMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrVerifyIdPAuthenticatorError);

const verifyErrorCustomLogoMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrVerifyIdpAuthentiatorErrorCustomLogo);

async function setup(t, {isVerify, expectAutoRedirect} = {}) {
  const pageObject = new IdPAuthenticatorPageObject(t);
  await pageObject.navigateToPage();
  if (expectAutoRedirect) {
    await t.expect(pageObject.formExists()).eql(false);
  } else {
    await t.expect(pageObject.formExists()).eql(true);
    await checkConsoleMessages({
      controller: null,
      formName: isVerify ? 'challenge-authenticator' : 'enroll-authenticator',
      authenticatorKey: 'external_idp',
      methodType: 'idp'
    });
  }
  return pageObject;
}

fixture('Enroll IdP Authenticator');
test
  .requestHooks(logger, enrollMock)('enroll with IdP authenticator', async t => {
    const pageObject = await setup(t);
    await checkA11y(t);

    await t.expect(pageObject.getFormTitle()).eql('Set up IDP Authenticator');
    await t.expect(pageObject.getPageSubtitle()).eql('You will be redirected to enroll in IDP Authenticator');
    await t.expect(pageObject.getBeaconSelector()).contains('mfa-custom-factor');
    await pageObject.submit('Enroll');

    const pageUrl = await pageObject.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/sso/idps/0oa69chx4bZyx8O7l0g4?stateToken=02TptqPN4BOLIwMAGUVLPlZVJEnONAq7xkg19dy6Gk');
  });

test
  .clientScripts(overrideWidgetOptions({
    features: {
      skipIdpFactorVerificationBtn: true,
    },
  }))
  .requestHooks(logger, enrollMock)('should auto redirect to IdP when skipIdpFactorVerificationBtn feature is true', async t => {
    const pageObject = await setup(t, {
      expectAutoRedirect: true
    });

    // assert redirect to IdP login page eventually
    const pageUrl = await pageObject.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/sso/idps/0oa69chx4bZyx8O7l0g4?stateToken=02TptqPN4BOLIwMAGUVLPlZVJEnONAq7xkg19dy6Gk');
  });

test
  .requestHooks(logger, enrollMockCustomLogo)('enroll with IdP authenticator with custom logo', async t => {
    const pageObject = await setup(t);
    await checkA11y(t);

    const logoBgImage = pageObject.getBeaconBgImage();
    await t.expect(pageObject.getFormTitle()).eql('Set up IDP Authenticator');
    await t.expect(pageObject.getPageSubtitle()).eql('You will be redirected to enroll in IDP Authenticator');
    await t.expect(pageObject.getBeaconSelector()).contains('mfa-custom-factor');
    if(userVariables.gen3) {
      await t.expect(logoBgImage).match(/.*\/img\/logos\/default\.png$/);
    } else {
      await t.expect(logoBgImage).match(/^url\(".*\/img\/logos\/default\.png"\)$/);
      await t.expect(pageObject.getBeaconSelector()).contains('custom-app-logo');
    }
    await pageObject.submit('Enroll');

    const pageUrl = await pageObject.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/sso/idps/0oa69chx4bZyx8O7l0g4?stateToken=02TptqPN4BOLIwMAGUVLPlZVJEnONAq7xkg19dy6Gk');
  });

test
  .requestHooks(logger, enrollErrorMock)('enroll with IdP authenticator surfaces error messages', async t => {
    const pageObject = await setup(t);
    await checkA11y(t);

    await t.expect(pageObject.getFormTitle()).eql('Set up IDP Authenticator');
    await t.expect(pageObject.getPageSubtitle()).eql('You will be redirected to enroll in IDP Authenticator');
    await t.expect(pageObject.getErrorFromErrorBox()).contains('Unable to enroll authenticator. Try again.');
    await t.expect(pageObject.getBeaconSelector()).contains('mfa-custom-factor');
  });

test
  .clientScripts(overrideWidgetOptions({
    features: {
      skipIdpFactorVerificationBtn: true,
    },
  }))
  .requestHooks(logger, enrollErrorMock)('should not auto redirect to IdP on error when skipIdpFactorVerificationBtn feature is true', async t => {
    const pageObject = await setup(t, {
      expectAutoRedirect: false
    });

    await checkA11y(t);

    await t.expect(pageObject.getFormTitle()).eql('Set up IDP Authenticator');
    await t.expect(pageObject.getPageSubtitle()).eql('You will be redirected to enroll in IDP Authenticator');
    await t.expect(pageObject.getErrorFromErrorBox()).contains('Unable to enroll authenticator. Try again.');
    await t.expect(pageObject.getBeaconSelector()).contains('mfa-custom-factor');
  });

test
  .requestHooks(logger, enrollErrorCustomLogoMock)('enroll with IdP authenticator with custom logo surfaces error messages', async t => {
    const pageObject = await setup(t);
    await checkA11y(t);
    
    const logoBgImage = pageObject.getBeaconBgImage();
    await t.expect(pageObject.getFormTitle()).eql('Set up IDP Authenticator');
    await t.expect(pageObject.getPageSubtitle()).eql('You will be redirected to enroll in IDP Authenticator');
    await t.expect(pageObject.getErrorFromErrorBox()).contains('Unable to enroll authenticator. Try again.');
    await t.expect(pageObject.getBeaconSelector()).contains('mfa-custom-factor');
    if(userVariables.gen3) {
      await t.expect(logoBgImage).match(/.*\/img\/logos\/default\.png$/);
    } else {
      await t.expect(logoBgImage).match(/^url\(".*\/img\/logos\/default\.png"\)$/);
      await t.expect(pageObject.getBeaconSelector()).contains('custom-app-logo');
    }
  });

fixture('Verify IdP Authenticator');
test
  .requestHooks(logger, verifyMock)('verify with IdP authenticator', async t => {
    const pageObject = await setup(t, {isVerify: true});
    await checkA11y(t);

    await t.expect(pageObject.getFormTitle()).eql('Verify with IDP Authenticator');
    await t.expect(pageObject.getPageSubtitle()).eql('You will be redirected to verify with IDP Authenticator');
    await pageObject.submit('Verify');

    const pageUrl = await pageObject.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/sso/idps/0oa69chx4bZyx8O7l0g4?stateToken=02TptqPN4BOLIwMAGUVLPlZVJEnONAq7xkg19dy6Gk');
  });

test
  .clientScripts(overrideWidgetOptions({
    features: {
      skipIdpFactorVerificationBtn: true,
    },
  }))
  .requestHooks(logger, verifyMock)('should auto redirect to IdP when skipIdpFactorVerificationBtn feature is true', async t => {
    const pageObject = await setup(t, {
      isVerify: true,
      expectAutoRedirect: true
    });

    // assert redirect to IdP login page eventually
    const pageUrl = await pageObject.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/sso/idps/0oa69chx4bZyx8O7l0g4?stateToken=02TptqPN4BOLIwMAGUVLPlZVJEnONAq7xkg19dy6Gk');
  });

test
  .requestHooks(logger, verifyMockCustomLogo)('verify with IdP authenticator with custom logo', async t => {
    const pageObject = await setup(t, {isVerify: true});
    await checkA11y(t);

    const logoBgImage = pageObject.getBeaconBgImage();
    await t.expect(pageObject.getFormTitle()).eql('Verify with IDP Authenticator');
    await t.expect(pageObject.getPageSubtitle()).eql('You will be redirected to verify with IDP Authenticator');
    await t.expect(pageObject.getBeaconSelector()).contains('mfa-custom-factor');
    if(userVariables.gen3) {
      await t.expect(logoBgImage).match(/.*\/img\/logos\/default\.png$/);
    } else {
      await t.expect(logoBgImage).match(/^url\(".*\/img\/logos\/default\.png"\)$/);
      await t.expect(pageObject.getBeaconSelector()).contains('custom-app-logo');
    }
    await pageObject.submit('Verify');

    const pageUrl = await pageObject.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/sso/idps/0oa69chx4bZyx8O7l0g4?stateToken=02TptqPN4BOLIwMAGUVLPlZVJEnONAq7xkg19dy6Gk');
  });

test
  .requestHooks(logger, verifyMockWithSelect)('verify with IdP authenticator and multiple remediation forms', async t => {
    const pageObject = await setup(t, {isVerify: true});
    await checkA11y(t);

    await t.expect(pageObject.getFormTitle()).eql('Verify with IDP Authenticator');
    await t.expect(pageObject.getPageSubtitle()).eql('You will be redirected to verify with IDP Authenticator');
    await pageObject.submit('Verify');

    const pageUrl = await pageObject.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/sso/idps/0oa69chx4bZyx8O7l0g4?stateToken=02TptqPN4BOLIwMAGUVLPlZVJEnONAq7xkg19dy6Gk');
  });

test
  .requestHooks(logger, verifyErrorMock)('verify with IdP authenticator surfaces error messages', async t => {
    const pageObject = await setup(t, {isVerify: true});
    await checkA11y(t);

    await t.expect(pageObject.getFormTitle()).eql('Verify with IDP Authenticator');
    await t.expect(pageObject.getPageSubtitle()).eql('You will be redirected to verify with IDP Authenticator');
    await t.expect(pageObject.getErrorFromErrorBox()).contains('Unable to verify authenticator. Try again.');
  });

test
  .clientScripts(overrideWidgetOptions({
    features: {
      skipIdpFactorVerificationBtn: true,
    },
  }))
  .requestHooks(logger, verifyErrorMock)('should not auto redirect to IdP on error when skipIdpFactorVerificationBtn feature is true', async t => {
    const pageObject = await setup(t, {
      isVerify: true,
      expectAutoRedirect: false
    });

    await checkA11y(t);

    await t.expect(pageObject.getFormTitle()).eql('Verify with IDP Authenticator');
    await t.expect(pageObject.getPageSubtitle()).eql('You will be redirected to verify with IDP Authenticator');
    await t.expect(pageObject.getErrorFromErrorBox()).contains('Unable to verify authenticator. Try again.');
  });

test
  .requestHooks(logger, verifyErrorCustomLogoMock)('verify with IdP authenticator with custom logo surfaces error messages', async t => {
    const pageObject = await setup(t, {isVerify: true});
    await checkA11y(t);

    const logoBgImage = pageObject.getBeaconBgImage();
    await t.expect(pageObject.getFormTitle()).eql('Verify with IDP Authenticator');
    await t.expect(pageObject.getPageSubtitle()).eql('You will be redirected to verify with IDP Authenticator');
    await t.expect(pageObject.getErrorFromErrorBox()).contains('Unable to verify authenticator. Try again.');
    await t.expect(pageObject.getBeaconSelector()).contains('mfa-custom-factor');
    if(userVariables.gen3) {
      await t.expect(logoBgImage).match(/.*\/img\/logos\/default\.png$/);
    } else {
      await t.expect(logoBgImage).match(/^url\(".*\/img\/logos\/default\.png"\)$/);
      await t.expect(pageObject.getBeaconSelector()).contains('custom-app-logo');
    }
  });
