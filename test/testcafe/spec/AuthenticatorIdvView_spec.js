import { RequestMock, RequestLogger } from 'testcafe';
import { renderWidget } from '../framework/shared';
import IdPAuthenticatorPageObject from '../framework/page-objects/IdPAuthenticatorPageObject';
import PersonaIdvResponse from '../../../playground/mocks/data/idp/idx/authenticator-verification-idp-with-persona.json';
import ClearIdvResponse from '../../../playground/mocks/data/idp/idx/authenticator-verification-idp-with-clear.json';
import IncodeIdvResponse from '../../../playground/mocks/data/idp/idx/authenticator-verification-idp-with-incode.json';

const logger = RequestLogger(/introspect/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const personaIdvMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(PersonaIdvResponse)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(PersonaIdvResponse)
  .onRequestTo('http://localhost:3000/idp/identity-verification?stateTokenExternalId=bzJOSnhodWVNZjZuVEsrUj')
  .respond('<html><h1>An external IdP login page for testcafe testing</h1></html>');

const clearIdvMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(ClearIdvResponse)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(ClearIdvResponse)
  .onRequestTo('http://localhost:3000/idp/identity-verification?stateTokenExternalId=bzJOSnhodWVNZjZuVEsrUj')
  .respond('<html><h1>An external IdP login page for testcafe testing</h1></html>');

const incodeIdvMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(IncodeIdvResponse)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(IncodeIdvResponse)
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
  .requestHooks(logger, personaIdvMock)('validate content on verify page for Persona', async t => {
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

test
  .requestHooks(logger, clearIdvMock)('validate content on verify page for Clear', async t => {
    const pageObject = await setup(t);
    await t.expect(pageObject.getFormTitle()).eql('Verify your identity with Clear');
    await t.expect(pageObject.getPageSubtitle()).eql('Verify your identity with Clear and share your verification results with Okta to finish setting up your Okta account.');
    await t.expect(pageObject.getBeaconSelector()).contains('mfa-idv-clear');

    const termsOfUseLink = pageObject.getLinkElement('Terms of Use');

    await t.expect(termsOfUseLink.exists).eql(true);
    await t.expect(termsOfUseLink.getAttribute('href')).eql('https://www.clearme.com/member-terms');

    const privacyPolicyLink = pageObject.getLinkElement('Privacy Policy');

    await t.expect(privacyPolicyLink.exists).eql(true);
    await t.expect(privacyPolicyLink.getAttribute('href')).eql('https://www.clearme.com/privacy-policy');
    
    await pageObject.submit('Continue');


    const pageUrl = await pageObject.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/idp/identity-verification?stateTokenExternalId=bzJOSnhodWVNZjZuVEsrUj');
  });

test
  .requestHooks(logger, incodeIdvMock)('validate content on verify page for Incode', async t => {
    const pageObject = await setup(t);
    await t.expect(pageObject.getFormTitle()).eql('Verify your identity with Incode');
    await t.expect(pageObject.getPageSubtitle()).eql('Verify your identity with Incode and share your verification results with Okta to finish setting up your Okta account.');
    await t.expect(pageObject.getBeaconSelector()).contains('mfa-idv-incode');

    const termsOfUseLink = pageObject.getLinkElement('Terms of Use');

    await t.expect(termsOfUseLink.exists).eql(true);
    await t.expect(termsOfUseLink.getAttribute('href')).eql('https://incode.id/terms');

    const privacyPolicyLink = pageObject.getLinkElement('Privacy Policy');

    await t.expect(privacyPolicyLink.exists).eql(true);
    await t.expect(privacyPolicyLink.getAttribute('href')).eql('https://incode.id/privacy');
    
    await pageObject.submit('Continue');


    const pageUrl = await pageObject.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/idp/identity-verification?stateTokenExternalId=bzJOSnhodWVNZjZuVEsrUj');
  });
