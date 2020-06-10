import { RequestMock } from 'testcafe';
import EnrollAuthenticatorPhoneObject from '../framework/page-objects/EnrollAuthenticatorPhoneObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import xhrAuthenticatorEnrollPhone from '../../../playground/mocks/data/idp/idx/authenticator-enroll-phone';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollPhone)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrSuccess);

fixture(`Factor Enroll Phone`)
  .requestHooks(mock);

async function setup(t) {
  const enrollPhonePage = new EnrollAuthenticatorPhoneObject(t);
  await enrollPhonePage.navigateToPage();
  return enrollPhonePage;
}

test(`default sms mode`, async t => {
  const enrollPhonePage = await setup(t);

  // Check title
  await t.expect(enrollPhonePage.getFormTitle()).eql('Set up phone authentication');
  await t.expect(enrollPhonePage.getFormSubtitle())
    .eql('Set up verification with a phone number. You will receive a code sent to your phone');
  await t.expect(enrollPhonePage.getSaveButtonLabel()).eql('Send a code via SMS');

  // Extension field is hidden
  await t.expect(enrollPhonePage.extensionIsHidden()).eql(true);
});

test(`voice mode click and extension will get shown`, async t => {
  const enrollPhonePage = await setup(t);

  // Switch to Voice
  await enrollPhonePage.clickRadio();
  await t.expect(enrollPhonePage.getSaveButtonLabel()).eql('Send a code via voice call');

  // Extension field is shown
  await t.expect(enrollPhonePage.extensionIsHidden()).eql(false);
  const extensionText = await enrollPhonePage.getElement('.phone-authenticator-enroll__phone-ext').innerText;
  await t.expect(extensionText.trim()).eql('Extension');

  // Default country code US
  const countryCodeText = await enrollPhonePage.getElement('.phone-authenticator-enroll__phone-code').innerText;
  await t.expect(countryCodeText.trim()).eql('+1');

  // Phone Number input field is rendered small
  await t.expect(enrollPhonePage.phoneNumberFieldIsSmall()).eql(true);
});

test(`phone number is required`, async t => {
  const enrollPhonePage = await setup(t);
  // fields are required
  await t.expect(enrollPhonePage.hasPhoneNumberError()).eql(false);
  await enrollPhonePage.clickSaveButton();
  await enrollPhonePage.waitForError();
  await t.expect(enrollPhonePage.hasPhoneNumberError()).eql(true);
});

test(`should succeed when values are filled in sms mode`, async t => {
  const enrollPhonePage = await setup(t);
  const successPage = new SuccessPageObject(t);

  await enrollPhonePage.fillPhoneNumber('4156669999');
  await enrollPhonePage.clickSaveButton();

  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

test(`should succeed when values are filled in voice mode`, async t => {
  const enrollPhonePage = await setup(t);
  const successPage = new SuccessPageObject(t);
  await enrollPhonePage.clickRadio();
  await enrollPhonePage.fillPhoneNumber('4156669999');
  await enrollPhonePage.clickSaveButton();

  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});
