/* eslint no-console: 0 */
import { addHookForEnrollProfileForm, customizeWidgetOptionsForHForEnrollProfileForm } from './pages/enroll-profile';
import { addHookForEnrollAuthenticatorForm, customizeWidgetOptionsForEnrollAuthenticatorForm } from './pages/enroll-authenticator';
import { addHookForIdentifyRecoveryForm } from './pages/identify-recovery';
import { addHookForIdentifyForm } from './pages/identify';
import { addHookForChallengeAuthenticatorForm } from './pages/challenge-authenticator';
import { addHookForAllForms } from './pages/all';
export const customizeWidgetOptionsForHooks = (config = {}) => {
    // Tips for Sign-in page code editor:
    //  To customize styling:
    //  1. Paste content of `hooks/css/customize.css` inside `<style nonce="{{nonceValue}}">`
    //  2. Paste the following line after `oktaSignIn.renderEl(...)`
    document.querySelector('#okta-login-container').classList.add('siw-customized');
    customizeWidgetOptionsForEnrollAuthenticatorForm(config);
    customizeWidgetOptionsForHForEnrollProfileForm(config);
};
export const addAfterTransformHooks = (oktaSignIn) => {
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
