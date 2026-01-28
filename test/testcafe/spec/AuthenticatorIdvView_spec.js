import { RequestMock, RequestLogger } from 'testcafe';
import IdPAuthenticatorPageObject from '../framework/page-objects/IdPAuthenticatorPageObject';
import PersonaIdvResponse from '../../../playground/mocks/data/idp/idx/authenticator-verification-idp-with-persona.json';
import ClearIdvResponse from '../../../playground/mocks/data/idp/idx/authenticator-verification-idp-with-clear.json';
import IncodeIdvResponse from '../../../playground/mocks/data/idp/idx/authenticator-verification-idp-with-incode.json';
import CustomIdvResponse from '../../../playground/mocks/data/idp/idx/authenticator-verification-idp-with-customIDV.json';

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

const customIdvMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(CustomIdvResponse)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(CustomIdvResponse)
  .onRequestTo('http://localhost:3000/idp/identity-verification?stateTokenExternalId=bzJOSnhodWVNZjZuVEsrUj')
  .respond('<html><h1>An external IdP login page for testcafe testing</h1></html>');

async function setup(t) {
  const pageObject = new IdPAuthenticatorPageObject(t);
  await pageObject.navigateToPage();
  await t.expect(pageObject.formExists()).eql(true);
  return pageObject;
}

fixture('ID Verification');
test
  .requestHooks(logger, personaIdvMock)('validate content on verify page for Persona', async t => {
    const pageObject = await setup(t);
    await t.expect(pageObject.getFormTitle()).eql('Verify your identity with Persona');
    await t.expect(pageObject.getPageSubtitle()).eql('Verify your identity with Persona to continue and share your verification results with Okta. You may need a valid government-issued ID.');
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
    await t.expect(pageObject.getPageSubtitle()).eql('Verify your identity with Clear to continue and share your verification results with Okta. You may need a valid government-issued ID.');
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
    await t.expect(pageObject.getPageSubtitle()).eql('Verify your identity with Incode to continue and share your verification results with Okta. You may need a valid government-issued ID.');
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

test
  .requestHooks(logger, customIdvMock)('validate content on verify page for Custom IDV', async t => {
    const pageObject = await setup(t);
    await t.expect(pageObject.getFormTitle()).eql('Verify your identity with Custom_IDV');
    await t.expect(pageObject.getPageSubtitle()).eql('Verify your identity with Custom_IDV to continue and share your verification results with Okta. You may need a valid government-issued ID.');
    await t.expect(pageObject.getBeaconSelector()).contains('mfa-idv-standard');

    const termsOfUseLink = pageObject.getLinkElement('Terms of Use');

    await t.expect(termsOfUseLink.exists).eql(true);
    await t.expect(termsOfUseLink.getAttribute('href')).eql('https://customidv.com/term');

    const privacyPolicyLink = pageObject.getLinkElement('Privacy Policy');

    await t.expect(privacyPolicyLink.exists).eql(true);
    await t.expect(privacyPolicyLink.getAttribute('href')).eql('https://customidv.com/privacy');
    
    await pageObject.submit('Continue');  
    const pageUrl = await pageObject.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/idp/identity-verification?stateTokenExternalId=bzJOSnhodWVNZjZuVEsrUj');
  });
