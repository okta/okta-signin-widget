import { RequestMock, RequestLogger, Selector, ClientFunction, userVariables } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import { checkConsoleMessages } from '../framework/shared';
import identifyWithName from '../../../playground/mocks/data/idp/idx/identify.json';
import identifyWithIdpsIdentify from '../../../playground/mocks/data/idp/idx/identify-with-third-party-idps.json';
import identifyWithIdpsNoIdentify from '../../../playground/mocks/data/idp/idx/identify-with-only-third-party-idps.json';
import identifyOnlyOneIdp from '../../../playground/mocks/data/idp/idx/identify-with-only-one-third-party-idp.json';
import identifyOnlyOneIdpAppUser from '../../../playground/mocks/data/idp/idx/identify-with-only-one-third-party-idp-app-user.json';
import errorIdentifyOnlyOneIdp from '../../../playground/mocks/data/idp/idx/error-identify-with-only-one-third-party-idp.json';
import interact from '../../../playground/mocks/data/oauth2/interact';

const logger = RequestLogger(/introspect/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const mockWithIdentify = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identifyWithIdpsIdentify);

const mockWithoutIdentify = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identifyWithIdpsNoIdentify);

const mockOnlyOneIdp = RequestMock()
  .onRequestTo('http://localhost:3000/oauth2/default/v1/interact')
  .respond(interact)
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identifyOnlyOneIdp)
  .onRequestTo('http://localhost:3000/sso/idps/facebook-idp-id-123?stateToken=inRUXNhsc6Evt7GAb8DPAA')
  .respond('<html><h1>An external IdP login page for testcafe testing</h1></html>');

const mockOnlyOneIdpAppUser = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identifyOnlyOneIdpAppUser)
  .onRequestTo('http://localhost:3000/sso/idps/facebook-idp-id-123?stateToken=inRUXNhsc6Evt7GAb8DPAA')
  .respond('<html><h1>An external IdP login page for testcafe testing</h1></html>');

const mockIdpDiscoveryWithOneIdp = RequestMock()
  .onRequestTo('http://localhost:3000/oauth2/default/v1/interact')
  .respond(interact)
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identifyWithName)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(identifyOnlyOneIdp)
  .onRequestTo('http://localhost:3000/sso/idps/facebook-idp-id-123?stateToken=inRUXNhsc6Evt7GAb8DPAA')
  .respond('<html><h1>An external IdP login page for testcafe testing</h1></html>');

const mockErrorIdentifyOnlyOneIdp = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identifyWithName)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(errorIdentifyOnlyOneIdp);

const renderWidget = ClientFunction((settings) => {
  // function `renderPlaygroundWidget` is defined in playground/main.js
  window.renderPlaygroundWidget(settings);
});

fixture('Identify + IDPs').meta('v3', true);

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  return identityPage;
}

async function setupDirectAuth(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage({ render: false });
  await renderWidget({
    clientId: 'fake',
    redirectUri: 'http://doesnot-matter',
    codeChallenge: 'abc', // cannot do PKCE calcs on http://localhost
    authParams: {
      pkce: true // required for interaction code flow
    },
    authScheme: 'oauth2',
  });
  await identityPage.form.el.exists;
  return identityPage;
}

test.requestHooks(mockWithIdentify) ('should render idp buttons with identifier form ', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);

  await checkConsoleMessages({
    controller: 'primary-auth',
    formName: 'identify',
  });

  await t.expect(identityPage.identifierFieldExistsForIdpView()).eql(true);
  await t.expect(identityPage.getIdpButton('Sign in with Facebook').exists).eql(true);
  await t.expect(identityPage.getIdpButton('Sign in with Google').exists).eql(true);
  await t.expect(identityPage.getIdpButton('Sign in with LinkedIn').exists).eql(true);
  await t.expect(identityPage.getIdpButton('Sign in with Microsoft').exists).eql(true);
});

