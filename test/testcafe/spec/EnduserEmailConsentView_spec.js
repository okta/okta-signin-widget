import { RequestMock, RequestLogger } from 'testcafe';
import EnduserConsentPageObject from '../framework/page-objects/EnduserConsentPageObject';
import enduserEmailConsentChallengeResponse from '../../../playground/mocks/data/idp/idx/email-challenge-consent';
import enduserEmailConsentChallengeSuccess from '../../../playground/mocks/data/idp/idx/terminal-return-email-consent';
import enduserEmailConsentChallengeDenied from '../../../playground/mocks/data/idp/idx/terminal-return-email-consent-denied';
import TerminalPageObject from '../framework/page-objects/TerminalPageObject';
import { a11yCheck } from '../framework/shared';

const requestLogger = RequestLogger(/consent/, {
  logRequestBody: true,
  stringifyRequestBody: true,
});

const enduserEmailConsentSuccess = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(enduserEmailConsentChallengeResponse)
  .onRequestTo('http://localhost:3000/idp/idx/consent')
  .respond(enduserEmailConsentChallengeSuccess);

const enduserEmailConsentFailure = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(enduserEmailConsentChallengeResponse)
  .onRequestTo('http://localhost:3000/idp/idx/consent')
  .respond(enduserEmailConsentChallengeDenied);

fixture('Enduser Email Consent');

async function setup(t) {
  const consentPageObject = new EnduserConsentPageObject(t);
  await consentPageObject.navigateToPage();
  await a11yCheck(t);

  return consentPageObject;
}

test
  .requestHooks(enduserEmailConsentSuccess)('has the right title, info and button texts', async t => {
    const consentPage = await setup(t);
    const infoTexts = await consentPage.getInfoItemTexts();
    const title = await consentPage.getFormTitle();
    const saveButtonText = await consentPage.getSaveButtonLabel();
    const cancelButtonText = await consentPage.getCancelButtonLabel();
    await t.expect(infoTexts).contains('FIREFOX');
    await t.expect(infoTexts).contains('Info DyneX');
    await t.expect(title).eql('Did you just try to sign in?');
    await t.expect(saveButtonText).eql('Yes, it\'s me');
    await t.expect(cancelButtonText).eql('No, it\'s not me');
    await t.expect(consentPage.getBeaconClass()).contains('mfa-okta-email');
  });

test
  .requestHooks(requestLogger, enduserEmailConsentSuccess)('consent granted flow', async t => {
    const consentPage  = await setup(t);
    await consentPage.clickAllowButton();

    const {
      request: {
        body,
        method,
        url,
      },
    } = requestLogger.requests[requestLogger.requests.length - 1];

    const { consent } = JSON.parse(body);
    await t.expect(consent).eql(true);
    await t.expect(method).eql('post');
    await t.expect(url).eql('http://localhost:3000/idp/idx/consent');

    const terminalPage = new TerminalPageObject(t);
    await t.expect(terminalPage.getBeaconClass()).contains('mfa-okta-email');
    await t.expect(terminalPage.getMessages()).contains('Please return to the original tab.');
    await t.expect(terminalPage.getMessages()).contains('To continue, return to the device or window where you requested the email link. You may close this window at any time.');
  });

test
  .requestHooks(requestLogger, enduserEmailConsentFailure)('consent denied flow', async t => {
    const consentPage  = await setup(t);
    await consentPage.clickDontAllowButton();

    const {
      request: {
        body,
        method,
        url,
      },
    } = requestLogger.requests[requestLogger.requests.length - 1];

    const { consent } = JSON.parse(body);
    await t.expect(consent).eql(false);
    await t.expect(method).eql('post');
    await t.expect(url).eql('http://localhost:3000/idp/idx/consent');
    
    const terminalPage = new TerminalPageObject(t);
    await t.expect(terminalPage.getBeaconClass()).contains('mfa-okta-email');
    await t.expect(terminalPage.getErrorMessages().isError()).eql(true);
    await t.expect(terminalPage.getErrorMessages().getTextContent()).eql('Access denied on other device.');
    await t.expect(terminalPage.getMessages()).contains('You may close this window at any time.');
  });