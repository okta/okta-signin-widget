import { RequestMock } from 'testcafe';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import identifyWithIdps from '../../../playground/mocks/idp/idx/data/identify-with-third-party-idp';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identifyWithIdps);

fixture(`Identity With IDPs Form`)
  .requestHooks(mock);

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  return identityPage;
}

test(`should render idp buttons with identifier form `, async t => {
  const identityPage = await setup(t);
  await t.expect(identityPage.identifierFieldExists('.o-form-input .input-fix input')).eql(true);
  await t.expect(identityPage.getIdpButton('.social-auth-facebook-button').textContent).eql('Sign in with Facebook IDP');
  await t.expect(identityPage.getIdpButton('.social-auth-google-button').textContent).eql('Sign in with Google IDP');
  await t.expect(identityPage.getIdpButton('.social-auth-linkedin-button').textContent).eql('Sign in with Linkedin IDP');
  await t.expect(identityPage.getIdpButton('.social-auth-microsoft-button').textContent).eql('Sign in with Microsoft IDP');
});

test(`clicking on idp button does redirect `, async t => {
  const identityPage = await setup(t);
  await t.expect(identityPage.identifierFieldExists('.o-form-input .input-fix input')).eql(true);
  await t.expect(identityPage.getIdpButton('.social-auth-facebook-button').textContent).eql('Sign in with Facebook IDP');
  await t.expect(identityPage.getIdpButton('.social-auth-google-button').textContent).eql('Sign in with Google IDP');
  await t.expect(identityPage.getIdpButton('.social-auth-linkedin-button').textContent).eql('Sign in with Linkedin IDP');
  await t.expect(identityPage.getIdpButton('.social-auth-microsoft-button').textContent).eql('Sign in with Microsoft IDP');
  //click on social idp button
  await identityPage.clickIdpButton('.social-auth-facebook-button');
  const pageUrl = await identityPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/sso/idps/0oa2szc1K1YPgz1pe0g4?stateToken=eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvczI0VHZiWHlqOVFLSm4wZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..aDi6JnIZwCRzk7RN.xQ1R9jj43bV5S17F1juzgTZGd9Gq7VvuE4Hc1V_tMVcTWiVQ1Ntim1tQPZtmnpfOifu-N_quGGDSdgiidb_2xU1m9SbDMJhV-Yp6E07tABwjaRd_ekuRzDFw7Jxknz33LtSwQOTQ-WiH2o6JikLiEz2BQbgoizIc2izbtdod7HJg0HVnMZ9ZlBqyBG1-EISI_xPypq8uzP8n79hP_Zz41RI7VJA35yfTuNLOX_k6B-mfeVKf4HyFsKm62XWQgcPIxhjxBMqmyZow2toNclV3sIqgw7I5tKCLQSmSnKbFxxuT4-G31BdaVOALAe9Z89zlluTYaKAPOr86RMsqaGKnQFaplc_0PiPbreKhVgvSeeJgqX2RwnLgckLLiRo7TRDs2kLhGY2ope0AeA9TSsTVdJzsScftZWKgh9iHpXjS-kGcbRx0etu4iTtbHOu3rDIfIcvvt55mfvA66wzy1CCxHt4WYNnBKHX0fIOW_fa_-RYGYug9YRV5G6nQ6V-CfHoxmEsMhsoFJu0hei34_SJv15w2l3vxxBytrWSWi5qUfm5zGjNlx8e9n1Sf_eAqXCfLhBLK4_14jwtjNbWOZCdg5dwzxQiQWDItBjijEjdQrK0i6tw2Rp-IMJD1-4_ZfFZDmAXgZZtBYc3kdmumgYpKeYUJJgw0ZJWoG-Xr0bbzGGMx46yHzMpDbSTpiWhKGytQPbNja8sf_eeOKx_AAosamDUub9yuZJb0-Nj0xvXZ89J0m_09wa2Z3G-zY01sv9ONkXMFzRVwAb2bHmGle082bq33-7Klk7_ZzzkBROJhgDHQcw5QibGWaqYqscgKv2NQV8ebGJO_BHU46p1T3MQzStxRZ2EZua9qQwsmL8P5yboNDt2YmYnUvaOcGfeAqwgovqNDQ0H4u-D5psFmiU1STLOlN5pSAauKe4VxlLxphiirrmiNOOOW0XTwaQ1vtPz8gFlXsmGB-0zcsySG6A6HJ49eOeEI0J2REy2dlFRxzdKthANM2xFc_AIgas9mcNhSWtmVEtMxv7N0xqGAJbxaJC6U4kDDXdImZVaovz4lgRFkIh3aUXgUMX558u9MBeF6Q7z3piIpT6A4I1ww_eDNM02Vew.inRUXNhsc6Evt7GAb8DPAA');
});
