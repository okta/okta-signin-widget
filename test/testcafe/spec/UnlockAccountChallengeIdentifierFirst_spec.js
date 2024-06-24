import { RequestMock, ClientFunction } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import SelectFactorPageObject from '../framework/page-objects/SelectAuthenticatorPageObject';
import ChallengeEmailPageObject from '../framework/page-objects/ChallengeEmailPageObject';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import SignInDevicePageObject from '../framework/page-objects/SignInDevicePageObject';
import xhrIdentifyWithUnlock from '../../../playground/mocks/data/idp/idx/identify-with-unlock-account-link';
import xhrIdentifyWithPassword from '../../../playground/mocks/data/idp/idx/identify-with-password';
import xhrUserUnlockAuthSelector from '../../../playground/mocks/data/idp/idx/user-unlock-account';
import xhrUserUnlockAuthSelectorIdentifierFirst from '../../../playground/mocks/data/idp/idx/user-unlock-account-choose-auth-identifier-first.json';
import xhrUserUnlockIdentifierFirst from '../../../playground/mocks/data/idp/idx/user-unlock-account-identifier-first.json';
import xhrUserUnlockOneAuthIdentifierFirst from '../../../playground/mocks/data/idp/idx/user-unlock-account-one-authenticator-identifier-first.json';
import xhrUserUnlockSuccess from '../../../playground/mocks/data/idp/idx/user-account-unlock-success';
import xhrUserUnlockSuccessLandOnApp from '../../../playground/mocks/data/idp/idx/user-account-unlock-success-land-on-app';
import xhrUserUnlockEmailChallenge from '../../../playground/mocks/data/idp/idx/authenticator-verification-email';
import xhrErrorUnlockAccount from '../../../playground/mocks/data/idp/idx/error-unlock-account';
import TerminalPageObject from '../framework/page-objects/TerminalPageObject';
import smartProbingRequired from '../../../playground/mocks/data/idp/idx/smart-probing-required';
import launchAuthenticatorOption from '../../../playground/mocks/data/idp/idx/identify-with-device-launch-authenticator';


const legacyIdentifyLockedUserMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithUnlock)
  .onRequestTo('http://localhost:3000/idp/idx/unlock-account')
  .respond(xhrUserUnlockAuthSelector)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrUserUnlockEmailChallenge)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrUserUnlockSuccess);

const identifyLockedUserMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithUnlock)
  .onRequestTo('http://localhost:3000/idp/idx/unlock-account')
  .respond(xhrUserUnlockIdentifierFirst)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrUserUnlockAuthSelectorIdentifierFirst)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrUserUnlockEmailChallenge)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrUserUnlockSuccess);

const identifyMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithPassword);

const legacyErrorUnlockAccount = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithUnlock)
  .onRequestTo('http://localhost:3000/idp/idx/unlock-account')
  .respond(xhrUserUnlockAuthSelector)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrUserUnlockEmailChallenge)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrErrorUnlockAccount);

const errorUnlockAccount = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithUnlock)
  .onRequestTo('http://localhost:3000/idp/idx/unlock-account')
  .respond(xhrUserUnlockIdentifierFirst)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrUserUnlockAuthSelectorIdentifierFirst)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrUserUnlockEmailChallenge)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrErrorUnlockAccount);

const legacyIdentifyLockedUserLandOnAppMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithUnlock)
  .onRequestTo('http://localhost:3000/idp/idx/unlock-account')
  .respond(xhrUserUnlockAuthSelector)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrUserUnlockEmailChallenge)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrUserUnlockSuccessLandOnApp);

const identifyLockedUserLandOnAppMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithUnlock)
  .onRequestTo('http://localhost:3000/idp/idx/unlock-account')
  .respond(xhrUserUnlockIdentifierFirst)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrUserUnlockAuthSelectorIdentifierFirst)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrUserUnlockEmailChallenge)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrUserUnlockSuccessLandOnApp);

const xhrUserUnlockAuthSelectorWithOneAuthenticator = JSON.parse(JSON.stringify(xhrUserUnlockAuthSelector));
xhrUserUnlockAuthSelectorWithOneAuthenticator.remediation.value[0].value[1].options.splice(-1, 1);

const legacyIdentifyLockedUserMockWithOneAuthenticator = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithUnlock)
  .onRequestTo('http://localhost:3000/idp/idx/unlock-account')
  .respond(xhrUserUnlockAuthSelectorWithOneAuthenticator)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrUserUnlockEmailChallenge)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrUserUnlockSuccess);

const identifyLockedUserMockWithOneAuthenticator = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithUnlock)
  .onRequestTo('http://localhost:3000/idp/idx/unlock-account')
  .respond(xhrUserUnlockOneAuthIdentifierFirst)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrUserUnlockEmailChallenge)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrUserUnlockSuccess);

const signInDeviceMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(smartProbingRequired)
  .onRequestTo('http://localhost:3000/idp/idx/authenticators/okta-verify/launch')
  .respond(launchAuthenticatorOption);


const rerenderWidget = ClientFunction((settings) => {
  window.renderPlaygroundWidget(settings);
});

fixture('Unlock Account Identifier First');

async function setup(t, widgetOptions) {
  const options = widgetOptions ? { render: false } : {};
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage(options);
  if (widgetOptions) {
    await rerenderWidget(widgetOptions);
  }
  await t.expect(identityPage.formExists()).ok();
  return identityPage;
}

async function setupSignInDevice(t, widgetOptions) {
  const options = widgetOptions ? { render: false } : {};
  const signInDevicePageObject = new SignInDevicePageObject(t);
  await signInDevicePageObject.navigateToPage(options);
  if (widgetOptions) {
    await rerenderWidget(widgetOptions);
  }
  await t.expect(signInDevicePageObject.formExists()).ok();
  return signInDevicePageObject;
}

test.requestHooks(legacyIdentifyLockedUserMock)('should show unlock account link', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);
  await t.expect(identityPage.getUnlockAccountLinkText()).eql('Unlock account?');
  await t.expect(identityPage.getNeedhelpLinkText()).eql('Help');
});


test.requestHooks(legacyIdentifyLockedUserMock)('should render custom Unlock account link', async t => {
  const customUnlockLinkText = 'HELP I\'M LOCKED OUT';
  const identityPage = await setup(t, {
    helpLinks: {
      unlock: 'http://unlockaccount',
    },
    i18n: {
      en: {
        'unlockaccount': customUnlockLinkText
      }
    }
  });
  await checkA11y(t);

  await t.expect(identityPage.unlockAccountLinkExists(customUnlockLinkText)).eql(true);
  await t.expect(identityPage.getCustomUnlockAccountLinkUrl(customUnlockLinkText)).eql('http://unlockaccount');
});

// Legacy faked identifier-first flow only existed for gen3
test.meta('gen2', false).requestHooks(legacyIdentifyLockedUserMock)('should show unlock account authenticator selection list when user has more than one authenticator (legacy faked flow)', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);
  await identityPage.clickUnlockAccountLink();

  const selectFactorPage = new SelectFactorPageObject(t);
  await t.expect(selectFactorPage.getFormTitle()).contains('Unlock account');
  await selectFactorPage.fillIdentifierField('username');

  await t.expect(selectFactorPage.getNextButton().exists).eql(true);
  await selectFactorPage.goToNextPage();

  await t.expect(selectFactorPage.getFactorsCount()).eql(2);
  await selectFactorPage.selectFactorByIndex(0);

  const challengeEmailPageObject = new ChallengeEmailPageObject(t);
  await t.expect(challengeEmailPageObject.getFormTitle()).eql('Verify with your email');
  await challengeEmailPageObject.clickEnterCodeLink();
  await challengeEmailPageObject.verifyFactor('credentials.passcode', '12345');
  await challengeEmailPageObject.clickVerifyButton();

  const successPage = new TerminalPageObject(t);
  await t.expect(successPage.getFormTitle()).eql('Account successfully unlocked!');
  await t.expect(successPage.doesTextExist('You can log in using your existing username and password.')).eql(true);
  const gobackLinkExists = await successPage.goBackLinkExistsV2();
  await t.expect(gobackLinkExists).eql(false);
  const signoutLinkExists = await successPage.signoutLinkExists();
  await t.expect(signoutLinkExists).eql(true);
});


test.requestHooks(identifyLockedUserMock)('should show unlock account authenticator selection list when user has more than one authenticator', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);
  await identityPage.clickUnlockAccountLink();

  const selectFactorPage = new SelectFactorPageObject(t);
  await t.expect(selectFactorPage.getFormTitle()).contains('Unlock account');
  await selectFactorPage.fillIdentifierField('username');

  await t.expect(selectFactorPage.getNextButton().exists).eql(true);
  await selectFactorPage.goToNextPage();

  await t.expect(selectFactorPage.getFactorsCount()).eql(2);
  await selectFactorPage.selectFactorByIndex(0);

  const challengeEmailPageObject = new ChallengeEmailPageObject(t);
  await t.expect(challengeEmailPageObject.getFormTitle()).eql('Verify with your email');
  await challengeEmailPageObject.clickEnterCodeLink();
  await challengeEmailPageObject.verifyFactor('credentials.passcode', '12345');
  await challengeEmailPageObject.clickVerifyButton();

  const successPage = new TerminalPageObject(t);
  await t.expect(successPage.getFormTitle()).eql('Account successfully unlocked!');
  await t.expect(successPage.doesTextExist('You can log in using your existing username and password.')).eql(true);
  const gobackLinkExists = await successPage.goBackLinkExistsV2();
  await t.expect(gobackLinkExists).eql(false);
  const signoutLinkExists = await successPage.signoutLinkExists();
  await t.expect(signoutLinkExists).eql(true);
});

