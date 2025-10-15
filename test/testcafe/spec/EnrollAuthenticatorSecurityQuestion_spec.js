import { RequestMock, RequestLogger } from 'testcafe';
import { checkA11y } from '../framework/a11y';

import { oktaDashboardContent } from '../framework/shared';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import EnrollSecurityQuestionPageObject from '../framework/page-objects/EnrollSecurityQuestionPageObject';
import { checkConsoleMessages } from '../framework/shared';

import xhrAuthenticatorEnrollSecurityQuestion from '../../../playground/mocks/data/idp/idx/authenticator-enroll-security-question';
import xhrErrorAuthenticatorEnrollSecurityQuestion from '../../../playground/mocks/data/idp/idx/error-authenticator-enroll-security-question.json';
import xhrErrorAuthenticatorEnrollSecurityQuestionCreateQuestion from '../../../playground/mocks/data/idp/idx/error-authenticator-enroll-security-question-create-question.json';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';

const authenticatorEnrollSecurityQuestionMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollSecurityQuestion)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const authenticatorEnrollSecurityQuestionErrorMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollSecurityQuestion)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrErrorAuthenticatorEnrollSecurityQuestion, 403);

const authenticatorEnrollSecurityQuestionCreateQuestionErrorMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollSecurityQuestion)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrErrorAuthenticatorEnrollSecurityQuestionCreateQuestion, 403);

const answerRequestLogger = RequestLogger(
  /idx\/challenge\/answer/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

fixture('Enroll Security Question Form');

async function setup(t) {
  const enrollSecurityQuestionPage = new EnrollSecurityQuestionPageObject(t);
  await enrollSecurityQuestionPage.navigateToPage();
  await t.expect(enrollSecurityQuestionPage.formExists()).eql(true);

  await checkConsoleMessages({
    controller: 'enroll-question',
    formName: 'enroll-authenticator',
    authenticatorKey: 'security_question',
  });

  return enrollSecurityQuestionPage;
}

test.requestHooks(answerRequestLogger, authenticatorEnrollSecurityQuestionMock)('enroll security question', async t => {
  const enrollSecurityQuestionPage = await setup(t);
  await checkA11y(t);

  const radioOptionLabel = await enrollSecurityQuestionPage.clickChooseSecurityQuestion();
  // select 'Choose a security question' option
  await t.expect(radioOptionLabel).eql('Choose a security question');
  // assert Custom Question textbox doesn't show up
  await t.expect(enrollSecurityQuestionPage.isCreateMyOwnSecurityQuestionTextBoxVisible()).notOk();
  // signout link at enroll page
  await t.expect(await enrollSecurityQuestionPage.signoutLinkExists()).ok();
  // assert switch authenticator link shows up
  await t.expect(await enrollSecurityQuestionPage.returnToAuthenticatorListLinkExists()).ok();
  await t.expect(enrollSecurityQuestionPage.getSwitchAuthenticatorLinkText()).eql('Return to authenticator list');

  // select security question and type answer
  await enrollSecurityQuestionPage.selectSecurityQuestion(1);
  await enrollSecurityQuestionPage.setAnswerValue('test answer');
  await enrollSecurityQuestionPage.clickVerifyButton();

  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');

  await t.expect(answerRequestLogger.count(() => true)).eql(1);
  const req = answerRequestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody).eql({
    credentials: {
      questionKey: 'name_of_first_plush_toy',
      answer: 'test answer',
    },
    stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82',
  });
  await t.expect(req.method).eql('post');
  await t.expect(req.url).eql('http://localhost:3000/idp/idx/challenge/answer');
});

test
  .meta('gen3', false) // Gen3 uses controlled select component which doesn't have such bug
  .requestHooks(answerRequestLogger, authenticatorEnrollSecurityQuestionMock)('should hide security question dropdown after changing page', async t => {
    const enrollSecurityQuestionPage = await setup(t);
    await checkA11y(t);

    await enrollSecurityQuestionPage.clickChooseSecurityQuestion();
    await t.expect(await enrollSecurityQuestionPage.returnToAuthenticatorListLinkExists()).ok();
    await t.expect(enrollSecurityQuestionPage.getSwitchAuthenticatorLinkText()).eql('Return to authenticator list');

    await enrollSecurityQuestionPage.openSecurityQuestionDropdown();
    await enrollSecurityQuestionPage.clickReturnToAuthenticatorListLink();
    await t.expect(enrollSecurityQuestionPage.isSecurityQuestionDropdownVisible()).notOk();
  });

