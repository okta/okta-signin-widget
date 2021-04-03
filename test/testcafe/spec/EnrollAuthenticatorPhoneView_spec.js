import { RequestMock, RequestLogger } from 'testcafe';
import EnrollPhonePageObject from '../framework/page-objects/EnrollPhonePageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import { checkConsoleMessages } from '../framework/shared';
import xhrAuthenticatorEnrollPhone from '../../../playground/mocks/data/idp/idx/authenticator-enroll-phone';
import xhrAuthenticatorEnrollPhoneVoice from '../../../playground/mocks/data/idp/idx/authenticator-enroll-phone-voice';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';
import invalidCode from '../../../playground/mocks/data/idp/idx/error-email-verify';

const smsMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollPhone)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/resend')
  .respond(xhrAuthenticatorEnrollPhone)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess);

const voiceMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollPhoneVoice)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/resend')
  .respond(xhrAuthenticatorEnrollPhoneVoice)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess);

const invalidCodeMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollPhone)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(invalidCode, 403);

const logger = RequestLogger(/challenge|challenge\/resend|challenge\/answer/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

fixture('Authenticator Enroll Phone');

async function setup(t) {
  const enrollPhonePage = new EnrollPhonePageObject(t);
  await enrollPhonePage.navigateToPage();
  return enrollPhonePage;
}

test
  .requestHooks(smsMock)('SMS mode - has the right labels', async t => {
    const enrollPhonePageObject = await setup(t);

    await checkConsoleMessages({
      controller: 'enroll-sms',
      formName: 'enroll-authenticator',
      authenticatorKey: 'phone_number',
      methodType: 'sms',
    });

    const pageTitle = enrollPhonePageObject.getFormTitle();
    const pageSubtitle = enrollPhonePageObject.getFormSubtitle();
    await t.expect(pageTitle).contains('Set up phone authentication');
    await t.expect(pageSubtitle).contains('A code was sent to');
    await t.expect(pageSubtitle).contains('your phone');
    await t.expect(pageSubtitle).contains('Enter the code below to verify.');

    await t.expect(await enrollPhonePageObject.signoutLinkExists()).ok();
  });

test
  .requestHooks(voiceMock)('Voice mode - has the right labels', async t => {
    const enrollPhonePageObject = await setup(t);

    await checkConsoleMessages({
      controller: 'enroll-call',
      formName: 'enroll-authenticator',
      authenticatorKey: 'phone_number',
      methodType: 'voice',
    });

    const pageTitle = enrollPhonePageObject.getFormTitle();
    const pageSubtitle = enrollPhonePageObject.getFormSubtitle();
    await t.expect(pageTitle).contains('Set up phone authentication');
    await t.expect(pageSubtitle).contains('Calling');
    await t.expect(pageSubtitle).contains('your phone');
    await t.expect(pageSubtitle).contains('Enter the code below to verify.');

    await t.expect(await enrollPhonePageObject.signoutLinkExists()).ok();
  });

test
  .requestHooks(logger, smsMock)('SMS flow', async t => {
    const enrollPhonePageObject = await setup(t);
    await enrollPhonePageObject.clickNextButton();

    await enrollPhonePageObject.verifyFactor('credentials.passcode', '1234');
    await enrollPhonePageObject.clickNextButton();

    const successPage = new SuccessPageObject(t);
    const pageUrl = await successPage.getPageUrl();
    await t.expect(pageUrl).eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
    await t.expect(logger.count(() => true)).eql(1);

    const [ codeRequest ] = logger.requests;
    const codeRequestBody = JSON.parse(codeRequest.request.body);
    await t.expect(codeRequestBody).eql({
      credentials: { passcode: '1234' },
      stateHandle: 'eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvMTlubUtEZFVmdFR3d2MwZzQiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..7iJKcaUK4F3II_Hk.uCorA7x6QGy7cErZZfETAg5DVXgVtZ1SABqjPurfVpVpahblVhWOsAlsYZYPznj3vYBa1EpHgFIUiVYwm3NAO4wSY6wcsWxEd54E_pZ86MzM2y3PQEMbesvk5t60Muxg4PDlSaFe0wd_ObT_9344fT0Fdbg1FISdLbXDqwuHCXEh13_1U34vwhlgKzmlQnmxDbEqNpYzircDxvptTF35eBeN13s7zRTj3wnTS3gQ6e67cy7ytvVMExqIfsGaAyaauLHsSWkdJBQEWYhTy9sofT3Eue4FrfAFSZdyPNdbSLUbwpPxlhK-JoN0d4WTr98em_0WRHKc_TB7C59UYdzWieuknlMm-CjpEVI1I-FsRLrcHS6HrA-2--UbDhxZLWxk1o3m8M_9YwzUv4BypXcNg2X-Mtfs_pq7mgHm9dtukaVd57UT60_VbGlGOH_Jn6GJh8J0Cc2bVa8XSZPRZxiwKuY56HbB_33jxIwcQG6ty7bu2id42618euDbQ6PBo-cqVRT7NvUPo-0tcZAw5WhvpdyJIvC1rm6EPxh1YuGFP8n3uT1ix6gRliuIWMhGrJdGSfw6PBQZaFoUyIWm-J7BZaonJeKBkbmhGHi-WrWGNyHI1JI1P7XOmntY-gV7o5jhSQObLQZfApHjdIoXIYcTaPe6FfVjiyn-DG4Wr6BsK-O7nkyE5hXOZqRVXiOuOnHevJL76RUUOFC1ewSHzB2Oln0jSrEkaXDCkIXnzHS8KfhdqRetWN_O3Nbspne87h3VYA1Zod_xpBtcLW2R7WXpkoBQzUKfo3jeCulob66US1gJYwScpoQxFEf44cTBLmSQsP8Vjli05d29p5H9v2QMsTxqO5bZPpQIBBamduGg-wqUZDOLDLRUwun6LaFUPULZaAyViOftaiLP14kUApPz8DavytQqwor8UVaGm761vs5w7TnGSAdhFJeq19SAZfwX4YQ-Wc2kFhjfUUKJxZnJ0Qq8Sj1R1jADdmGEAuuMYo_lBgu5DsyhSzSQQpXDHnt_aNf-6m9s89C9fsSy-S53HH-wIqjDPD40Fmll2_MZ0QxVGEZs9l4RlAJmWgl4w2LElfzQ_m6UGU2n96lJ7MHDfw-7pHzsvyUZTDXz23E0Ak07S_Fh2myycXnfmVAUhkR-V-nNzrdq2XEUeJmUiG-TosWoRKD1SLoBd_uzLbeqofzXdshMBFD0gJ_9g7ZbB_S-3BWXrZtkwTaaNuBzljNR3rKvIcYbn6-M5Ki3ubIRZPem7t3O7Y1MxobKX98fk7kem8dQyc0f7OeMyOPgB667BvRzIyZUPq8IHBhMlVsvGlTw3xs2z9ROwi0f37k1et3-lrY7FuvePioHNouZhzrNY_iif_znKQcps7r2VmIznmgAvnE2X8gzDFUtx7AbJfJm6juQi276Hd97PS6nC4oIUB-Of8uqhzs3Jqday52ZUITuNyAR4jQWb3TANYAez2WOx0f9cgjSE6wxo17J7L9JIS52b6D6m8huq6Gxb_tRwGr1ewIWhLcB2zKjTOy54pZm8ZjQdJU3vIpQdTiSUd11SI_PCsEgMWL_KZDcn05GkrDC786ADGZd7NlETefjcy-0ulUkiWuXYIaLYUXD_ypNbPUNr-Oqs8wa8UvSFJsm-Y1b4n7kY5w5MZbns-doxWUyai44Sh6GdKRDtLQlgMFZHwiRKZA94COFsZ0KzqpaiDutwirgT59cu0JcOliFse5pjQtTlo9rOhcGClK9YJgoRp-mcUM7aCAXliSXcrvcHLrtW947lDxiHCvWWqmDKKtI1VLtw3_lK33x01ky8NjnbxvO2KNheVMgmFB0lwKWQsxkM1AL0V4pk4x2KPDhD2Vd.h1OCkg8gSKMvb3zAKGVm4Q'
    });
    await t.expect(codeRequest.request.method).eql('post');
    await t.expect(codeRequest.request.url).eql('http://localhost:3000/idp/idx/challenge/answer');
  });

test
  .requestHooks(logger, voiceMock)('Voice flow', async t => {
    const enrollPhonePageObject = await setup(t);
    await enrollPhonePageObject.clickNextButton();

    await enrollPhonePageObject.verifyFactor('credentials.passcode', '1234');
    await enrollPhonePageObject.clickNextButton();

    const successPage = new SuccessPageObject(t);
    const pageUrl = await successPage.getPageUrl();
    await t.expect(pageUrl).eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
    await t.expect(logger.count(() => true)).eql(1);

    const [ codeRequest ] = logger.requests;
    const codeRequestBody = JSON.parse(codeRequest.request.body);
    await t.expect(codeRequestBody).eql({
      credentials: { passcode: '1234' },
      stateHandle: 'eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvMTlubUtEZFVmdFR3d2MwZzQiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..7iJKcaUK4F3II_Hk.uCorA7x6QGy7cErZZfETAg5DVXgVtZ1SABqjPurfVpVpahblVhWOsAlsYZYPznj3vYBa1EpHgFIUiVYwm3NAO4wSY6wcsWxEd54E_pZ86MzM2y3PQEMbesvk5t60Muxg4PDlSaFe0wd_ObT_9344fT0Fdbg1FISdLbXDqwuHCXEh13_1U34vwhlgKzmlQnmxDbEqNpYzircDxvptTF35eBeN13s7zRTj3wnTS3gQ6e67cy7ytvVMExqIfsGaAyaauLHsSWkdJBQEWYhTy9sofT3Eue4FrfAFSZdyPNdbSLUbwpPxlhK-JoN0d4WTr98em_0WRHKc_TB7C59UYdzWieuknlMm-CjpEVI1I-FsRLrcHS6HrA-2--UbDhxZLWxk1o3m8M_9YwzUv4BypXcNg2X-Mtfs_pq7mgHm9dtukaVd57UT60_VbGlGOH_Jn6GJh8J0Cc2bVa8XSZPRZxiwKuY56HbB_33jxIwcQG6ty7bu2id42618euDbQ6PBo-cqVRT7NvUPo-0tcZAw5WhvpdyJIvC1rm6EPxh1YuGFP8n3uT1ix6gRliuIWMhGrJdGSfw6PBQZaFoUyIWm-J7BZaonJeKBkbmhGHi-WrWGNyHI1JI1P7XOmntY-gV7o5jhSQObLQZfApHjdIoXIYcTaPe6FfVjiyn-DG4Wr6BsK-O7nkyE5hXOZqRVXiOuOnHevJL76RUUOFC1ewSHzB2Oln0jSrEkaXDCkIXnzHS8KfhdqRetWN_O3Nbspne87h3VYA1Zod_xpBtcLW2R7WXpkoBQzUKfo3jeCulob66US1gJYwScpoQxFEf44cTBLmSQsP8Vjli05d29p5H9v2QMsTxqO5bZPpQIBBamduGg-wqUZDOLDLRUwun6LaFUPULZaAyViOftaiLP14kUApPz8DavytQqwor8UVaGm761vs5w7TnGSAdhFJeq19SAZfwX4YQ-Wc2kFhjfUUKJxZnJ0Qq8Sj1R1jADdmGEAuuMYo_lBgu5DsyhSzSQQpXDHnt_aNf-6m9s89C9fsSy-S53HH-wIqjDPD40Fmll2_MZ0QxVGEZs9l4RlAJmWgl4w2LElfzQ_m6UGU2n96lJ7MHDfw-7pHzsvyUZTDXz23E0Ak07S_Fh2myycXnfmVAUhkR-V-nNzrdq2XEUeJmUiG-TosWoRKD1SLoBd_uzLbeqofzXdshMBFD0gJ_9g7ZbB_S-3BWXrZtkwTaaNuBzljNR3rKvIcYbn6-M5Ki3ubIRZPem7t3O7Y1MxobKX98fk7kem8dQyc0f7OeMyOPgB667BvRzIyZUPq8IHBhMlVsvGlTw3xs2z9ROwi0f37k1et3-lrY7FuvePioHNouZhzrNY_iif_znKQcps7r2VmIznmgAvnE2X8gzDFUtx7AbJfJm6juQi276Hd97PS6nC4oIUB-Of8uqhzs3Jqday52ZUITuNyAR4jQWb3TANYAez2WOx0f9cgjSE6wxo17J7L9JIS52b6D6m8huq6Gxb_tRwGr1ewIWhLcB2zKjTOy54pZm8ZjQdJU3vIpQdTiSUd11SI_PCsEgMWL_KZDcn05GkrDC786ADGZd7NlETefjcy-0ulUkiWuXYIaLYUXD_ypNbPUNr-Oqs8wa8UvSFJsm-Y1b4n7kY5w5MZbns-doxWUyai44Sh6GdKRDtLQlgMFZHwiRKZA94COFsZ0KzqpaiDutwirgT59cu0JcOliFse5pjQtTlo9rOhcGClK9YJgoRp-mcUM7aCAXliSXcrvcHLrtW947lDxiHCvWWqmDKKtI1VLtw3_lK33x01ky8NjnbxvO2KNheVMgmFB0lwKWQsxkM1AL0V4pk4x2KPDhD2Vd.h1OCkg8gSKMvb3zAKGVm4Q'
    });
    await t.expect(codeRequest.request.method).eql('post');
    await t.expect(codeRequest.request.url).eql('http://localhost:3000/idp/idx/challenge/answer');
  });

test
  .requestHooks(invalidCodeMock)('Entering invalid passcode results in an error', async t => {
    const challengePhonePageObject = await setup(t);
    await challengePhonePageObject.verifyFactor('credentials.passcode', 'abcd');
    await challengePhonePageObject.clickNextButton();
    await challengePhonePageObject.waitForErrorBox();
    await t.expect(challengePhonePageObject.getInvalidOTPError()).contains('Authentication failed');
  });

test
  .requestHooks(smsMock)('Callout appears after 30 seconds in sms mode', async t => {
    const challengePhonePageObject = await setup(t);
    await challengePhonePageObject.clickNextButton();
    await t.expect(challengePhonePageObject.resendEmailView().hasClass('hide')).ok();
    await t.wait(30500);
    await t.expect(challengePhonePageObject.resendEmailView().hasClass('hide')).notOk();
    const resendEmailView = challengePhonePageObject.resendEmailView();
    await t.expect(resendEmailView.innerText).eql('Haven\'t received an SMS? Send again');
  });

test
  .requestHooks(voiceMock)('Callout appears after 30 seconds in voice mode', async t => {
    const challengePhonePageObject = await setup(t);
    await challengePhonePageObject.clickNextButton();
    await t.expect(challengePhonePageObject.resendEmailView().hasClass('hide')).ok();
    await t.wait(30500);
    await t.expect(challengePhonePageObject.resendEmailView().hasClass('hide')).notOk();
    const resendEmailView = challengePhonePageObject.resendEmailView();
    await t.expect(resendEmailView.innerText).eql('Haven\'t received a call? Call again');
  });