test.meta('gen2', false).requestHooks(legacyIdentifyLockedUserMockWithOneAuthenticator)('should proceed directly to challenge authenticator view when user only has one authenticator (legacy faked flow)', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);
  await identityPage.clickUnlockAccountLink();

  const selectFactorPage = new SelectFactorPageObject(t);
  await selectFactorPage.fillIdentifierField('username');
  await t.expect(selectFactorPage.getNextButton().exists).eql(true);
  await selectFactorPage.goToNextPage();

  const challengeEmailPageObject = new ChallengeEmailPageObject(t);
  await t.expect(challengeEmailPageObject.getFormTitle()).eql('Verify with your email');
  await challengeEmailPageObject.clickEnterCodeLink();
  await challengeEmailPageObject.verifyFactor('credentials.passcode', '12345');
  await challengeEmailPageObject.clickVerifyButton();

  const successPage = new TerminalPageObject(t);
  await t.expect(successPage.getFormTitle()).eql('Account successfully unlocked!');
  await t.expect(successPage.doesTextExist('You can log in using your existing username and password.')).eql(true);
  const gobackLinkExists = await successPage.goBackLinkExistsV2();
  await t.expect(gobackLinkExists).eql(false);
  const signoutLinkExists = await successPage.signoutLinkExists();
  await t.expect(signoutLinkExists).eql(true);
});

test.requestHooks(identifyLockedUserMockWithOneAuthenticator)('should proceed directly to challenge authenticator view when user only has one authenticator', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);
  await identityPage.clickUnlockAccountLink();

  const selectFactorPage = new SelectFactorPageObject(t);
  await selectFactorPage.fillIdentifierField('username');
  await t.expect(selectFactorPage.getNextButton().exists).eql(true);
  await selectFactorPage.goToNextPage();

  const challengeEmailPageObject = new ChallengeEmailPageObject(t);
  await t.expect(challengeEmailPageObject.getFormTitle()).eql('Verify with your email');
  await challengeEmailPageObject.clickEnterCodeLink();
  await challengeEmailPageObject.verifyFactor('credentials.passcode', '12345');
  await challengeEmailPageObject.clickVerifyButton();

  const successPage = new TerminalPageObject(t);
  await t.expect(successPage.getFormTitle()).eql('Account successfully unlocked!');
  await t.expect(successPage.doesTextExist('You can log in using your existing username and password.')).eql(true);
  const gobackLinkExists = await successPage.goBackLinkExistsV2();
  await t.expect(gobackLinkExists).eql(false);
  const signoutLinkExists = await successPage.signoutLinkExists();
  await t.expect(signoutLinkExists).eql(true);
});

[
  ['should proceed to authenticator list view when the form is submitted via keyboard', legacyIdentifyLockedUserMock],
  ['should proceed to authenticator list view when the form is submitted via keyboard', identifyLockedUserMock],
].forEach(([ testTitle, mock]) => {
  test.requestHooks(mock)(testTitle, async t => {
    const identityPage = await setup(t);
    await checkA11y(t);
    await identityPage.clickUnlockAccountLink();

    const selectFactorPage = new SelectFactorPageObject(t);
    await selectFactorPage.fillIdentifierField('username');
    await t.pressKey('enter');

    await t.expect(selectFactorPage.getFactorsCount()).eql(2);
  });
});

test.meta('gen2', false).requestHooks(legacyErrorUnlockAccount)('should show error box if form is submitted with blank identifier (legacy faked flow)', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);
  await identityPage.clickUnlockAccountLink();
  const selectFactorPage = new SelectFactorPageObject(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Unlock account?');

  await t.expect(selectFactorPage.getNextButton().exists).eql(true);
  await selectFactorPage.goToNextPage();
  await selectFactorPage.waitForErrorBox();

  await t.expect(selectFactorPage.getErrorBoxText()).contains('We found some errors. Please review the form and make corrections.');
});

test.requestHooks(errorUnlockAccount)('should show error box if form is submitted with blank identifier', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);
  await identityPage.clickUnlockAccountLink();
  const selectFactorPage = new SelectFactorPageObject(t);
  await t.expect(selectFactorPage.getFormTitle()).contains('Unlock account');

  await t.expect(selectFactorPage.getNextButton().exists).eql(true);
  await selectFactorPage.goToNextPage();
  await selectFactorPage.waitForErrorBox();

  await t.expect(selectFactorPage.getErrorBoxText()).contains('We found some errors. Please review the form and make corrections.');
});