test
  .requestHooks(mockWithIdentify)('clicking on idp button does redirect ', async t => {
    const identityPage = await setup(t);
    await checkA11y(t);
    await t.expect(identityPage.identifierFieldExistsForIdpView()).eql(true);
    await t.expect(identityPage.getIdpButton('Sign in with Facebook').exists).eql(true);
    await t.expect(identityPage.getIdpButton('Sign in with Google').exists).eql(true);
    await t.expect(identityPage.getIdpButton('Sign in with LinkedIn').exists).eql(true);
    await t.expect(identityPage.getIdpButton('Sign in with Microsoft').exists).eql(true);
    //click on social idp button
    await identityPage.clickIdpButton('Sign in with Facebook');
    const pageUrl = await identityPage.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/sso/idps/facebook-123?stateToken=eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvczI0VHZiWHlqOVFLSm4wZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..aDi6JnIZwCRzk7RN.xQ1R9jj43bV5S17F1juzgTZGd9Gq7VvuE4Hc1V_tMVcTWiVQ1Ntim1tQPZtmnpfOifu-N_quGGDSdgiidb_2xU1m9SbDMJhV-Yp6E07tABwjaRd_ekuRzDFw7Jxknz33LtSwQOTQ-WiH2o6JikLiEz2BQbgoizIc2izbtdod7HJg0HVnMZ9ZlBqyBG1-EISI_xPypq8uzP8n79hP_Zz41RI7VJA35yfTuNLOX_k6B-mfeVKf4HyFsKm62XWQgcPIxhjxBMqmyZow2toNclV3sIqgw7I5tKCLQSmSnKbFxxuT4-G31BdaVOALAe9Z89zlluTYaKAPOr86RMsqaGKnQFaplc_0PiPbreKhVgvSeeJgqX2RwnLgckLLiRo7TRDs2kLhGY2ope0AeA9TSsTVdJzsScftZWKgh9iHpXjS-kGcbRx0etu4iTtbHOu3rDIfIcvvt55mfvA66wzy1CCxHt4WYNnBKHX0fIOW_fa_-RYGYug9YRV5G6nQ6V-CfHoxmEsMhsoFJu0hei34_SJv15w2l3vxxBytrWSWi5qUfm5zGjNlx8e9n1Sf_eAqXCfLhBLK4_14jwtjNbWOZCdg5dwzxQiQWDItBjijEjdQrK0i6tw2Rp-IMJD1-4_ZfFZDmAXgZZtBYc3kdmumgYpKeYUJJgw0ZJWoG-Xr0bbzGGMx46yHzMpDbSTpiWhKGytQPbNja8sf_eeOKx_AAosamDUub9yuZJb0-Nj0xvXZ89J0m_09wa2Z3G-zY01sv9ONkXMFzRVwAb2bHmGle082bq33-7Klk7_ZzzkBROJhgDHQcw5QibGWaqYqscgKv2NQV8ebGJO_BHU46p1T3MQzStxRZ2EZua9qQwsmL8P5yboNDt2YmYnUvaOcGfeAqwgovqNDQ0H4u-D5psFmiU1STLOlN5pSAauKe4VxlLxphiirrmiNOOOW0XTwaQ1vtPz8gFlXsmGB-0zcsySG6A6HJ49eOeEI0J2REy2dlFRxzdKthANM2xFc_AIgas9mcNhSWtmVEtMxv7N0xqGAJbxaJC6U4kDDXdImZVaovz4lgRFkIh3aUXgUMX558u9MBeF6Q7z3piIpT6A4I1ww_eDNM02Vew.inRUXNhsc6Evt7GAb8DPAA');
  });


test.requestHooks(mockWithoutIdentify)('should only render idp buttons with identifier form ', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);

  await checkConsoleMessages({
    controller: null,
    formName: 'redirect-idp',
  });

  await t.expect(identityPage.identifierFieldExistsForIdpView()).eql(false);
  await t.expect(identityPage.getIdpButton('Sign in with Facebook').exists).eql(true);
  await t.expect(identityPage.getIdpButton('Sign in with Google').exists).eql(true);
  await t.expect(identityPage.getIdpButton('Sign in with LinkedIn').exists).eql(true);
  await t.expect(identityPage.getIdpButton('Sign in with Microsoft').exists).eql(true);
});

test.requestHooks(logger, mockOnlyOneIdp)('should auto redirect to 3rd party IdP login page with basic Signing in message', async t => {
  await setup(t);

  if(!userVariables.v3) {
    await checkConsoleMessages({
      controller: null,
      formName: 'success-redirect',
    });
  }

  // assert redirect to IdP login page eventually
  await t.expect(Selector('h1').innerText).eql('An external IdP login page for testcafe testing');
  const pageUrl = await ClientFunction(() => window.location.href)();
  await t.expect(pageUrl).eql('http://localhost:3000/sso/idps/facebook-idp-id-123?stateToken=inRUXNhsc6Evt7GAb8DPAA');

  await t.expect(logger.contains(record => record.response.statusCode === 200)).ok();

});

