import { RequestMock } from 'testcafe';
import EnrollAuthenticatorPhoneObject from '../framework/page-objects/EnrollAuthenticatorPhoneObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import xhrAuthenticatorEnrollPhoneVoice from '../../../playground/mocks/data/idp/idx/authenticator-enroll-phone-voice';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollPhoneVoice)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrSuccess);

fixture(`Factor Enroll Phone Voice`)
  .requestHooks(mock);

async function setup(t) {
  const enrollPhonePage = new EnrollAuthenticatorPhoneObject(t);
  await enrollPhonePage.navigateToPage();
  return enrollPhonePage;
}

test(`default voice mode`, async t => {
  const enrollPhonePage = await setup(t);

  // Check title
  await t.expect(enrollPhonePage.getFormTitle()).eql('Set up phone authentication');
  await t.expect(enrollPhonePage.getFormSubtitle())
    .eql('Set up verification with a phone number. You will receive a code sent to your phone');
  await t.expect(enrollPhonePage.getSaveButtonLabel()).eql('Send a code via voice call');

  // Extension field is not hidden
  await t.expect(enrollPhonePage.extensionIsHidden()).eql(false);
  // Phone field is rendered small
  await t.expect(enrollPhonePage.phoneNumberFieldIsSmall()).eql(true);
});

test(`should succeed when values are filled in voice mode`, async t => {
  const enrollPhonePage = await setup(t);
  const successPage = new SuccessPageObject(t);
  await enrollPhonePage.fillPhoneNumber('4156669999');
  await enrollPhonePage.clickSaveButton();

  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});