test.requestHooks(errorUnlockAccount)('should show error when unlock account fails', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);
  await identityPage.clickUnlockAccountLink();
  const selectFactorPage = new SelectFactorPageObject(t);
  await selectFactorPage.fillIdentifierField('username');
  await t.expect(selectFactorPage.getNextButton().exists).eql(true);
  await selectFactorPage.goToNextPage();  
  await selectFactorPage.selectFactorByIndex(0);

  const challengeEmailPageObject = new ChallengeEmailPageObject(t);
  await challengeEmailPageObject.clickEnterCodeLink();
  await challengeEmailPageObject.verifyFactor('credentials.passcode', '12345');
  await challengeEmailPageObject.clickVerifyButton();

  const terminaErrorPage = new TerminalPageObject(t);
  await terminaErrorPage.waitForErrorBox();
  await t.expect(terminaErrorPage.getErrorMessages().isError()).eql(true);
  await t.expect(terminaErrorPage.getErrorMessages().getTextContent()).contains('We are unable to unlock your account at this time, please contact your administrator');
});

test.meta('gen2', false).requestHooks(legacyIdentifyLockedUserLandOnAppMock)('should show unlock account authenticator selection list before landing on App (legacy faked flow)', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);
  await identityPage.clickUnlockAccountLink();

  const selectFactorPage = new SelectFactorPageObject(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Unlock account?');
  await selectFactorPage.fillIdentifierField('username');
  await t.expect(selectFactorPage.getNextButton().exists).eql(true);
  await selectFactorPage.goToNextPage();  
  await t.expect(selectFactorPage.getFactorsCount()).eql(2);
  await selectFactorPage.selectFactorByIndex(0);

  const challengeEmailPageObject = new ChallengeEmailPageObject(t);
  await t.expect(challengeEmailPageObject.getFormTitle()).eql('Verify with your email');
  await challengeEmailPageObject.clickEnterCodeLink();
  await challengeEmailPageObject.verifyFactor('credentials.passcode', '12345');
  await challengeEmailPageObject.clickVerifyButton();

  const successPage = new TerminalPageObject(t);
  await t.expect(successPage.getFormTitle()).eql('Verify with your password');
  await t.expect(successPage.getSuccessMessage()).contains('Account successfully unlocked! Verify your account with a security method to continue.');
  const gobackLinkExists = await successPage.goBackLinkExistsV2();
  await t.expect(gobackLinkExists).eql(false);
  const signoutLinkExists = await successPage.signoutLinkExists();
  await t.expect(signoutLinkExists).eql(true);
});

test.requestHooks(identifyLockedUserLandOnAppMock)('should show unlock account authenticator selection list before landing on App', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);
  await identityPage.clickUnlockAccountLink();

  const selectFactorPage = new SelectFactorPageObject(t);
  await t.expect(selectFactorPage.getFormTitle()).contains('Unlock account');
  await selectFactorPage.fillIdentifierField('username');
  await t.expect(selectFactorPage.getNextButton().exists).eql(true);
  await selectFactorPage.goToNextPage();  
  await t.expect(selectFactorPage.getFactorsCount()).eql(2);
  await selectFactorPage.selectFactorByIndex(0);

  const challengeEmailPageObject = new ChallengeEmailPageObject(t);
  await t.expect(challengeEmailPageObject.getFormTitle()).eql('Verify with your email');
  await challengeEmailPageObject.clickEnterCodeLink();
  await challengeEmailPageObject.verifyFactor('credentials.passcode', '12345');
  await challengeEmailPageObject.clickVerifyButton();

  const successPage = new TerminalPageObject(t);
  await t.expect(successPage.getFormTitle()).eql('Verify with your password');
  await t.expect(successPage.getSuccessMessage()).contains('Account successfully unlocked! Verify your account with a security method to continue.');
  const gobackLinkExists = await successPage.goBackLinkExistsV2();
  await t.expect(gobackLinkExists).eql(false);
  const signoutLinkExists = await successPage.signoutLinkExists();
  await t.expect(signoutLinkExists).eql(true);
});

test.requestHooks(signInDeviceMock)('should render custom unlock account link on sign-in device page', async t => {
  const signInDevicePage = await setupSignInDevice(t, {
    'helpLinks': {
      'unlock': 'https://okta.okta.com/unlock',
    }
  });
  await checkA11y(t);
  await t.expect(signInDevicePage.unlockAccountLinkExists()).eql(true);
  await t.expect(await signInDevicePage.getCustomUnlockAccountLinkUrl()).eql('https://okta.okta.com/unlock');
});

test.requestHooks(identifyMock)('should not show unlock account link if feature is not available', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);
  await t.expect(identityPage.unlockAccountLinkExists()).eql(false);
});