test.requestHooks(logger, mockOnlyOneIdp)('Direct auth: does not auto redirect to 3rd party IDP on initial load', async t => {
  const identityPage = await setupDirectAuth(t);

  await identityPage.waitForSocialAuthButtons();

  await checkConsoleMessages({
    controller: null,
    formName: 'redirect-idp',
  });

  await t.expect(identityPage.identifierFieldExistsForIdpView()).eql(false); // no username field
  await t.expect(identityPage.getIdpButton('Sign in with Facebook').exists).eql(true); // has FB button
  await t.expect(identityPage.getIdpButtonCount()).eql(1); // only one IDP button
});

test.requestHooks(logger, mockOnlyOneIdpAppUser)('should auto redirect to 3rd party IdP login page with Signing in longer message', async t => {
  await setup(t);

  if (!userVariables.v3) {
    await checkConsoleMessages({
      controller: null,
      formName: 'success-redirect',
    });
  }
  // assert redirect to IdP login page eventually
  await t.expect(Selector('h1').innerText).eql('An external IdP login page for testcafe testing');
  const pageUrl = await ClientFunction(() => window.location.href)();
  await t.expect(pageUrl).eql('http://localhost:3000/sso/idps/facebook-idp-id-123?stateToken=inRUXNhsc6Evt7GAb8DPAA');

  await t.expect(logger.contains(record => record.response.statusCode === 200)).ok();
});

test.requestHooks(logger, mockIdpDiscoveryWithOneIdp)('IDP discovery will auto redirect to 3rd party IDP after identify with name', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);

  await checkConsoleMessages({
    controller: 'primary-auth',
    formName: 'identify',
  });

  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.clickNextButton();

  // assert redirect to IdP login page eventually
  await t.expect(Selector('h1').innerText).eql('An external IdP login page for testcafe testing');
  const pageUrl = await ClientFunction(() => window.location.href)();
  await t.expect(pageUrl).eql('http://localhost:3000/sso/idps/facebook-idp-id-123?stateToken=inRUXNhsc6Evt7GAb8DPAA');

  await t.expect(logger.contains(record => record.response.statusCode === 200)).ok();
});

test.requestHooks(logger, mockIdpDiscoveryWithOneIdp)('Direct auth: IDP discovery will auto redirect to 3rd party IDP after identify with name', async t => {
  const identityPage = await setupDirectAuth(t);
  await t.expect(identityPage.formExists()).eql(true);
  await checkConsoleMessages({
    controller: 'primary-auth',
    formName: 'identify',
  });

  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.clickNextButton();

  // assert redirect to IdP login page eventually
  await t.expect(Selector('h1').innerText).eql('An external IdP login page for testcafe testing');
  const pageUrl = await ClientFunction(() => window.location.href)();
  await t.expect(pageUrl).eql('http://localhost:3000/sso/idps/facebook-idp-id-123?stateToken=inRUXNhsc6Evt7GAb8DPAA');

  await t.expect(logger.contains(record => record.response.statusCode === 200)).ok();
});

test.requestHooks(logger, mockWithoutIdentify)('custom idps should show correct label', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);
  await t.expect(identityPage.getIdpButtonCount()).eql(6);
  await t.expect(identityPage.getIdpButton('Sign in with My SAML IDP').exists).eql(true);
  await t.expect(identityPage.getIdpButton('Sign in with SAML IDP').exists).eql(true);
});

test.requestHooks(logger, mockWithoutIdentify)('view with only idp buttons should render "Back to Sign In" link', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);
  await t.expect(identityPage.getIdpButtonCount()).eql(6);
  await t.expect(await identityPage.signoutLinkExists()).ok();
});

test.requestHooks(logger, mockErrorIdentifyOnlyOneIdp)('show terminal error on idp provider error', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);
  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.clickNextButton();
  await t.expect(identityPage.getErrorBoxText())
    .eql('There was a problem signing you into your identity provider. Please contact your administrator for help.');
  await t.expect(await identityPage.signoutLinkExists()).ok();
});
