import { RequestMock, RequestLogger } from 'testcafe';

import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import ChallengeSecurityQuestionPageObject from '../framework/page-objects/ChallengeSecurityQuestionPageObject';
import { a11yCheck, checkConsoleMessages } from '../framework/shared';

import xhrAuthenticatorVerifySecurityQuestion from '../../../playground/mocks/data/idp/idx/authenticator-verification-security-question';
import success from '../../../playground/mocks/data/idp/idx/success';

const authenticatorRequiredSecurityQuestionMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorVerifySecurityQuestion)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success);

const answerRequestLogger = RequestLogger(
  /idx\/challenge\/answer/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

fixture('Challenge Security Question Form');

async function setup(t) {
  const challengeFactorPage = new ChallengeSecurityQuestionPageObject(t);
  await challengeFactorPage.navigateToPage();

  await checkConsoleMessages({
    controller: 'mfa-verify-question',
    formName: 'challenge-authenticator',
    authenticatorKey: 'security_question',
  });

  await a11yCheck(t);

  return challengeFactorPage;
}

test.requestHooks(answerRequestLogger, authenticatorRequiredSecurityQuestionMock)('verify security question', async t => {
  const challengeFactorPageObject = await setup(t);

  await t.expect(await challengeFactorPageObject.getAnswerLabel()).eql('Where did you go for your favorite vacation?');

  // Verify links
  await t.expect(await challengeFactorPageObject.switchAuthenticatorLinkExists()).ok();
  await t.expect(challengeFactorPageObject.getSwitchAuthenticatorLinkText()).eql('Verify with something else');
  await t.expect(await challengeFactorPageObject.signoutLinkExists()).ok();
  await t.expect(challengeFactorPageObject.getSignoutLinkText()).eql('Back to sign in');

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
      questionKey: 'favorite_vacation_location',
      answer: 'test answer',
    },
    stateHandle: 'eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvdnhhU2NRWG9TbzJvMjAwZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..BzXIPn5dlBQ4QOXC.rERhFXlDsEIL7712M4I4JI9JjKaQ0MLUY-8gXipZJ_g6BR5tK5PlRhN-jYGFm6v83o-wY3SmkLiMNo_stFSi4bCgmYGBslfqd9ZzH7Jq3Ouh94BrXD02PDNe2eWK5dDr6nhwITcQUDgqIH7RYs_0us1vpaZSrdTMmfSeiptpYrRl4KQAv5BV5aA5CRtLQa-LpKdtq0hm0NBlrY2-OU-d82QwAKEytlyKlxIvofBiuK6b1TgW0U9l1FG0LYLtWcist2O3jT-1eQo74R0IaxiYWnko95xaPx7VkRIjqBTuZgaVPKrHcob0TKTKQftPN3tFu9Ex44Ym-v6bjrzHBC0CnIr9AYBmbCrFGBT9G9LXGbE0mTSktO25pvoxb8iv4tlT7NRbaWWgaEHfLyN-aCDIADFsbBiUSoUtDtNGLKUWUNjU8h27ZYo5d68mhz9h04rWJSGIUuEu4Stea6zTmizYZKaPVVNKmoV3BAnHnf0naSAsviifMOUicx6BFnJTpXPcNmkZ5O0mqU-qdL4E80qYTcFwCAKHX1U4m-98odNMYs61hsVgoBUzpYSHWXQEIycsbErepqOKtovmEDXIQ6Sipb3n6kRpGjHoWHUdljESOUbQ_Dbn5smn2QaLlAIKaJzIPT65z2BVdA4Y0v9QUDwfuwu9Kb4CGWkLeBmFSu91zLx2cYnItEPXDENWJPI4VNfImbWlG62zAA0EFyDXo99G6D9ZgVuem9lXN4LtzIQt1BFKyH8SRYntk3bvT3es1l8XKdnxyIAEbYbODNu2nJiMRYoKM5lZVQ86ffhKP2g8PmwFIruVWWLhNY1r_sshuv5ONDpY9B6k3zRpg7iBQKJ9dSlHz1t9KQIpF-ezgTWuyaFyXHP5ezOGqF8RIj0R5Vc9dqDaR-Gbd2_gD2fx2v_LBxYntUDqzQLG3lPIvJlPVI9RzrdaRiABPTWEhf33xurBpbGXmpP2-t9Qckdc8TiIt7zS2vVUF3Sm_K-rlykotv07xUMnPkTz-yu0TyLUCzUojQ3xoaLIPQBRtKj7KK5r_il5atIHiabm-grb3S2s7bNEWpgDTmAxPOVKufQStpBXL8kghehLUHZ75ovoXeJqaQSDgncBk8GoP7XAgIBZuPjgYF30orMH14ttldEKFaO2gwGQQM8nnrKVwHbpyd32bwEyNyzIH-tnmVoXvU49nnzQNPlfS9S_-WeFI3OivdGbNFiITj-nKWPYiJWeXTfr4AYwDaEOGv0baV_zi3MMdptnT6I5TPjQEik5N5vDC8OJIhMsj9p9-7Gso13SNwr3i1ib0loQdnY7g6IuMuamlbZr-hhJESiOFKvSsVPqxnM3GXy5fichm7a188ihS8-SxTOznosdm3ftUOC1g7D4MzoRJbgA2E2PQCeyhxGYmdAaLRi3zt9iqcQYPvkEdiqHdKqTKArN-9JpsDuM7UM5lMkmmEgmi04PSVCqbAdw0z2cH3wU9705EyA0FA654wo-NaHhRrmup1LAFDPZg6NUW3X_C3jd6RkmPsjgVVm-H5YD9JsMqClcbzLEGz6SYtWyPDpPu0JH0GqOk-HHX8jfFZaRVM0ZnL0_BtU5G3B3OEyxMbl_yOQTdwMCT9Ete3Y1yAEUoJMyOwetCQRUdAH3DPHH3-4KAmJMaVMsMAI_h7DUwAvbUgiUKdr3g3an3vOxPtZI2apy9sv_Wj3DTJfwPm9axjK-laVNUKFnrweURmn4mRa74pWNf-CS1s9Izgg2yxY7fib9DlK6pkgC9nBGrpocMTJWFJI.N3s3-GTo9GSC0YG-MSmMfw',
  });
  await t.expect(req.method).eql('post');
  await t.expect(req.url).eql('http://localhost:3000/idp/idx/challenge/answer');
});
