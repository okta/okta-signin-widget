import { RequestMock, RequestLogger, Selector, ClientFunction } from 'testcafe';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import identifyWithIdpsIdentify from '../../../playground/mocks/data/idp/idx/identify-with-third-party-idps';
import identifyWithIdpsNoIdentify from '../../../playground/mocks/data/idp/idx/identify-with-only-third-party-idps';
import identifyOnlyOneIdp from '../../../playground/mocks/data/idp/idx/identify-with-only-one-third-party-idp';
import identifyOnlyOneIdpAppUser from '../../../playground/mocks/data/idp/idx/identify-with-only-one-third-party-idp-app-user';

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
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identifyOnlyOneIdp)
  .onRequestTo('http://localhost:3000/sso/idps/facebook-idp-id-123?stateToken=inRUXNhsc6Evt7GAb8DPAA')
  .respond('<html><h1>A external IdP login page for testcafe testing</h1></html>');

const mockOnlyOneIdpAppUser = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identifyOnlyOneIdpAppUser)
  .onRequestTo('http://localhost:3000/sso/idps/facebook-idp-id-123?stateToken=inRUXNhsc6Evt7GAb8DPAA')
  .respond('<html><h1>A external IdP login page for testcafe testing</h1></html>');


fixture('Identify + IDPs');

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  return identityPage;
}

test.requestHooks(mockWithIdentify) ('should render idp buttons with identifier form ', async t => {
  const identityPage = await setup(t);

  const { log } = await t.getBrowserConsoleMessages();
  await t.expect(log.length).eql(3);
  await t.expect(log[0]).eql('===== playground widget ready event received =====');
  await t.expect(log[1]).eql('===== playground widget afterRender event received =====');
  await t.expect(JSON.parse(log[2])).eql({
    controller: 'primary-auth',
    formName: 'identify',
  });

  await t.expect(identityPage.identifierFieldExists('.o-form-input .input-fix input')).eql(true);
  await t.expect(identityPage.getIdpButton('.social-auth-facebook-button').textContent).eql('Sign in with Facebook');
  await t.expect(identityPage.getIdpButton('.social-auth-google-button').textContent).eql('Sign in with Google');
  await t.expect(identityPage.getIdpButton('.social-auth-linkedin-button').textContent).eql('Sign in with LinkedIn');
  await t.expect(identityPage.getIdpButton('.social-auth-microsoft-button').textContent).eql('Sign in with Microsoft');
});

test
  .requestHooks(mockWithIdentify)('clicking on idp button does redirect ', async t => {
    const identityPage = await setup(t);
    await t.expect(identityPage.identifierFieldExists('.o-form-input .input-fix input')).eql(true);
    await t.expect(identityPage.getIdpButton('.social-auth-facebook-button').textContent).eql('Sign in with Facebook');
    await t.expect(identityPage.getIdpButton('.social-auth-google-button').textContent).eql('Sign in with Google');
    await t.expect(identityPage.getIdpButton('.social-auth-linkedin-button').textContent).eql('Sign in with LinkedIn');
    await t.expect(identityPage.getIdpButton('.social-auth-microsoft-button').textContent).eql('Sign in with Microsoft');
    //click on social idp button
    await identityPage.clickIdpButton('.social-auth-facebook-button');
    const pageUrl = await identityPage.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/sso/idps/facebook-123?stateToken=eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvczI0VHZiWHlqOVFLSm4wZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..aDi6JnIZwCRzk7RN.xQ1R9jj43bV5S17F1juzgTZGd9Gq7VvuE4Hc1V_tMVcTWiVQ1Ntim1tQPZtmnpfOifu-N_quGGDSdgiidb_2xU1m9SbDMJhV-Yp6E07tABwjaRd_ekuRzDFw7Jxknz33LtSwQOTQ-WiH2o6JikLiEz2BQbgoizIc2izbtdod7HJg0HVnMZ9ZlBqyBG1-EISI_xPypq8uzP8n79hP_Zz41RI7VJA35yfTuNLOX_k6B-mfeVKf4HyFsKm62XWQgcPIxhjxBMqmyZow2toNclV3sIqgw7I5tKCLQSmSnKbFxxuT4-G31BdaVOALAe9Z89zlluTYaKAPOr86RMsqaGKnQFaplc_0PiPbreKhVgvSeeJgqX2RwnLgckLLiRo7TRDs2kLhGY2ope0AeA9TSsTVdJzsScftZWKgh9iHpXjS-kGcbRx0etu4iTtbHOu3rDIfIcvvt55mfvA66wzy1CCxHt4WYNnBKHX0fIOW_fa_-RYGYug9YRV5G6nQ6V-CfHoxmEsMhsoFJu0hei34_SJv15w2l3vxxBytrWSWi5qUfm5zGjNlx8e9n1Sf_eAqXCfLhBLK4_14jwtjNbWOZCdg5dwzxQiQWDItBjijEjdQrK0i6tw2Rp-IMJD1-4_ZfFZDmAXgZZtBYc3kdmumgYpKeYUJJgw0ZJWoG-Xr0bbzGGMx46yHzMpDbSTpiWhKGytQPbNja8sf_eeOKx_AAosamDUub9yuZJb0-Nj0xvXZ89J0m_09wa2Z3G-zY01sv9ONkXMFzRVwAb2bHmGle082bq33-7Klk7_ZzzkBROJhgDHQcw5QibGWaqYqscgKv2NQV8ebGJO_BHU46p1T3MQzStxRZ2EZua9qQwsmL8P5yboNDt2YmYnUvaOcGfeAqwgovqNDQ0H4u-D5psFmiU1STLOlN5pSAauKe4VxlLxphiirrmiNOOOW0XTwaQ1vtPz8gFlXsmGB-0zcsySG6A6HJ49eOeEI0J2REy2dlFRxzdKthANM2xFc_AIgas9mcNhSWtmVEtMxv7N0xqGAJbxaJC6U4kDDXdImZVaovz4lgRFkIh3aUXgUMX558u9MBeF6Q7z3piIpT6A4I1ww_eDNM02Vew.inRUXNhsc6Evt7GAb8DPAA');
  });


