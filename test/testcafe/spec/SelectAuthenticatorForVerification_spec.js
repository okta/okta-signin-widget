import { RequestMock, RequestLogger } from 'testcafe';

import SelectFactorPageObject from '../framework/page-objects/SelectAuthenticatorPageObject';
import ChallengeFactorPageObject from '../framework/page-objects/ChallengeFactorPageObject';

import xhrSelectAuthenticators from '../../../playground/mocks/data/idp/idx/authenticator-verification-select-authenticator';
import xhrSelectAuthenticatorsOktaVerify from '../../../playground/mocks/data/idp/idx/authenticator-verification-select-authenticator-ov-m2';
import xhrSelectAuthenticatorsRecovery from '../../../playground/mocks/data/idp/idx/authenticator-verification-select-authenticator-for-recovery';
import xhrAuthenticatorRequiredPassword from '../../../playground/mocks/data/idp/idx/authenticator-verification-password';
import xhrAuthenticatorRequiredEmail from '../../../playground/mocks/data/idp/idx/authenticator-verification-email';
import xhrAuthenticatorRequiredWebauthn from '../../../playground/mocks/data/idp/idx/authenticator-verification-webauthn';
import xhrAuthenticatorOVTotp from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-totp';
import xhrAuthenticatorOVPush from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-push';
import xhrAuthenticatorOVFastPass from '../../../playground/mocks/data/idp/idx/identify-with-user-verification-loopback';

const requestLogger = RequestLogger(
  /idx\/introspect|\/challenge/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const mockChallengePassword = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticators)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrAuthenticatorRequiredPassword);

const mockChallengeEmail = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticators)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrAuthenticatorRequiredEmail);

const mockChallengeWebauthn = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticators)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrAuthenticatorRequiredWebauthn);

const mockSelectAuthenticatorForRecovery = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticatorsRecovery);

const mockChallengeOVTotp = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticatorsOktaVerify)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrAuthenticatorOVTotp);

const mockChallengeOVPush = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticatorsOktaVerify)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrAuthenticatorOVPush);

const mockChallengeOVFastPass = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticatorsOktaVerify)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrAuthenticatorOVFastPass);

fixture('Select Authenticator for verification Form');

async function setup(t) {
  const selectFactorPageObject = new SelectFactorPageObject(t);
  await selectFactorPageObject.navigateToPage();
  return selectFactorPageObject;
}

test.requestHooks(mockChallengePassword)('should load select authenticator list', async t => {
  const selectFactorPage = await setup(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with an authenticator');
  await t.expect(selectFactorPage.getFormSubtitle()).eql('Select from the following options');
  await t.expect(selectFactorPage.getFactorsCount()).eql(7);

  await t.expect(selectFactorPage.getFactorLabelByIndex(0)).eql('Okta Password');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(0)).eql(false);
  await t.expect(selectFactorPage.getFactorIconClassByIndex(0)).contains('mfa-okta-password');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(0)).eql('Select');

  await t.expect(selectFactorPage.getFactorLabelByIndex(1)).eql('Security Key or Biometric Authenticator');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(1)).eql(false);
  await t.expect(selectFactorPage.getFactorIconClassByIndex(1)).contains('mfa-webauthn');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(1)).eql('Select');

  await t.expect(selectFactorPage.getFactorLabelByIndex(2)).eql('Okta Email');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(2)).eql(false);
  await t.expect(selectFactorPage.getFactorIconClassByIndex(2)).contains('mfa-okta-email');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(2)).eql('Select');

  await t.expect(selectFactorPage.getFactorLabelByIndex(3)).eql('Phone');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(3)).eql(true);
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(3)).eql('+1 XXX-XXX-5309');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(3)).contains('mfa-okta-phone');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(3)).eql('Select');

  await t.expect(selectFactorPage.getFactorLabelByIndex(4)).eql('Phone');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(4)).eql(true);
  await t.expect(selectFactorPage.getFactorDescriptionByIndex(4)).eql('+1 XXX-XXX-5310');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(4)).contains('mfa-okta-phone');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(4)).eql('Select');

  await t.expect(selectFactorPage.getFactorLabelByIndex(5)).eql('Okta Security Question');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(5)).eql(false);
  await t.expect(selectFactorPage.getFactorIconClassByIndex(5)).contains('mfa-okta-security-question');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(5)).eql('Select');

  await t.expect(selectFactorPage.getFactorLabelByIndex(6)).eql('Okta Verify');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(6)).eql(false);
  await t.expect(selectFactorPage.getFactorIconClassByIndex(6)).contains('mfa-okta-verify');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(6)).eql('Select');

  // signout link at enroll page
  await t.expect(await selectFactorPage.signoutLinkExists()).ok();
  await t.expect(selectFactorPage.getSignoutLinkText()).eql('Sign Out');

});

