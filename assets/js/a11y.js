/*!
 * Copyright (c) 2022, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

// "config" object contains default widget configuration
// with any custom overrides defined in your admin settings.
const config = OktaUtil.getSignInWidgetConfig();
const companyName = config.logoText.substring(0, config.logoText.length - ' logo'.length);

// prevents image alt text from repeating "logo", e.g., "Name logo logo"
config.logoText = companyName;

// Render the Okta Sign-In Widget
const oktaSignIn = new OktaSignIn(config);
oktaSignIn.renderEl({ el: '#okta-login-container' },
  OktaUtil.completeLogin,
  function(error) {
    // Logs errors that occur when configuring the widget.
    // Remove or replace this with your own custom error handler.
    console.log(error.message, error);
  }
);

function setAttr(selector, attributes) {
  const elements = document.querySelectorAll(selector) || [];
  const keys = Object.keys(attributes) || [];
  elements.forEach(function(el) {
    keys.forEach(function(key) {
      const val = attributes[key]
      el.setAttribute(key, val);
    })
  });
}
function toTitleCase(kebabCase) {
  if (!kebabCase) {
    return '';
  }
  return kebabCase.split('-')
    .map(function (w) {
      return w[0].toUpperCase() + w.substring(1);
    })
    .join(' ');
}
function getTitle({ controller, formName, authenticatorKey, methodType }) {
  const map = [
    {
      tester: controller === 'primary-auth' && formName === 'identify',
      title: `${companyName} - Sign in`,
    },
    {
      tester: controller === 'registration',
      title: `${companyName} - Sign up`,
    },
    {
      tester: controller === 'forgot-password',
      title: `${companyName} - Reset password`,
    },
    {
      tester: formName === 'select-authenticator-authenticate',
      title: `${companyName} - Select authenticator`
    },
    {
      tester: formName === 'select-authenticator-enroll',
      title: `${companyName} - Set up security authenticators`
    },

    {
      tester: formName === 'authenticator-verification-data'
      && methodType === 'sms',
      title: `${companyName} - Verify with phone SMS`
    },
    {
      tester: controller === 'mfa-verify-passcode'
      && formName === 'challenge-authenticator'
      && methodType === 'voice',
      title: `${companyName} - Verify with phone voice call`
    },
    {
      tester: /^enroll-/.test(controller)
        && formName === 'enroll-authenticator',
      title: `${companyName} - Set up ${methodType} authenticator`
    },
    {
      tester: formName === 'enroll-poll',
      title: `${companyName} - Set up ${toTitleCase((authenticatorKey || '').replace(/_/g, '-'))}`
    },
    {
      tester: /^mfa-verify-/.test(controller)
        && formName === 'challenge-authenticator',
      title: `${companyName} - Verify using ${methodType} authenticator`
    },
    {
      tester: formName === 'authenticator-verification-data',
      title: `${companyName} - Verify using ${methodType} authenticator`
    },
    {
      tester: controller === 'mfa-verify-webauthn'
        && formName === 'challenge-authenticator'
        && methodType === 'webauthn',
      title: `${companyName} - Verify using security key or biometric authenticator`
    },
    {
      tester: controller === 'mfa-verify'
        && formName === 'challenge-authenticator'
        && methodType === 'totp',
      title: `${companyName} - Verify using Okta Verify code`
    },
    {
      tester: controller === 'mfa-verify'
        && formName === 'challenge-authenticator'
        && methodType === 'push',
      title: `${companyName} - Verify using Okta Verify push`
    },
    {
      tester: controller === 'mfa-verify'
        && formName === 'challenge-poll'
        && methodType === 'push',
      title: `${companyName} - Verify using Okta Verify push`
    },
  ];

  const match = map.find(({ tester }) => tester);
  return (match && match.title)
    || toTitleCase(formName)
    || toTitleCase(controller);
}

// update page title
oktaSignIn.on('afterRender', function (context) {
  console.log(context);

  // set page title
  document.title = getTitle(context);

  if (context.formName === 'select-authenticator-authenticate') {
    // set aria-label for auth coins
    setAttr('.mfa-google-auth', { 'aria-label': 'Verify using Google Authenticator' });
    setAttr('.mfa-webauthn', { 'aria-label': 'Verify using Security key or Biometric Authenticator' });
    setAttr('.mfa-okta-verify', { 'aria-label': 'Verify using Okta Verify' });
    setAttr('.mfa-okta-email', { 'aria-label': 'Verify using email' });
    setAttr('.mfa-okta-phone', { 'aria-label': 'Verify using phone' });

    // set aria-label for buttons
    setAttr('.authenticator-button[data-se="google_otp"] a', { 'aria-label': 'Verify using Google Authenticator' });
    setAttr('.authenticator-button[data-se="okta_email"] a', { 'aria-label': 'Verify using Email' });
    setAttr('.authenticator-button[data-se="webauthn"] a', { 'aria-label': 'Verify using Security key or Biometric Authenticator' });
    setAttr('.authenticator-button[data-se="okta_verify-totp"] a', { 'aria-label': 'Verify using Okta Verify (Code)' });
    setAttr('.authenticator-button[data-se="okta_verify-push"] a', { 'aria-label': 'Verify using Okta Verify (Push Notification)' });
    setAttr('.authenticator-button[data-se="phone_number"] a', { 'aria-label': 'Verify using phone' });
  }

  if (context.formName === 'select-authenticator-enroll') {
    // set aria-label for auth coins
    setAttr('.mfa-google-auth', { 'aria-label': 'Enroll Google Authenticator' });
    setAttr('.mfa-webauthn', { 'aria-label': 'Enroll Security key or Biometric Authenticator' });
    setAttr('.mfa-okta-verify', { 'aria-label': 'Enroll Okta Verify' });
    setAttr('.mfa-okta-email', { 'aria-label': 'Enroll email' });
    setAttr('.mfa-okta-phone', { 'aria-label': 'Enroll phone' });
    setAttr('.mfa-okta-password', { 'aria-label': 'Enroll password' }); // TODO password
    // TODO duo, rsa, symantec, custom?, yubikey, etc.

    // set aria-label for buttons
    setAttr('.authenticator-button[data-se="google_otp"] a', { 'aria-label': 'Enroll Google Authenticator' });
    setAttr('.authenticator-button[data-se="okta_email"] a', { 'aria-label': 'Enroll email' });
    setAttr('.authenticator-button[data-se="webauthn"] a', { 'aria-label': 'Enroll Security key or biometric authenticator' });
    setAttr('.authenticator-button[data-se="okta_verify"] a', { 'aria-label': 'Enroll Okta Verify' });
    setAttr('.authenticator-button[data-se="phone_number"] a', { 'aria-label': 'Enroll phone' });
    setAttr('.authenticator-button[data-se="security_question"] a', { 'aria-label': 'Enroll security question' });
    setAttr('.authenticator-button[data-se="okta_password"] a', { 'aria-label': 'Enroll password' }); // TODO password? okta_password
  }

  // identify page autocomplete attrs
  setAttr('input[name="identifier"]', { autocomplete: 'username' }); // NOTE or email?

  // register page autocomplete attrs
  setAttr('input[name="userProfile.email"]', { autocomplete: 'email' });
  setAttr('input[name="userProfile.lastName"]', { autocomplete: 'family-name' });
  setAttr('input[name="userProfile.firstName"]', { autocomplete: 'given-name' });

  document.querySelectorAll('.password-toggle')
    .forEach((toggle) => {
      const container = toggle.parentNode;
      const input = container.querySelector('.password-with-toggle');
      toggle.children.forEach((span) => toggle.removeChild(span));
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

  const resendPages = [
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
    }
  ]

  // shallow equality
  const isEqual = (a,b) => [...Object.keys(a)].every((k) => a[k] === b[k])

  if (resendPages.some(page => isEqual(page, context))) {
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
              parent.removeChild(box);
              box.setAttribute('aria-live', 'assertive');
              parent.appendChild(box);
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
