import { RequestMock, RequestLogger, ClientFunction } from 'testcafe';
import PrimaryAuthPageObject from '../../framework/page-objects-v1/PrimaryAuthPageObject';
import authNMfaSmsEnrollResponse from '../../../../playground/mocks/data/api/v1/authn/mfa-enroll-sms';
import SmsEnrollPageObject from '../../framework/page-objects-v1/SmsEnrollPageObject';
import ForgotPasswordPageObject from '../../framework/page-objects-v1/ForgotPasswordPageObject';

const renderWidget = ClientFunction((settings) => {
  // function `renderPlaygroundWidget` is defined in playground/main.js
  window.renderPlaygroundWidget(settings);
});

const authNPrimaryAuthToSmsEnrollMock = RequestMock()
  .onRequestTo('http://localhost:3000/api/v1/authn')
  .respond(authNMfaSmsEnrollResponse);

fixture('Form Animations').meta('gen1', true);

const logger = RequestLogger(
  /api\/v1/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
    logResponseBody: true,
  }
);

const defaultConfig = {
  stateToken: null, // setting stateToken to null to trigger the V1 flow
  features: {
    router: true,
  },
  authParams: {
    responseType: 'code',
  },
  useClassicEngine: true,
};

async function setup(t, config = defaultConfig) {
  const primaryAuthPage = new PrimaryAuthPageObject(t);
  await primaryAuthPage.navigateToPage({ render: false });
  await renderWidget(config);
  await t.expect(primaryAuthPage.formExists()).eql(true);
  return primaryAuthPage;
}

const animationTriggered = ClientFunction(() => window.animationTriggered);
const observeAnimation = ClientFunction((fromRight = true) => {
  var appEl = document.querySelector('.auth-content-inner');

  const config = { attributes: true, childList: true };

  const callback = function(mutationsList) {
    const transitionClass = fromRight ? 'transition-from-right' : 'transition-from-left';
    for(let mutation of mutationsList) {
      if (mutation.type !== 'childList') {
        return;
      }
      for (var i =0; i < mutation.addedNodes.length; i++ ) {
        window.animationTriggered = window.animationTriggered || mutation.addedNodes[i].className.indexOf(transitionClass) > -1;
      }
    }
  };

  const observer = new MutationObserver(callback);

  observer.observe(appEl, config);
});

test.requestHooks(logger, authNPrimaryAuthToSmsEnrollMock)('load primary authentication form, enter credentials and load SMS Enroll form with page swap animation', async (t) => {
  const primaryAuthForm = await setup(t);

  await t.expect(animationTriggered()).eql(undefined);
  await t.expect(primaryAuthForm.getFormTitle()).eql('Sign In');
  await primaryAuthForm.form.setTextBoxValue('username', 'administrator@okta1.com');
  await primaryAuthForm.form.setTextBoxValue('password', 'pass@word123');
  
  await observeAnimation();

  await primaryAuthForm.form.clickSaveButton('Sign In');

  await t.expect(animationTriggered()).eql(true);
  
  const smsEnrollPageObject = new SmsEnrollPageObject(t);
  await t.expect(smsEnrollPageObject.hasMFAFactorsList()).ok();
  await t.expect(smsEnrollPageObject.getFormTitle()).eql('Set up multifactor authentication');
});

test.requestHooks(logger)('load forgot password form with page swap animation', async (t) => {
  const primaryAuthForm = await setup(t);

  await t.expect(animationTriggered()).eql(undefined);
  await t.expect(primaryAuthForm.getFormTitle()).eql('Sign In');
  await primaryAuthForm.clickLinkElement('Need help signing in?');

  await observeAnimation();

  await primaryAuthForm.clickLinkElement('Forgot password?');

  await t.expect(animationTriggered()).eql(true);

  const forgotPasswordPageObject = new ForgotPasswordPageObject(t);
  await t.expect(forgotPasswordPageObject.hasEmailField()).ok();
  await t.expect(forgotPasswordPageObject.getFormTitle()).eql('Reset Password');
});

test.requestHooks(logger)('load forgot password form and navigate back to sign in page with page swap animation', async (t) => {
  const primaryAuthForm = await setup(t);

  await t.expect(animationTriggered()).eql(undefined);
  await t.expect(primaryAuthForm.getFormTitle()).eql('Sign In');
  await primaryAuthForm.clickLinkElement('Need help signing in?');
  await primaryAuthForm.clickLinkElement('Forgot password?');

  const forgotPasswordPageObject = new ForgotPasswordPageObject(t);
  await t.expect(forgotPasswordPageObject.hasEmailField()).ok();
  await t.expect(forgotPasswordPageObject.getFormTitle()).eql('Reset Password');

  // Observe transition happens from left to right
  await observeAnimation(false);

  await forgotPasswordPageObject.clickLinkElement('Back to sign in');

  await t.expect(animationTriggered()).eql(true);

  const primaryAuthPage = new PrimaryAuthPageObject(t);
  await t.expect(primaryAuthForm.hasUsernameField()).ok();
  await t.expect(primaryAuthPage.getFormTitle()).eql('Sign In');
});