test.requestHooks(mockSelectAuthenticatorForRecovery)('should load select authenticator list for recovery password', async t => {
  const selectFactorPage = await setup(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Reset your password');
  await t.expect(selectFactorPage.getFormSubtitle()).eql('Verify with one of the following authenticators to reset your password.');
  await t.expect(selectFactorPage.getFactorsCount()).eql(2);

  await t.expect(selectFactorPage.getFactorLabelByIndex(0)).eql('Security Key or Biometric Authenticator');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(0)).contains('mfa-webauthn');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(0)).eql('Select');

  await t.expect(selectFactorPage.getFactorLabelByIndex(1)).eql('Okta Email');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(1)).contains('mfa-okta-email');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(1)).eql('Select');

  // signout link at enroll page
  await t.expect(await selectFactorPage.signoutLinkExists()).ok();
  await t.expect(selectFactorPage.getSignoutLinkText()).eql('Sign Out');
});

test.requestHooks(mockChallengePassword)('should navigate to password challenge page', async t => {
  const selectFactorPage = await setup(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with an authenticator');

  selectFactorPage.selectFactorByIndex(0);
  const challengeFactorPage = new ChallengeFactorPageObject(t);
  await t.expect(challengeFactorPage.getPageTitle()).eql('Verify with your password');
});

test.requestHooks(requestLogger, mockChallengePassword)('select password challenge page and hit switch authenticator and re-select password', async t => {
  const selectFactorPage = await setup(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with an authenticator');

  selectFactorPage.selectFactorByIndex(0);
  const challengeFactorPage = new ChallengeFactorPageObject(t);
  await t.expect(challengeFactorPage.getPageTitle()).eql('Verify with your password');
  await challengeFactorPage.clickSwitchAuthenticatorButton();
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with an authenticator');
  // re-select password
  selectFactorPage.selectFactorByIndex(0);
  await t.expect(challengeFactorPage.getPageTitle()).eql('Verify with your password');

  await t.expect(requestLogger.count(() => true)).eql(3);
  const req1 = requestLogger.requests[0].request;
  await t.expect(req1.url).eql('http://localhost:3000/idp/idx/introspect');

  const req2 = requestLogger.requests[1].request;
  await t.expect(req2.url).eql('http://localhost:3000/idp/idx/challenge');
  await t.expect(req2.method).eql('post');
  await t.expect(req2.body).eql('{"authenticator":{"id":"aidwboITrg4b4yAYd0g3"},"stateHandle":"eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvdnhhU2NRWG9TbzJvMjAwZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..40AFMvA7ix6FA2oE.Q6jiZeKfCdON5wqqMdiDQCtgLctrIrpnQzKEwub6L5KvFWcgVpdEFcoOvT1WIq9EUVOg2m_vFLV7b-PVSoCBKhKzl0IujmkjC5XyTwnDBMmJt-2-BMez0kIkABNI1BpffStyt8uJiUqGifVrZ6AqXr6zCpkGK5f7-Mu_rVF8NS2P580n2_2p9MO9haf-z56-i3DfkX-xM1a3_AQXUGr_RzDXWPXZf6mPUhYtouJz7Qdpt6n9agvqasuSz8JLehX9TIN9Y4k_M7JKxaYfdOv9Bnp7zSEtVQeG2ADzbIMKBRXA1bP_TZ7EKHInCu4gz8JR3febZLz8EZq-kaknBB_S3AvkjtzkrUyfUNo31xZhoTWO2kiMJlo_zLRqMKW8xqPNYKjtYo9rXR_v4_wA3hOCKFyKkqCD8U1Y6bbVwoicDHOZ4fNZOtcAVB8BJ8HzpAYzF8bCKHCD9CLgIU8eCezTo_Fo90Zm138Hu0rJc0LCNlG26RFv7DZ89fJbFqobS_y8bbB-MC0wsBBxf1kx1lEFUCqZFNottzXtRnpYKqvurBj_IsV9YtO9T35WZanr2gfbl98R2YpRGMF4pfp3d_6ltntY8-a8VK9cUlkjzBNXH46O-MzOTeuWQ7XgcEqK_MNENs4JMGTixBUQeQjPaDvJ_djCigciq1qyf2peAZBDlR5lozoJbNNQtxnXTYBresTm5RvEQ7qWo5IQlNDnK9Ir5pQdgM1NTPYiVDEt4TFZ4ZjLgycdLSSOv6HSw9bS85avNswJBXwlYBDHML5NpfGL-6m8uoPmtRqCG1HTFgLdSo1iGkcPtO8zcymNlUpevIEhX8QAf0GTK66723e0Qmz8lLDcsVCBVmyvFAENJ2gnR48p4Dt96nH7KRnrXOXUYa1LxJZr_ZeT7K-5WXw5a-dESuxvg18M993Kw6yDwSHsZ-6UeppWg3PPo7dKRE1aX9fisQP1uRCJzk1CtWxPu2GcFs9UZpszLuv1Y8r9DDH7FSgzlyULzOXVcNaLzkm5-RH7jxeRTiOOZxhOBIUuVgUUnkm6x4K23-TYxf4HgV_vWrQmIdEjaP5NuYRPfLkdM8qAWCkuz5r48yjl6T5XRg1wKG7OX0JZLjbmcJsTNagXSHbPsXuBd0te_fgNYT54_eGkIIklr4LbOEhKGNpZSXSWPbTPT7zhbebrUGglldI37k8WldRGywq_ZvZX6W5hucD_yWBqqXBq45LW_iNlAvtUIXBkq4WuPgWaYRIjqWnUxbAZkL_5ejddr18MOmbwV8ftbtYhvnYbYqBvDaqpsXoVKBT0g8ZTXuSs36Rrxi6wyBnXVcM0RrC8YhU6ybBWiovNo2chyPSPhFAvmJVmVL2t3lbA7SoBnWQvNtspHY8Xd8KNf-MUSuhHKXfrSRPwWC23D9qSxoUC0ubIINYBLD-WHYv_Yn7RBU7IQ4fzoLJrE6mUBz9tZ79drLOLd7vbe8MPpWJI-MHCTHD6XTMAWqd5q22EGAUa29XV4Jl4E6xZg8CybaOUOVpuia35UPLpCKK0wDofdAAUcPCo-hj7OH3U0XsCccF0GHfo7cqoYQanqfu7mypeGEf9_471KYQVNSlc1TGrrngY6_KRBMKDcx7fZne4ypsJfumhrpfbEkeltfwFsGVs1--2bFksLI8esRxR1qUHzT0.hCv29YrLBFcW8TjKwSmCXQ"}');

  const req3 = requestLogger.requests[2].request;
  await t.expect(req3.url).eql('http://localhost:3000/idp/idx/challenge');
  await t.expect(req3.method).eql('post');
  await t.expect(req3.body).eql('{"authenticator":{"id":"aidwboITrg4b4yAYd0g3"},"stateHandle":"eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvdnhhU2NRWG9TbzJvMjAwZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..40AFMvA7ix6FA2oE.Q6jiZeKfCdON5wqqMdiDQCtgLctrIrpnQzKEwub6L5KvFWcgVpdEFcoOvT1WIq9EUVOg2m_vFLV7b-PVSoCBKhKzl0IujmkjC5XyTwnDBMmJt-2-BMez0kIkABNI1BpffStyt8uJiUqGifVrZ6AqXr6zCpkGK5f7-Mu_rVF8NS2P580n2_2p9MO9haf-z56-i3DfkX-xM1a3_AQXUGr_RzDXWPXZf6mPUhYtouJz7Qdpt6n9agvqasuSz8JLehX9TIN9Y4k_M7JKxaYfdOv9Bnp7zSEtVQeG2ADzbIMKBRXA1bP_TZ7EKHInCu4gz8JR3febZLz8EZq-kaknBB_S3AvkjtzkrUyfUNo31xZhoTWO2kiMJlo_zLRqMKW8xqPNYKjtYo9rXR_v4_wA3hOCKFyKkqCD8U1Y6bbVwoicDHOZ4fNZOtcAVB8BJ8HzpAYzF8bCKHCD9CLgIU8eCezTo_Fo90Zm138Hu0rJc0LCNlG26RFv7DZ89fJbFqobS_y8bbB-MC0wsBBxf1kx1lEFUCqZFNottzXtRnpYKqvurBj_IsV9YtO9T35WZanr2gfbl98R2YpRGMF4pfp3d_6ltntY8-a8VK9cUlkjzBNXH46O-MzOTeuWQ7XgcEqK_MNENs4JMGTixBUQeQjPaDvJ_djCigciq1qyf2peAZBDlR5lozoJbNNQtxnXTYBresTm5RvEQ7qWo5IQlNDnK9Ir5pQdgM1NTPYiVDEt4TFZ4ZjLgycdLSSOv6HSw9bS85avNswJBXwlYBDHML5NpfGL-6m8uoPmtRqCG1HTFgLdSo1iGkcPtO8zcymNlUpevIEhX8QAf0GTK66723e0Qmz8lLDcsVCBVmyvFAENJ2gnR48p4Dt96nH7KRnrXOXUYa1LxJZr_ZeT7K-5WXw5a-dESuxvg18M993Kw6yDwSHsZ-6UeppWg3PPo7dKRE1aX9fisQP1uRCJzk1CtWxPu2GcFs9UZpszLuv1Y8r9DDH7FSgzlyULzOXVcNaLzkm5-RH7jxeRTiOOZxhOBIUuVgUUnkm6x4K23-TYxf4HgV_vWrQmIdEjaP5NuYRPfLkdM8qAWCkuz5r48yjl6T5XRg1wKG7OX0JZLjbmcJsTNagXSHbPsXuBd0te_fgNYT54_eGkIIklr4LbOEhKGNpZSXSWPbTPT7zhbebrUGglldI37k8WldRGywq_ZvZX6W5hucD_yWBqqXBq45LW_iNlAvtUIXBkq4WuPgWaYRIjqWnUxbAZkL_5ejddr18MOmbwV8ftbtYhvnYbYqBvDaqpsXoVKBT0g8ZTXuSs36Rrxi6wyBnXVcM0RrC8YhU6ybBWiovNo2chyPSPhFAvmJVmVL2t3lbA7SoBnWQvNtspHY8Xd8KNf-MUSuhHKXfrSRPwWC23D9qSxoUC0ubIINYBLD-WHYv_Yn7RBU7IQ4fzoLJrE6mUBz9tZ79drLOLd7vbe8MPpWJI-MHCTHD6XTMAWqd5q22EGAUa29XV4Jl4E6xZg8CybaOUOVpuia35UPLpCKK0wDofdAAUcPCo-hj7OH3U0XsCccF0GHfo7cqoYQanqfu7mypeGEf9_471KYQVNSlc1TGrrngY6_KRBMKDcx7fZne4ypsJfumhrpfbEkeltfwFsGVs1--2bFksLI8esRxR1qUHzT0.hCv29YrLBFcW8TjKwSmCXQ"}');

});

test.requestHooks(mockChallengeWebauthn)('should navigate to webauthn challenge page', async t => {
  const selectFactorPage = await setup(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with an authenticator');

  selectFactorPage.selectFactorByIndex(1);
  const challengeFactorPage = new ChallengeFactorPageObject(t);
  await t.expect(challengeFactorPage.getPageTitle()).eql('Verify with Security Key or Biometric Authenticator');
});

test.requestHooks(mockChallengeEmail)('should navigate to email challenge page', async t => {
  const selectFactorPage = await setup(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with an authenticator');

  selectFactorPage.selectFactorByIndex(2);
  const challengeFactorPage = new ChallengeFactorPageObject(t);
  await t.expect(challengeFactorPage.getPageTitle()).eql('Verify with your email');
});

test.requestHooks(mockChallengeOVTotp)('should load select authenticator list with okta verify options', async t => {
  const selectFactorPage = await setup(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with an authenticator');
  await t.expect(selectFactorPage.getFormSubtitle()).eql('Select from the following options');
  await t.expect(selectFactorPage.getFactorsCount()).eql(4);

  await t.expect(selectFactorPage.getFactorLabelByIndex(0)).eql('Use Okta FastPass');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(0)).eql(false);
  await t.expect(selectFactorPage.getFactorIconClassByIndex(0)).contains('mfa-okta-verify');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(0)).eql('Select');

  await t.expect(selectFactorPage.getFactorLabelByIndex(1)).eql('Get a push notification');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(1)).eql(false);
  await t.expect(selectFactorPage.getFactorIconClassByIndex(1)).contains('mfa-okta-verify');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(1)).eql('Select');

  await t.expect(selectFactorPage.getFactorLabelByIndex(2)).eql('Enter a code');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(2)).eql(false);
  await t.expect(selectFactorPage.getFactorIconClassByIndex(2)).contains('mfa-okta-verify');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(2)).eql('Select');

  await t.expect(selectFactorPage.getFactorLabelByIndex(3)).eql('Okta Password');
  await t.expect(await selectFactorPage.factorDescriptionExistsByIndex(3)).eql(false);
  await t.expect(selectFactorPage.getFactorIconClassByIndex(3)).contains('mfa-okta-password');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(3)).eql('Select');

  // signout link at enroll page
  await t.expect(await selectFactorPage.signoutLinkExists()).ok();
  await t.expect(selectFactorPage.getSignoutLinkText()).eql('Sign Out');

});

