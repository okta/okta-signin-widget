import { RequestMock, RequestLogger } from 'testcafe';

import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import EnrollSecurityQuestionPageObject from '../framework/page-objects/EnrollSecurityQuestionPageObject';

import xhrAuthenticatorEnrollSecurityQuestion from '../../../playground/mocks/data/idp/idx/authenticator-enroll-security-question';
import success from '../../../playground/mocks/data/idp/idx/success';

const authenticatorRequiredSecurityQuestionMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollSecurityQuestion)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success);

const answerRequestLogger = RequestLogger(
  /idx\/challenge\/answer/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

fixture(`Enroll Security Question Form`);

async function setup(t) {
  const challengeFactorPage = new EnrollSecurityQuestionPageObject(t);
  await challengeFactorPage.navigateToPage();
  return challengeFactorPage;
}

test.requestHooks(answerRequestLogger, authenticatorRequiredSecurityQuestionMock)(`enroll security question`, async t => {
  const challengeFactorPageObject = await setup(t);

  const radioOptionLabel = await challengeFactorPageObject.clickChooseSecurityQuestion();
  // select 'Choose a security question' option
  await t.expect(radioOptionLabel).eql('Choose a security question');
  // assert Custom Question textbox doesn't show up
  await t.expect(challengeFactorPageObject.isCreateMyOwnSecurityQuestionTextBoxVisible()).notOk();
  // no signout link at enroll page
  await t.expect(await challengeFactorPageObject.signoutLinkExists()).notOk();

  // select security question and type answer
  await challengeFactorPageObject.selectSecurityQuestion(1);
  await challengeFactorPageObject.setAnswerValue('test answer');
  await challengeFactorPageObject.clickVerifyButton();

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

test.requestHooks(answerRequestLogger, authenticatorRequiredSecurityQuestionMock)(`enroll custom security question`, async t => {
  const challengeFactorPageObject = await setup(t);

  const radioOptionLabel = await challengeFactorPageObject.clickCreateYouOwnQuestion();
  await t.expect(radioOptionLabel).eql('Create my own security question');
  await t.expect(challengeFactorPageObject.isSecurityQuestionDropdownVisible()).notOk();
  await challengeFactorPageObject.setMyOwnSecurityQuestion('what is the hottest day in SF?');
  await challengeFactorPageObject.setAnswerValue('my foo answer');
  await challengeFactorPageObject.clickVerifyButton();

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
