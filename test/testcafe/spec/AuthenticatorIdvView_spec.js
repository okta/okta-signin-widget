import { RequestMock, RequestLogger } from 'testcafe';
import { renderWidget } from '../framework/shared';
import IdPAuthenticatorPageObject from '../framework/page-objects/IdPAuthenticatorPageObject';
import IdvResponse from '../../../playground/mocks/data/idp/idx/authenticator-verification-idp-with-persona.json';

const logger = RequestLogger(/introspect/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const idvMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(IdvResponse)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(IdvResponse)
  .onRequestTo('http://localhost:3000/idp/identity-verification?stateTokenExternalId=bzJOSnhodWVNZjZuVEsrUj')
  .respond('<html><h1>An external IdP login page for testcafe testing</h1></html>');


async function setup(t, widgetOptions = undefined) {
  const options = widgetOptions ? { render: false } : {};
  const pageObject = new IdPAuthenticatorPageObject(t);
  await pageObject.navigateToPage(options);
  if (widgetOptions) {
    await renderWidget(widgetOptions);
  }
  await t.expect(pageObject.formExists()).eql(true);
  return pageObject;
}

fixture('ID Verification');
test
  .requestHooks(logger, idvMock)('validate content on verify page', async t => {
    const pageObject = await setup(t);
    await t.expect(pageObject.getFormTitle()).eql('Verify your identity with Persona');
    await t.expect(pageObject.getPageSubtitle()).eql('Verify your identity with Persona and share your verification results with Okta to finish setting up your Okta account.');
    await t.expect(pageObject.getBeaconSelector()).contains('mfa-idv-persona');

    const termsOfUseLink = pageObject.getLinkElement('Terms of Use');

    await t.expect(termsOfUseLink.exists).eql(true);
    await t.expect(termsOfUseLink.getAttribute('href')).eql('https://withpersona.com/legal/terms-of-use');

    const privacyPolicyLink = pageObject.getLinkElement('Privacy Policy');

    await t.expect(privacyPolicyLink.exists).eql(true);
    await t.expect(privacyPolicyLink.getAttribute('href')).eql('https://withpersona.com/legal/privacy-policy');
    
    await pageObject.submit('Continue');


    const pageUrl = await pageObject.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/idp/identity-verification?stateTokenExternalId=bzJOSnhodWVNZjZuVEsrUj');
  });
