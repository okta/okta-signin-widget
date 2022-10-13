import { OktaSignInAPI } from '../types/api';
import { EventContext } from '../types/events';

export type OktaPluginA11yOptions = {
  /**
   * Used to set content-relevant page titles. Will set page title or call
   * onTitleChange without companyName prefix if undefined, e.g., "Reset
   * Password" instead of "Acme - Reset Password"
   */
  companyName?: string;

  /**
   * Callback for updating page title when widget content changes. Will update
   * document.title if undefined.
   */
  onTitleChange?: (title: string) => void;
}

/**
 * Utility: Set attributes for DOM elements matching the CSS selector
 * @param selector css selector for dom element
 * @param attributes
 */
function setAttr(selector: string, attributes: Record<string, string>) {
  const elements = document.querySelectorAll(selector) || [];
  const keys = Object.keys(attributes) || [];
  elements.forEach((el) => {
    keys.forEach((key) => {
      el.setAttribute(key, attributes[key]);
    })
  });
}

/**
 * Utility: Converts a string to Title Case
 * @param str string to convert
 * @returns
 */
function toTitleCase(str?: string) {
  return !str
    ? ''
    : str.replace(/[_ ]/g, '-').split('-')
      .map((word) => word[0].toUpperCase() + word.substring(1))
      .join(' ');
}

/**
 * Pages with "resend" links/buttons that appear after a delay (default: 30s),
 * e.g., "Resend email", "Resend SMS"
 */
const RESEND_PAGES = [
  {
    controller: 'mfa-verify-passcode',
    formName: 'challenge-authenticator',
    authenticatorKey: 'phone_number',
    methodType: 'sms',
  },
  {
    controller: "enroll-email",
    formName: "enroll-authenticator",
    authenticatorKey: "okta_email",
    methodType: "email"
  },
  {
    controller: "mfa-verify",
    formName: "challenge-poll",
    authenticatorKey: "okta_verify",
    methodType: "push"
  },
  {
    controller: "forgot-password",
    formName: "identify-recovery"
  },
];


/**
 * Utility getTitle
 * @param param event context, passed to "afterRender" callback
 * @returns
 */
function getTitle ({
  controller,
  formName,
  authenticatorKey,
  methodType
}: EventContext) {
  const map = [
    {
      tester: controller === 'primary-auth' && formName === 'identify',
      title: `Sign in`,
    },
    {
      tester: controller === 'registration',
      title: `Sign up`,
    },
    {
      tester: controller === 'forgot-password',
      title: `Reset password`,
    },
    {
      tester: formName === 'select-authenticator-authenticate',
      title: `Select authenticator`
    },
    {
      tester: formName === 'select-authenticator-enroll',
      title: `Set up security authenticators`
    },

    {
      tester: formName === 'authenticator-verification-data'
      && methodType === 'sms',
      title: `Verify with phone SMS`
    },
    {
      tester: controller === 'mfa-verify-passcode'
      && formName === 'challenge-authenticator'
      && methodType === 'voice',
      title: `Verify with phone voice call`
    },
    {
      tester: /^enroll-/.test(controller)
        && formName === 'enroll-authenticator',
      title: `Set up ${methodType} authenticator`
    },
    {
      tester: formName === 'enroll-poll',
      title: `Set up ${toTitleCase(authenticatorKey)}`
    },
    {
      tester: /^mfa-verify-/.test(controller)
        && formName === 'challenge-authenticator',
      title: `Verify using ${methodType} authenticator`
    },
    {
      tester: formName === 'authenticator-verification-data',
      title: `Verify using ${methodType} authenticator`
    },
    {
      tester: controller === 'mfa-verify-webauthn'
        && formName === 'challenge-authenticator'
        && methodType === 'webauthn',
      title: `Verify using security key or biometric authenticator`
    },
    {
      tester: controller === 'mfa-verify'
        && formName === 'challenge-authenticator'
        && methodType === 'totp',
      title: `Verify using Okta Verify code`
    },
    {
      tester: controller === 'mfa-verify'
        && formName === 'challenge-authenticator'
        && methodType === 'push',
      title: `Verify using Okta Verify push`
    },
    {
      tester: controller === 'mfa-verify'
        && formName === 'challenge-poll'
        && methodType === 'push',
      title: `Verify using Okta Verify push`
    },
  ];

  // find a matching title
  const match = map.find(({ tester }) => tester);
  return (match && match.title) || toTitleCase(formName || controller || '');
}

