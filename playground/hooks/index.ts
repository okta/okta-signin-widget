/* eslint no-console: 0 */

import type {
  OktaSignInAPI as OktaSignInAPIV3,
  WidgetOptions as WidgetOptionsV3,
} from '../../src/v3/src/types';
import { addHookForEnrollProfileForm, customizeWidgetOptionsForEnrollProfileForm } from './pages/enroll-profile';
import { addHookForEnrollAuthenticatorForm } from './pages/enroll-authenticator';
import { addHookForIdentifyRecoveryForm } from './pages/identify-recovery';
import { addHookForIdentifyForm } from './pages/identify';
import { addHookForChallengeAuthenticatorForm } from './pages/challenge-authenticator';
import { addHookForAllForms } from './pages/all';


export const customizeWidgetOptionsForHooks = (config: WidgetOptionsV3 = {}) => {
  // Tips for Sign-in page code editor:
  //  To customize styling:
  //  1. Paste content of `hooks/css/customize.css` inside `<style nonce="{{nonceValue}}">`
  //  2. Paste the following line after `oktaSignIn.renderEl(...)`
  document.querySelector('#okta-login-container').classList.add('siw-customized');

  customizeWidgetOptionsForEnrollProfileForm(config);
};

export const addAfterTransformHooks = (oktaSignIn: OktaSignInAPIV3) => {
  const gen3 = typeof oktaSignIn.afterTransform === 'function';
  if (gen3) {
    addHookForEnrollProfileForm(oktaSignIn);
    addHookForIdentifyRecoveryForm(oktaSignIn);
    addHookForIdentifyForm(oktaSignIn);
    addHookForChallengeAuthenticatorForm(oktaSignIn);
    addHookForEnrollAuthenticatorForm(oktaSignIn);
    addHookForAllForms(oktaSignIn);
  }
};