test.requestHooks(answerRequestLogger, authenticatorEnrollSecurityQuestionMock)('enroll custom security question', async t => {
  const enrollSecurityQuestionPage = await setup(t);
  await checkA11y(t);

  const radioOptionLabel = await enrollSecurityQuestionPage.clickCreateYouOwnQuestion();
  await t.expect(radioOptionLabel).eql('Create my own security question');
  await t.expect(enrollSecurityQuestionPage.isSecurityQuestionDropdownVisible()).notOk();
  await enrollSecurityQuestionPage.setMyOwnSecurityQuestion('what is the hottest day in SF?');
  await enrollSecurityQuestionPage.setAnswerValue('my foo answer');
  await enrollSecurityQuestionPage.clickVerifyButton();

  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');

  await t.expect(answerRequestLogger.count(() => true)).eql(1);
  const req = answerRequestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody).eql({
    credentials: {
      questionKey: 'custom',
      question: 'what is the hottest day in SF?',
      answer: 'my foo answer',
    },
    stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82',
  });
  await t.expect(req.method).eql('post');
  await t.expect(req.url).eql('http://localhost:3000/idp/idx/challenge/answer');
});

test.requestHooks(answerRequestLogger, authenticatorEnrollSecurityQuestionErrorMock)('enroll security question error', async t => {
  const enrollSecurityQuestionPage = await setup(t);
  await checkA11y(t);

  const radioOptionLabel = await enrollSecurityQuestionPage.clickChooseSecurityQuestion();
  // select 'Choose a security question' option
  await t.expect(radioOptionLabel).eql('Choose a security question');

  // select security question and type answer
  await enrollSecurityQuestionPage.selectSecurityQuestion(1);
  await enrollSecurityQuestionPage.setAnswerValue('te');
  await enrollSecurityQuestionPage.clickVerifyButton();

  await t.expect(enrollSecurityQuestionPage.getAnswerInlineError()).match(/The security question answer must be at least 4 characters in length/);

  // assert that request has been made
  await t.expect(answerRequestLogger.count(() => true)).eql(1);
  const req = answerRequestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody).eql({
    credentials: {
      questionKey: 'name_of_first_plush_toy',
      answer: 'te',
    },
    stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82',
  });
  await t.expect(req.method).eql('post');
  await t.expect(req.url).eql('http://localhost:3000/idp/idx/challenge/answer');

  await checkConsoleMessages([
    'ready',
    'afterRender',
    {
      controller: 'enroll-question',
      formName: 'enroll-authenticator',
      authenticatorKey: 'security_question',
    },
    'afterError',
    {
      controller: 'enroll-question',
      formName: 'enroll-authenticator',
      authenticatorKey: 'security_question',
    },
    {
      errorSummary: '',
      xhr: {
        responseJSON: {
          errorSummary: '',
          errorCauses: [
            {
              errorKey: [
                'securityQuestion.answer.tooShort.arg'
              ],
              errorSummary: [
                'The security question answer must be at least 4 characters in length'
              ],
              property: 'credentials.answer'
            }
          ],
          errorSummaryKeys: [],
          errorIntent: 'LOGIN',
        },
      },
    },
  ]);
});

test.requestHooks(answerRequestLogger, authenticatorEnrollSecurityQuestionCreateQuestionErrorMock)('enroll custom security question error', async t => {
  const enrollSecurityQuestionPage = await setup(t);
  await checkA11y(t);

  const radioOptionLabel = await enrollSecurityQuestionPage.clickCreateYouOwnQuestion();
  await t.expect(radioOptionLabel).eql('Create my own security question');
  await t.expect(enrollSecurityQuestionPage.isSecurityQuestionDropdownVisible()).notOk();
  await enrollSecurityQuestionPage.setMyOwnSecurityQuestion('what is the hottest day in SF?');
  await enrollSecurityQuestionPage.setAnswerValue('my');
  await enrollSecurityQuestionPage.clickVerifyButton();

  await t.expect(enrollSecurityQuestionPage.getAnswerInlineError()).match(/The security question answer must be at least 4 characters in length/);

  await t.expect(answerRequestLogger.count(() => true)).eql(1);
  const req = answerRequestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody).eql({
    credentials: {
      questionKey: 'custom',
      question: 'what is the hottest day in SF?',
      answer: 'my',
    },
    stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82',
  });
  await t.expect(req.method).eql('post');
  await t.expect(req.url).eql('http://localhost:3000/idp/idx/challenge/answer');
});
