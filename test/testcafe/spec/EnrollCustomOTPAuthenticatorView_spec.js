import { RequestMock } from 'testcafe';
import xhrSelectAuthenticatorEnroll from '../../../playground/mocks/data/idp/idx/authenticator-enroll-select-authenticator';
import xhrAuthenticatorEnrollCustomOTP from '../../../playground/mocks/data/idp/idx/error-authenticator-enroll-custom-otp';
import SelectAuthenticatorPageObject from '../framework/page-objects/SelectAuthenticatorPageObject';

const mockEnrollAuthenticatorCustomOTP = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticatorEnroll)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond((req, res) => {
    res.statusCode = '403';
    res.setBody(xhrAuthenticatorEnrollCustomOTP);
  });

fixture('Enroll Authenticator Custom OTP');

async function setup(t) {
  const selectAuthenticatorPageObject = new SelectAuthenticatorPageObject(t);
  await selectAuthenticatorPageObject.navigateToPage();
  return selectAuthenticatorPageObject;
}

test.requestHooks(mockEnrollAuthenticatorCustomOTP)('enroll custom OTP authenticator shows error on select authenticator enroll page', async t => {
  const selectAuthenticatorEnrollPage = await setup(t);
  await selectAuthenticatorEnrollPage.clickCustomOTP();
  const error = await selectAuthenticatorEnrollPage.getErrorFromErrorBox();
  await t.expect(error).contains('Contact your administrator to continue enrollment.');
});