test.requestHooks(requestLogger, mockChallengeOVTotp)('should navigate to okta verify totp page', async t => {
  const selectFactorPage = await setup(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with an authenticator');

  selectFactorPage.selectFactorByIndex(2);
  const challengeFactorPage = new ChallengeFactorPageObject(t);
  await t.expect(challengeFactorPage.getPageTitle()).eql('Enter a code');

  await t.expect(requestLogger.count(() => true)).eql(2);
  const req1 = requestLogger.requests[0].request;
  await t.expect(req1.url).eql('http://localhost:3000/idp/idx/introspect');

  const req2 = requestLogger.requests[1].request;
  await t.expect(req2.url).eql('http://localhost:3000/idp/idx/challenge');
  await t.expect(req2.method).eql('post');
  await t.expect(JSON.parse(req2.body)).eql({
    'authenticator':
    {
      'id': 'auteq0lLiL9o1cYoN0g4',
      'methodType': 'totp'
    },
    'stateHandle': '02im-3M2f6UXHgNfS7Ns7C85EKHzGaKw0u1CC4p9_r'
  });
});

test.requestHooks(requestLogger, mockChallengeOVPush)('should navigate to okta verify push page', async t => {
  const selectFactorPage = await setup(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with an authenticator');

  selectFactorPage.selectFactorByIndex(1);
  const challengeFactorPage = new ChallengeFactorPageObject(t);
  await t.expect(challengeFactorPage.getPageTitle()).eql('Get a push notification');

  await t.expect(requestLogger.count(() => true)).eql(2);
  const req1 = requestLogger.requests[0].request;
  await t.expect(req1.url).eql('http://localhost:3000/idp/idx/introspect');

  const req2 = requestLogger.requests[1].request;
  await t.expect(req2.url).eql('http://localhost:3000/idp/idx/challenge');
  await t.expect(req2.method).eql('post');
  await t.expect(JSON.parse(req2.body)).eql({
    'authenticator':
    {
      'id': 'auteq0lLiL9o1cYoN0g4',
      'methodType': 'push'
    },
    'stateHandle': '02im-3M2f6UXHgNfS7Ns7C85EKHzGaKw0u1CC4p9_r'
  });
});

test.requestHooks(requestLogger, mockChallengeOVFastPass)('should navigate to okta verify fast pass page', async t => {
  const selectFactorPage = await setup(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Verify it\'s you with an authenticator');

  selectFactorPage.selectFactorByIndex(0);
  const challengeFactorPage = new ChallengeFactorPageObject(t);
  await t.expect(challengeFactorPage.getPageTitle()).eql('Signing in using Okta FastPass');

  await t.expect(requestLogger.count(() => true)).eql(2);
  const req1 = requestLogger.requests[0].request;
  await t.expect(req1.url).eql('http://localhost:3000/idp/idx/introspect');

  const req2 = requestLogger.requests[1].request;
  await t.expect(req2.url).eql('http://localhost:3000/idp/idx/challenge');
  await t.expect(req2.method).eql('post');
  await t.expect(JSON.parse(req2.body)).eql({
    'authenticator':
    {
      'id': 'auteq0lLiL9o1cYoN0g4',
      'methodType': 'signed_nonce'
    },
    'stateHandle': '02im-3M2f6UXHgNfS7Ns7C85EKHzGaKw0u1CC4p9_r'
  });
});