/**
 * Cheap check for shallow equality
 * @param a object
 * @param b object
 * @returns true if shallow-equal, false otherwise
 */
const isEqual = (a,b) => [...Object.keys(a)].every((k) => a[k] === b[k]);

/**
 * This plugin improves the accessibility (a11y) of the Okta sign in widget to
 * comply with WCAG2.1AA (https://www.w3.org/TR/WCAG21/) standards and Section
 * 508 (https://www.section508.gov/)
 *
 * @param widget instance of OktaSignIn
 * @param options options for a11y plugin
 */
export const init = (widget: OktaSignInAPI, options?: OktaPluginA11yOptions): void => {
  // parse options
  const { companyName, onTitleChange } = options ?? {};
  
  /**
   * Register a new afterRender event callback, see
   * https://github.com/okta/okta-signin-widget#afterrender
   */
  widget.on('afterRender', function (context: EventContext) {
    const title = companyName ? `${companyName} - ${getTitle(context)}` : getTitle(context);
    // NOTE: for customer-hosted scenarios, do NOT set page title!
    if (onTitleChange) {
      onTitleChange(title);
    } else {
      document.title = title;
    }

    // NOTE: when verifying with an existing (i.e., already enrolled) authenticator
    if (context.formName === 'select-authenticator-authenticate') {
      // set aria-label for auth coins
      setAttr('.mfa-custom-app-logo',        { 'aria-label': 'Verify using custom push app' });
      setAttr('.mfa-custom-factor',          { 'aria-label': 'Verify using custom IDP Authenticator' });
      setAttr('.mfa-duo',                    { 'aria-label': 'Verify using Duo Security' });
      setAttr('.mfa-google-auth',            { 'aria-label': 'Verify using Google Authenticator' });
      setAttr('.mfa-hotp',                   { 'aria-label': 'Verify using Custom OTP' });
      setAttr('.mfa-okta-email',             { 'aria-label': 'Verify using email' });
      setAttr('.mfa-okta-password',          { 'aria-label': 'Verify using password' });
      setAttr('.mfa-okta-phone',             { 'aria-label': 'Verify using phone' }); // TODO read last-4 digis
      setAttr('.mfa-okta-security-question', { 'aria-label': 'Verify using Security Question' });
      setAttr('.mfa-okta-verify',            { 'aria-label': 'Verify using Okta Verify' });
      setAttr('.mfa-onprem',                 { 'aria-label': 'Verify using Custom On-prem' });
      setAttr('.mfa-rsa',                    { 'aria-label': 'Verify using RSA SecurID' });
      setAttr('.mfa-symantec',               { 'aria-label': 'Verify using Symantec VIP' });
      setAttr('.mfa-webauthn',               { 'aria-label': 'Verify using Security key or Biometric Authenticator' });
      setAttr('.mfa-yubikey',                { 'aria-label': 'Verify using Yubikey' });

      // set aria-label for buttons
      setAttr('.authenticator-button[data-se="custom_otp"] a',        { 'aria-label': 'Verify using Custom OTP' });
      setAttr('.authenticator-button[data-se="duo"] a',               { 'aria-label': 'Verify using Duo Security' });
      setAttr('.authenticator-button[data-se="external_idp"] a',      { 'aria-label': 'Verify using IDP Authenticator' });
      setAttr('.authenticator-button[data-se="google_otp"] a',        { 'aria-label': 'Verify using Google Authenticator' });
      setAttr('.authenticator-button[data-se="okta_email"] a',        { 'aria-label': 'Verify using email' });
      setAttr('.authenticator-button[data-se="okta_password"] a',     { 'aria-label': 'Verify using password' });
      setAttr('.authenticator-button[data-se="okta_verify-push"] a',  { 'aria-label': 'Verify using Okta Verify (Push Notification)' });
      setAttr('.authenticator-button[data-se="okta_verify-totp"] a',  { 'aria-label': 'Verify using Okta Verify (Code)' });
      setAttr('.authenticator-button[data-se="okta_verify"] a',       { 'aria-label': 'Verify using Okta Verify' });
      setAttr('.authenticator-button[data-se="onprem_mfa-otp"] a',    { 'aria-label': 'Verify using custom on-prem authenticator' });
      setAttr('.authenticator-button[data-se="phone_number"] a',      { 'aria-label': 'Verify using phone' });
      setAttr('.authenticator-button[data-se="rsa_token-otp"] a',     { 'aria-label': 'Verify using RSA SecurID' });
      setAttr('.authenticator-button[data-se="security_question"] a', { 'aria-label': 'Verify using security question' });
      setAttr('.authenticator-button[data-se="symantec_vip"] a',      { 'aria-label': 'Verify using Symantec VIP' });
      setAttr('.authenticator-button[data-se="webauthn"] a',          { 'aria-label': 'Verify using Security key or Biometric Authenticator' });
      setAttr('.authenticator-button[data-se="yubikey_token"] a',     { 'aria-label': 'Verify using Yubikey' });
    }

    // NOTE: when enrolling a new authenticator
    if (context.formName === 'select-authenticator-enroll') {
      // set aria-label for auth coins
      setAttr('.mfa-custom-app-logo',        { 'aria-label': 'Enroll custom push app' });
      setAttr('.mfa-custom-factor',          { 'aria-label': 'Enroll custom IDP Authenticator' });
      setAttr('.mfa-duo',                    { 'aria-label': 'Enroll Duo Security' });
      setAttr('.mfa-google-auth',            { 'aria-label': 'Enroll Google Authenticator' });
      setAttr('.mfa-hotp',                   { 'aria-label': 'Enroll Custom OTP' });
      setAttr('.mfa-okta-email',             { 'aria-label': 'Enroll email' });
      setAttr('.mfa-okta-password',          { 'aria-label': 'Enroll password' });
      setAttr('.mfa-okta-phone',             { 'aria-label': 'Enroll phone' }); // TODO read last-4 digis
      setAttr('.mfa-okta-security-question', { 'aria-label': 'Enroll Security Question' });
      setAttr('.mfa-okta-verify',            { 'aria-label': 'Enroll Okta Verify' });
      setAttr('.mfa-onprem',                 { 'aria-label': 'Enroll Custom On-prem' });
      setAttr('.mfa-rsa',                    { 'aria-label': 'Enroll RSA SecurID' });
      setAttr('.mfa-symantec',               { 'aria-label': 'Enroll Symantec VIP' });
      setAttr('.mfa-webauthn',               { 'aria-label': 'Enroll Security key or Biometric Authenticator' });
      setAttr('.mfa-yubikey',                { 'aria-label': 'Enroll Yubikey' });

      // set aria-label for buttons
      setAttr('.authenticator-button[data-se="custom_otp"] a',        { 'aria-label': 'Enroll custom OTP' });
      setAttr('.authenticator-button[data-se="duo"] a',               { 'aria-label': 'Enroll Duo Security' });
      setAttr('.authenticator-button[data-se="external_idp"] a',      { 'aria-label': 'Enroll IDP Authenticator' });
      setAttr('.authenticator-button[data-se="google_otp"] a',        { 'aria-label': 'Enroll Google Authenticator' });
      setAttr('.authenticator-button[data-se="okta_email"] a',        { 'aria-label': 'Enroll email' });
      setAttr('.authenticator-button[data-se="okta_password"] a',     { 'aria-label': 'Enroll password' });
      setAttr('.authenticator-button[data-se="okta_verify-push"] a',  { 'aria-label': 'Enroll Okta Verify (Push Notification)' });
      setAttr('.authenticator-button[data-se="okta_verify-totp"] a',  { 'aria-label': 'Enroll Okta Verify (Code)' });
      setAttr('.authenticator-button[data-se="okta_verify"] a',       { 'aria-label': 'Enroll Okta Verify' });
      setAttr('.authenticator-button[data-se="onprem_mfa-otp"] a',    { 'aria-label': 'Enroll custom on-prem authenticator' });
      setAttr('.authenticator-button[data-se="phone_number"] a',      { 'aria-label': 'Enroll phone' });
      setAttr('.authenticator-button[data-se="rsa_token-otp"] a',     { 'aria-label': 'Enroll RSA SecurID' });
      setAttr('.authenticator-button[data-se="security_question"] a', { 'aria-label': 'Enroll security question' });
      setAttr('.authenticator-button[data-se="symantec_vip"] a',      { 'aria-label': 'Enroll Symantec VIP' });
      setAttr('.authenticator-button[data-se="webauthn"] a',          { 'aria-label': 'Enroll Security key or Biometric Authenticator' });
      setAttr('.authenticator-button[data-se="yubikey_token"] a',     { 'aria-label': 'Enroll Yubikey' });
    }

    // identify page autocomplete attrs
    setAttr('input[name="identifier"]', { autocomplete: 'username' });

    // register page autocomplete attrs
    setAttr('input[name="userProfile.email"]', { autocomplete: 'email' });
    setAttr('input[name="userProfile.lastName"]', { autocomplete: 'family-name' });
    setAttr('input[name="userProfile.firstName"]', { autocomplete: 'given-name' });

    document.querySelectorAll('.password-toggle')
      .forEach((toggle) => {
        const container = toggle.parentNode;
        if (!container) {
          // should not be reached
          console.warn('Could not find parent node of ".password-toggle"');
          return;
        }

        // find the <input> element
        const input = container?.querySelector<HTMLInputElement>('.password-with-toggle');

        if (!input) {
          // should not be reached
          console.warn('Could not find input element ".password-with-toggle"');
          return;
        }

        // NOTE: replace <span> (non-interactive) elements with buttons to make
        // them keyboard-focusable and set appropriate aria atttributes/roles
        const children = [...toggle.children];
        children.forEach((span) => toggle.removeChild(span)); // FIXME
        const button = document.createElement('button');
        const updateButton = () => {
          const isVisible = input.type !== 'password';
          button.type = 'button';
          if (isVisible) {
            button.ariaLabel = 'Hide password';
            button.className = 'eyeicon visibility-off-16';
          } else {
            button.ariaLabel = 'Show password';
            button.className = 'eyeicon visibility-16';
          }
        };
        updateButton();
        button.onclick = () => {
          input.type = input.type === 'password' ? 'text' : 'password';
          updateButton();
        }
        toggle.appendChild(button);
      });


    if (RESEND_PAGES.some(page => isEqual(page, context))) {
      let count = 0;
      const intervalWarning = setInterval(() => {
        console.log('interval: infobox-warning')
        if (document.querySelector('.infobox-warning')) {
          document.querySelectorAll('.infobox-warning')
            .forEach((box) => {
              if (count === 0) {
                // element already exists in DOM, just hidden, set aria
                box.setAttribute('aria-live', 'assertive');
              } else {
                // remove
                const parent = box.parentElement;
                parent?.removeChild(box);
                box.setAttribute('aria-live', 'assertive');
                parent?.appendChild(box);
              }
            })
          console.log('clearing interval: infobox-warning')
          clearInterval(intervalWarning)
        }
        count++;
      }, 1500);

      const intervalResend = setInterval(() => {
        if (document.querySelector('.resend-link')) {
          console.log('interval: resend-link')
          document.querySelectorAll('.resend-link')
            .forEach((link) => link.setAttribute('href', 'javascript:void(0);'))
          console.log('clearing interval: resend-link')
          clearInterval(intervalResend)
        }
      }, 1500);
    }
  });
}
