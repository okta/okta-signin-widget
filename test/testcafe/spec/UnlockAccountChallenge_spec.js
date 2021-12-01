import { RequestMock, ClientFunction } from 'testcafe';
import SelectFactorPageObject from '../framework/page-objects/SelectAuthenticatorPageObject';
import ChallengeEmailPageObject from '../framework/page-objects/ChallengeEmailPageObject';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import xhrIdentifyWithUnlock from '../../../playground/mocks/data/idp/idx/identify-with-unlock-account-link';
import xhrUserUnlockAuthSelector from '../../../playground/mocks/data/idp/idx/user-unlock-account';
import xhrUserUnlockSuccess from '../../../playground/mocks/data/idp/idx/user-account-unlock-success';
import xhrUserUnlockEmailChallenge from '../../../playground/mocks/data/idp/idx/authenticator-verification-email';
import xhrErrorUnlockAccount from '../../../playground/mocks/data/idp/idx/error-unlock-account';
import TerminalPageObject from '../framework/page-objects/TerminalPageObject';
import { a11yCheck } from '../framework/shared';

const identifyLockedUserMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithUnlock)
  .onRequestTo('http://localhost:3000/idp/idx/unlock-account')
  .respond(xhrUserUnlockAuthSelector)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrUserUnlockEmailChallenge)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrUserUnlockSuccess);

const errorUnlockAccount = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithUnlock)
  .onRequestTo('http://localhost:3000/idp/idx/unlock-account')
  .respond(xhrUserUnlockAuthSelector)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrUserUnlockEmailChallenge)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrErrorUnlockAccount);

const rerenderWidget = ClientFunction((settings) => {
  window.renderPlaygroundWidget(settings);
});

fixture('Unlock Account');

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  await a11yCheck(t);
  return identityPage;
}

test.requestHooks(identifyLockedUserMock)('should show unlock account link', async t => {
  const identityPage = await setup(t);
  await t.expect(identityPage.getUnlockAccountLinkText()).eql('Unlock account?');
});


test.requestHooks(identifyLockedUserMock)('should render custom Unlock account link', async t => {
  const identityPage = await setup(t);

  await rerenderWidget({
    helpLinks: {
      unlock: 'http://unlockaccount',
    },
    i18n: {
      en: {
        'unlockaccount': 'HELP I\'M LOCKED OUT'
      }
    }
  });

  await t.expect(identityPage.getUnlockAccountLinkText()).eql('HELP I\'M LOCKED OUT');
  await t.expect(identityPage.getCustomUnlockAccountLink()).eql('http://unlockaccount');
});

test.requestHooks(identifyLockedUserMock)('should show unlock account authenticator selection list', async t => {
  const identityPage = await setup(t);
  await identityPage.clickUnlockAccountLink();

  const selectFactorPage = new SelectFactorPageObject(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Unlock account?');
  await t.expect(selectFactorPage.getFactorsCount()).eql(2);
  await selectFactorPage.fillIdentifierField('username');
  await selectFactorPage.selectFactorByIndex(0);

  const challengeEmailPageObject =new ChallengeEmailPageObject(t);
  await t.expect(challengeEmailPageObject.getFormTitle()).eql('Verify with your email');
  await challengeEmailPageObject.clickEnterCodeLink();
  await challengeEmailPageObject.verifyFactor('credentials.passcode', '12345');
  await challengeEmailPageObject.clickNextButton();

  const successPage = new TerminalPageObject(t);
  await t.expect(successPage.getFormTitle()).eql('Account successfully unlocked!');
  await t.expect(successPage.getMessages()).eql('You can log in using your existing username and password.');
  const gobackLinkExists = await successPage.goBackLinkExists();
  await t.expect(gobackLinkExists).eql(false);
  const signoutLinkExists = await successPage.signoutLinkExists();
  await t.expect(signoutLinkExists).eql(true);
});

test.requestHooks(errorUnlockAccount)('should show error if identifier is blank', async t => {
  const identityPage = await setup(t);
  await identityPage.clickUnlockAccountLink();
  const selectFactorPage = new SelectFactorPageObject(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Unlock account?');
  await selectFactorPage.selectFactorByIndex(0);
  await t.expect(selectFactorPage.getIndetifierError()).eql('This field cannot be left blank');
});

test.requestHooks(errorUnlockAccount)('should show error when unlock account fails', async t => {
  const identityPage = await setup(t);
  await identityPage.clickUnlockAccountLink();
  const selectFactorPage = new SelectFactorPageObject(t);
  await selectFactorPage.fillIdentifierField('username');
  await selectFactorPage.selectFactorByIndex(0);

  const challengeEmailPageObject = new ChallengeEmailPageObject(t);
  await challengeEmailPageObject.clickEnterCodeLink();
  await challengeEmailPageObject.verifyFactor('credentials.passcode', '12345');
  await challengeEmailPageObject.clickNextButton();

  const terminaErrorPage = new TerminalPageObject(t);
  await terminaErrorPage.waitForErrorBox();
  await t.expect(terminaErrorPage.getErrorMessages().isError()).eql(true);
  await t.expect(terminaErrorPage.getErrorMessages().getTextContent()).eql('We are unable to unlock your account at this time, please contact your administrator');
});