test.requestHooks(mockWithoutIdentify)('should only render idp buttons with identifier form ', async t => {
  const identityPage = await setup(t);

  const { log } = await t.getBrowserConsoleMessages();
  await t.expect(log.length).eql(3);
  await t.expect(log[0]).eql('===== playground widget ready event received =====');
  await t.expect(log[1]).eql('===== playground widget afterRender event received =====');
  await t.expect(JSON.parse(log[2])).eql({
    controller: null,
    formName: 'redirect-idp',
  });

  await t.expect(identityPage.identifierFieldExists('.o-form-input .input-fix input')).eql(false);
  await t.expect(identityPage.getIdpButton('.social-auth-facebook-button').textContent).eql('Sign in with Facebook');
  await t.expect(identityPage.getIdpButton('.social-auth-google-button').textContent).eql('Sign in with Google');
  await t.expect(identityPage.getIdpButton('.social-auth-linkedin-button').textContent).eql('Sign in with LinkedIn');
  await t.expect(identityPage.getIdpButton('.social-auth-microsoft-button').textContent).eql('Sign in with Microsoft');

  // no signout link at enroll page
  await t.expect(await identityPage.signoutLinkExists()).notOk();
});

test.requestHooks(logger, mockOnlyOneIdp)('should auto redirect to 3rd party IdP login page with basic Signing in message', async t => {
  await setup(t);

  const { log } = await t.getBrowserConsoleMessages();
  await t.expect(log.length).eql(3);
  await t.expect(log[0]).eql('===== playground widget ready event received =====');
  await t.expect(log[1]).eql('===== playground widget afterRender event received =====');
  await t.expect(JSON.parse(log[2])).eql({
    controller: null,
    formName: 'success-redirect',
  });

  // assert redirect to IdP login page eventually
  await t.expect(Selector('h1').innerText).eql('A external IdP login page for testcafe testing');
  const pageUrl = await ClientFunction(() => window.location.href)();
  await t.expect(pageUrl).eql('http://localhost:3000/sso/idps/facebook-idp-id-123?stateToken=inRUXNhsc6Evt7GAb8DPAA');

  await t.expect(logger.contains(record => record.response.statusCode === 200)).ok();

});

test.requestHooks(logger, mockOnlyOneIdpAppUser)('should auto redirect to 3rd party IdP login page with Signing in longer message', async t => {
  await setup(t);

  const { log } = await t.getBrowserConsoleMessages();
  await t.expect(log.length).eql(3);
  await t.expect(log[0]).eql('===== playground widget ready event received =====');
  await t.expect(log[1]).eql('===== playground widget afterRender event received =====');
  await t.expect(JSON.parse(log[2])).eql({
    controller: null,
    formName: 'success-redirect',
  });

  // assert redirect to IdP login page eventually
  await t.expect(Selector('h1').innerText).eql('A external IdP login page for testcafe testing');
  const pageUrl = await ClientFunction(() => window.location.href)();
  await t.expect(pageUrl).eql('http://localhost:3000/sso/idps/facebook-idp-id-123?stateToken=inRUXNhsc6Evt7GAb8DPAA');

  await t.expect(logger.contains(record => record.response.statusCode === 200)).ok();
});
