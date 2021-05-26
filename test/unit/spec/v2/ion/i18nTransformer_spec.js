import { _ } from 'okta';
import i18nTransformer from 'v2/ion/i18nTransformer';
import { getMessageKey, getI18NParams, getMessage, getMessageFromBrowserError } from 'v2/ion/i18nTransformer';
import Bundles from 'util/Bundles';

describe('v2/ion/i18nTransformer', function() {
  let originalLoginBundle;

  beforeAll(() => {
    originalLoginBundle = Bundles.login;
    Bundles.login = _.mapObject({
      'oie.email.label': 'email authenticator',
      'oie.password.label': 'password authenticator',
      'oie.phone.label': 'phone authenticator',
      'oie.webauthn': 'webauthn authenticator',
      'oie.security.question.label': 'security question authenticator',
      'oie.okta_verify.signed_nonce.label': 'okta verify fastpass',
      'oie.google_authenticator.label': 'google authenticator',
      'oie.okta_verify.push.title': 'okta verify push',
      'oie.okta_verify.totp.title': 'okta verify totp',
      'oie.password.passwordLabel': 'enter password',
      'email.enroll.enterCode': 'enter code',
      'oie.security.question.questionKey.label': 'choose a question',
      'oie.security.question.createQuestion.label': 'create a question',
      'oie.google_authenticator.otp.title': 'enter passcode',
      'enroll.onprem.username.placeholder': 'enter {0} username',
      'enroll.onprem.passcode.placeholder': 'enter {0} passcode',
      'oie.phone.enroll.voice.label': 'voice call',
      'oie.phone.enroll.sms.label': 'sms',
      'errors.E0000113': '{0}',
      'factor.totpHard.rsaSecurId': 'rsa',
      'oie.custom_otp.verify.passcode.label': 'enter passcode',
      'mfa.phoneNumber.placeholder': 'phone number',
      'mfa.challenge.answer.placeholder': 'answer',
      'mfa.challenge.enterCode.placeholder': 'enter code',
      'mfa.challenge.password.placeholder': 'password',
      'oie.okta_verify.totp.enterCodeText': 'enter totp code',
      'oie.google_authenticator.otp.enterCodeText': 'enter passcode',
      'oie.enroll.okta_verify.channel.email.label': 'email',
      'oie.password.newPasswordLabel': 'new password',

      'primaryauth.password.placeholder': 'password',
      'primaryauth.username.placeholder': 'username',
      'remember': 'remember me',
      'security.disliked_food': 'dislike food answer',
      'security.name_of_first_plush_toy': 'first plush toy answer',
      'security.favorite_vacation_location': 'vacation location answer',
      'registration.complete.confirm.text': 'To finish signing in, check your email.',
      'idx.foo': 'hello the {0} authenticator',
      'password.forgot.email.or.username.placeholder': 'email or username',
      'oie.browser.error.NotAllowedError': 'translated browser thrown error',
      'oktaverify.rejected': 'rejected',
      'oie.password.incorrect.message': 'Password is incorrect',
      'idx.session.expired': 'The session has expired.',
      'oie.post.password.update.auth.failure.error': 'Authentication failed after password update.',
    }, (value) => `unit test - ${value}`);
  });
  afterAll(() => {
    Bundles.login = originalLoginBundle;
    originalLoginBundle = null;
  });

  it('no remediations', () => {
    const resp = {
      stateHandle: 'xxx'
    };
    expect(i18nTransformer(resp)).toEqual({
      stateHandle: 'xxx'
    });
  });

  it('no ui schemas', () => {
    const resp = {
      remediations: [
        {
          name: 'test',
          value: []
        }
      ]
    };
    expect(i18nTransformer(resp)).toEqual({
      remediations: [
        {
          name: 'test',
          value: []
        }
      ]
    });
  });

  it('converts label for identify with password', () => {
    const resp = {
      remediations: [
        {
          name: 'identify',
          uiSchema: [
            {
              label: 'Username',
              'label-top': true,
              name: 'identifier',
              type: 'text',
            },
            {
              label: 'Password',
              'label-top': true,
              name: 'credentials.passcode',
              params: { showPasswordToggle: true },
              secret: true,
              type: 'password',
            },
            {
              label: false,
              'label-top': true,
              modelType: 'boolean',
              name: 'rememberMe',
              placeholder: 'Remember me',
              required: false,
              type: 'checkbox',
            }
          ]
        }
      ]
    };
    expect(i18nTransformer(resp)).toEqual({
      remediations: [
        {
          name: 'identify',
          uiSchema: [
            {
              label: 'unit test - username',
              'label-top': true,
              name: 'identifier',
              type: 'text',
            },
            {
              label: 'unit test - password',
              'label-top': true,
              name: 'credentials.passcode',
              params: { showPasswordToggle: true },
              secret: true,
              type: 'password',
            },
            {
              label: false,
              'label-top': true,
              modelType: 'boolean',
              name: 'rememberMe',
              placeholder: 'Remember me',
              required: false,
              type: 'checkbox',
            }
          ]
        }
      ]
    });
  });

  it('converts label for identify-recovery', () => {
    const resp = {
      remediations: [
        {
          name: 'identify-recovery',
          uiSchema: [
            {
              label: 'Username',
              'label-top': true,
              name: 'identifier',
              type: 'text',
            }
          ]
        }
      ]
    };
    expect(i18nTransformer(resp)).toEqual({
      remediations: [
        {
          name: 'identify-recovery',
          uiSchema: [
            {
              label: 'unit test - email or username',
              'label-top': true,
              name: 'identifier',
              type: 'text',
            }
          ]
        }
      ]
    });
  });

  it('converts label for select-authenticator-authenticate', () => {
    const resp = {
      remediations: [
        {
          name: 'select-authenticator-authenticate',
          uiSchema: [
            {
              'name': 'authenticator',
              'type': 'authenticatorVerifySelect',
              'options': [
                {
                  'label': 'Okta Password',
                  'value': {
                    'id': 'aidwboITrg4b4yAYd0g3'
                  },
                  'authenticatorKey': 'okta_password'
                },
                {
                  'label': 'FIDO2 (WebAuthn)',
                  'value': {
                    'id': 'fwftheidkwh282hv8g3'
                  },
                  'authenticatorKey': 'webauthn'
                },
                {
                  'label': 'FIDO2 (WebAuthn)',
                  'value': {
                    'id': 'aidtheidkwh282hv8g3'
                  },
                  'authenticatorKey': 'webauthn'
                },
                {
                  'label': 'Okta Email',
                  'value': {
                    'id': 'aidtm56L8gXXHI1SD0g3'
                  },
                  'authenticatorKey': 'okta_email'

                },
                {
                  'label': 'Okta Phone',
                  'value': {
                    'id': 'aid568g3mXgtID0X1SLH'
                  },
                  'authenticatorKey': 'phone_number',
                },
                {
                  'label': 'Okta Security Question',
                  'value': {
                    'id': 'aid568g3mXgtID0HHSLH'
                  },
                  'authenticatorKey': 'security_question'
                },
                {
                  'label': 'Use Okta FastPass',
                  'value': {
                    'id': 'aid568g3mXgtID0HHSLH',
                    'methodType': 'signed_nonce'
                  },
                  'authenticatorKey': 'okta_verify'
                },
                {
                  'label': 'Get a push notification',
                  'value': {
                    'id': 'aid568g3mXgtID0HHSLH',
                    'methodType': 'push'
                  },
                  'authenticatorKey': 'okta_verify'
                },
                {
                  'label': 'Enter a code',
                  'value': {
                    'id': 'aid568g3mXgtID0HHSLH',
                    'methodType': 'totp'
                  },
                  'authenticatorKey': 'okta_verify'
                },
                {
                  'label': 'Enter a code',
                  'value': {
                    'id': 'aid568g3mCgtID0HHSLH',
                    'methodType': 'otp'
                  },
                  'authenticatorKey': 'google_otp'
                },
                {
                  'label': 'Enter a code',
                  'value': {
                    'id': 'aid568g3mCgtID0HHSLH',
                    'methodType': 'otp'
                  },
                  'authenticatorKey': 'rsa_token'
                }
              ],
              'label-top': true
            }
          ]
        }
      ]
    };
    expect(i18nTransformer(resp)).toEqual({
      remediations: [
        {
          name: 'select-authenticator-authenticate',
          uiSchema: [
            {
              'name': 'authenticator',
              'type': 'authenticatorVerifySelect',
              'options': [
                {
                  'label': 'unit test - password authenticator',
                  'value': {
                    'id': 'aidwboITrg4b4yAYd0g3'
                  },
                  'authenticatorKey': 'okta_password'
                },
                {
                  'label': 'FIDO2 (WebAuthn)',
                  'value': {
                    'id': 'fwftheidkwh282hv8g3'
                  },
                  'authenticatorKey': 'webauthn'
                },
                {
                  'label': 'FIDO2 (WebAuthn)',
                  'value': {
                    'id': 'aidtheidkwh282hv8g3'
                  },
                  'authenticatorKey': 'webauthn'
                },
                {
                  'label': 'unit test - email authenticator',
                  'value': {
                    'id': 'aidtm56L8gXXHI1SD0g3'
                  },
                  'authenticatorKey': 'okta_email'
                },
                {
                  'label': 'unit test - phone authenticator',
                  'value': {
                    'id': 'aid568g3mXgtID0X1SLH'
                  },
                  'authenticatorKey': 'phone_number',
                },
                {
                  'label': 'unit test - security question authenticator',
                  'value': {
                    'id': 'aid568g3mXgtID0HHSLH'
                  },
                  'authenticatorKey': 'security_question'
                },
                {
                  'label': 'unit test - okta verify fastpass',
                  'value': {
                    'id': 'aid568g3mXgtID0HHSLH',
                    'methodType': 'signed_nonce'
                  },
                  'authenticatorKey': 'okta_verify'
                },
                {
                  'label': 'unit test - okta verify push',
                  'value': {
                    'id': 'aid568g3mXgtID0HHSLH',
                    'methodType': 'push'
                  },
                  'authenticatorKey': 'okta_verify'
                },
                {
                  'label': 'unit test - okta verify totp',
                  'value': {
                    'id': 'aid568g3mXgtID0HHSLH',
                    'methodType': 'totp'
                  },
                  'authenticatorKey': 'okta_verify'
                },
                {
                  'label': 'unit test - google authenticator',
                  'value': {
                    'id': 'aid568g3mCgtID0HHSLH',
                    'methodType': 'otp'
                  },
                  'authenticatorKey': 'google_otp'
                },
                {
                  'label': 'unit test - rsa',
                  'value': {
                    'id': 'aid568g3mCgtID0HHSLH',
                    'methodType': 'otp'
                  },
                  'authenticatorKey': 'rsa_token'
                }
              ],
              'label-top': true
            }
          ]
        }
      ]
    });
  });

  it('converts labels for select-authenticator-unlock-account', () => {
    const resp = {
      remediations: [
        {
          name: 'select-authenticator-unlock-account',
          uiSchema: [
            {
              name: 'identifier',
              label: 'Username',
              'label-top': true,
              type: 'text'
            },
            {
              label: 'Email',
              'label-top': true,
              name: 'authenticator.okta_email',
              type: 'text',
            },
            {
              label: 'Phone',
              'label-top': true,
              name: 'authenticator.phone_number',
              type: 'text',
            }
          ]
        }
      ]
    };
    expect(i18nTransformer(resp)).toEqual({
      remediations: [
        {
          name: 'select-authenticator-unlock-account',
          uiSchema: [
            {
              label: 'unit test - username',
              'label-top': true,
              name: 'identifier',
              type: 'text',
            },
            {
              label: 'unit test - email authenticator',
              'label-top': true,
              name: 'authenticator.okta_email',
              type: 'text',
            },
            {
              label: 'unit test - phone authenticator',
              'label-top': true,
              name: 'authenticator.phone_number',
              type: 'text',
            }
          ]
        }
      ]
    });
  });

  it('converts label for challenge-authenticator - email', () => {
    const resp = {
      remediations: [
        {
          relatesTo: {
            value: {
              type: 'email',
              key: 'okta_email'
            }
          },
          name: 'challenge-authenticator',
          uiSchema: [
            {
              label: 'Enter code',
              'label-top': true,
              name: 'credentials.passcode',
              type: 'text',
            }
          ]
        }
      ]
    };
    expect(i18nTransformer(resp)).toEqual({
      remediations: [
        {
          name: 'challenge-authenticator',
          relatesTo: {
            value: {
              type: 'email',
              key: 'okta_email',
            }
          },
          uiSchema: [
            {
              label: 'unit test - enter code',
              'label-top': true,
              name: 'credentials.passcode',
              type: 'text',
            }
          ]
        }
      ]
    });
  });

  it('converts label for challenge-authenticator - phone', () => {
    const resp = {
      remediations: [
        {
          relatesTo: {
            value: {
              type: 'phone',
              key: 'phone_number'
            }
          },
          name: 'challenge-authenticator',
          uiSchema: [
            {
              label: 'Enter code',
              'label-top': true,
              name: 'credentials.passcode',
              type: 'text',
            }
          ]
        }
      ]
    };
    expect(i18nTransformer(resp)).toEqual({
      remediations: [
        {
          relatesTo: {
            value: {
              type: 'phone',
              key: 'phone_number'
            }
          },
          name: 'challenge-authenticator',
          uiSchema: [
            {
              label: 'unit test - enter code',
              'label-top': true,
              name: 'credentials.passcode',
              type: 'text',
            }
          ]
        }
      ]
    });
  });

  it('converts label for challenge-authenticator.okta_password.credentials.password', () => {
    const resp = {
      remediations: [
        {
          relatesTo: {
            value: {
              type: 'password',
              key: 'okta_password'
            }
          },
          name: 'challenge-authenticator',
          uiSchema: [
            {
              'name': 'credentials.passcode',
              'label': 'Password',
              'secret': true,
              'label-top': true,
              'type': 'password',
              'params': { 'showPasswordToggle': true }
            }
          ]
        }
      ]
    };
    expect(i18nTransformer(resp)).toEqual({
      remediations: [
        {
          relatesTo: {
            value: {
              type: 'password',
              key: 'okta_password'
            }
          },
          name: 'challenge-authenticator',
          uiSchema: [
            {
              'name': 'credentials.passcode',
              'label': 'unit test - password',
              'secret': true,
              'label-top': true,
              'type': 'password',
              'params': { 'showPasswordToggle': true }
            }
          ]
        }
      ]
    });
  });

  it('converts label for challenge-authenticator.credentials.password', () => {
    const resp = {
      remediations: [
        {
          name: 'challenge-authenticator',
          uiSchema: [
            {
              'name': 'credentials.passcode',
              'label': 'Password',
              'secret': true,
              'label-top': true,
              'type': 'password',
              'params': { 'showPasswordToggle': true }
            }
          ]
        }
      ]
    };
    expect(i18nTransformer(resp)).toEqual({
      remediations: [
        {
          name: 'challenge-authenticator',
          uiSchema: [
            {
              'name': 'credentials.passcode',
              'label': 'unit test - password authenticator',
              'secret': true,
              'label-top': true,
              'type': 'password',
              'params': { 'showPasswordToggle': true }
            }
          ]
        }
      ]
    });
  });

  it('converts label for challenge-authenticator - security question', () => {
    const resp = {
      remediations: [
        {
          name: 'challenge-authenticator',
          relatesTo: {
            value: {
              type: 'security_question',
              key: 'security_question'
            }
          },
          uiSchema: [
            {
              'name': 'credentials.questionKey',
              'label': 'Where did you go for your favorite vacation?',
              'required': true,
              'value': 'favorite_vacation_location',
              'visible': false,
              'label-top': true,
              'type': 'text'
            },
            {
              'name': 'credentials.answer',
              'label': 'answer',
              'required': true,
              'label-top': true,
              'type': 'text'
            }
          ]
        }
      ]
    };
    expect(i18nTransformer(resp)).toEqual({
      remediations: [
        {
          name: 'challenge-authenticator',
          relatesTo: {
            value: {
              type: 'security_question',
              key: 'security_question'
            }
          },
          uiSchema: [
            {
              'name': 'credentials.questionKey',
              'label': 'unit test - vacation location answer',
              'required': true,
              'value': 'favorite_vacation_location',
              'visible': false,
              'label-top': true,
              'type': 'text'
            },
            {
              'name': 'credentials.answer',
              'label': 'unit test - answer',
              'required': true,
              'label-top': true,
              'type': 'text'
            }
          ]
        }
      ]
    });
  });

  it('converts label for challenge-authenticator - okta verify totp', () => {
    const resp = {
      remediations: [
        {
          relatesTo: {
            value: {
              type: 'app',
              key: 'okta_verify'
            }
          },
          name: 'challenge-authenticator',
          uiSchema: [
            {
              label: 'Enter code from Okta Verify app',
              'label-top': true,
              name: 'credentials.totp',
              type: 'text',
            }
          ]
        }
      ]
    };
    expect(i18nTransformer(resp)).toEqual({
      remediations: [
        {
          relatesTo: {
            value: {
              type: 'app',
              key: 'okta_verify'
            }
          },
          name: 'challenge-authenticator',
          uiSchema: [
            {
              label: 'unit test - enter totp code',
              'label-top': true,
              name: 'credentials.totp',
              type: 'text',
            }
          ]
        }
      ]
    });
  });

  it('converts label for reset-authenticator - password', () => {
    const resp = {
      remediations: [
        {
          relatesTo: {
            value: {
              type: 'password',
              key: 'okta_password'
            }
          },
          name: 'reset-authenticator',
          uiSchema: [
            {
              'name': 'credentials.passcode',
              'label': 'New password',
              'secret': true,
              'label-top': true,
              'type': 'password',
              'params': { 'showPasswordToggle': true }
            }
          ]
        }
      ]
    };
    expect(i18nTransformer(resp)).toEqual({
      remediations: [
        {
          relatesTo: {
            value: {
              type: 'password',
              key: 'okta_password'
            }
          },
          name: 'reset-authenticator',
          uiSchema: [
            {
              'name': 'credentials.passcode',
              'label': 'unit test - new password',
              'secret': true,
              'label-top': true,
              'type': 'password',
              'params': { 'showPasswordToggle': true }
            }
          ]
        }
      ]
    });
  });

  it('converts label for reenroll-authenticator - password', () => {
    const resp = {
      remediations: [
        {
          relatesTo: {
            value: {
              type: 'password',
              key: 'okta_password'
            }
          },
          name: 'reenroll-authenticator',
          uiSchema: [
            {
              'name': 'credentials.passcode',
              'label': 'New password',
              'secret': true,
              'label-top': true,
              'type': 'password',
              'params': { 'showPasswordToggle': true }
            }
          ]
        }
      ]
    };
    expect(i18nTransformer(resp)).toEqual({
      remediations: [
        {
          relatesTo: {
            value: {
              type: 'password',
              key: 'okta_password'
            }
          },
          name: 'reenroll-authenticator',
          uiSchema: [
            {
              'name': 'credentials.passcode',
              'label': 'unit test - new password',
              'secret': true,
              'label-top': true,
              'type': 'password',
              'params': { 'showPasswordToggle': true }
            }
          ]
        }
      ]
    });
  });

  it('converts label for reenroll-authenticator-warning - password', () => {
    const resp = {
      remediations: [
        {
          relatesTo: {
            value: {
              type: 'password',
              key: 'okta_password'
            }
          },
          name: 'reenroll-authenticator-warning',
          uiSchema: [
            {
              'name': 'credentials.passcode',
              'label': 'New password',
              'secret': true,
              'label-top': true,
              'type': 'password',
              'params': { 'showPasswordToggle': true }
            }
          ]
        }
      ]
    };
    expect(i18nTransformer(resp)).toEqual({
      remediations: [
        {
          relatesTo: {
            value: {
              type: 'password',
              key: 'okta_password'
            }
          },
          name: 'reenroll-authenticator-warning',
          uiSchema: [
            {
              'name': 'credentials.passcode',
              'label': 'unit test - new password',
              'secret': true,
              'label-top': true,
              'type': 'password',
              'params': { 'showPasswordToggle': true }
            }
          ]
        }
      ]
    });
  });

  it('converts label for challenge-authenticator - google authenticator otp', () => {
    const resp = {
      remediations: [
        {
          relatesTo: {
            value: {
              type: 'app',
              key: 'google_otp'
            }
          },
          name: 'challenge-authenticator',
          uiSchema: [
            {
              label: 'Enter your Google Authenticator passcode',
              'label-top': true,
              name: 'credentials.passcode',
              type: 'text',
            }
          ]
        }
      ]
    };
    expect(i18nTransformer(resp)).toEqual({
      remediations: [
        {
          relatesTo: {
            value: {
              type: 'app',
              key: 'google_otp'
            }
          },
          name: 'challenge-authenticator',
          uiSchema: [
            {
              label: 'unit test - enter passcode',
              'label-top': true,
              name: 'credentials.passcode',
              type: 'text',
            }
          ]
        }
      ]
    });
  });

  it('converts label for select-authenticator-enroll', () => {
    const resp = {
      remediations: [
        {
          name: 'select-authenticator-enroll',
          uiSchema: [
            {
              'label-top': true,
              name: 'authenticator',
              required: true,
              type: 'authenticatorEnrollSelect',
              options: [
                {
                  label: 'Okta Password',
                  value: { id: 'autwa6eD9o02iBbtv0g3' },
                  authenticatorKey: 'okta_password'
                },
                {
                  label: 'Okta Phone',
                  value: { id: 'aid568g3mXgtID0X1SLH' },
                  authenticatorKey: 'phone_number'
                },
                {
                  label: 'Security Key or Biometric Authenticator (FIDO2)',
                  value: { id: 'aidtheidkwh282hv8g3' },
                  authenticatorKey: 'webauthn'
                },
                {
                  label: 'Okta Security Question',
                  value: { id: 'aid568g3mXgtID0X1GGG' },
                  authenticatorKey: 'security_question'
                },
                {
                  label: 'Google Authenticator',
                  value: { id: 'autwa6eD9o02iCbtv0g3' },
                  authenticatorKey: 'google_otp'
                },
                {
                  label: 'RSA SecurID',
                  value: { id: 'autwa6eD9o02iCbtv0g3' },
                  authenticatorKey: 'rsa_token'
                },
              ]
            }
          ]
        }
      ]
    };
    expect(i18nTransformer(resp)).toEqual({
      remediations: [
        {
          name: 'select-authenticator-enroll',
          uiSchema: [
            {
              'label-top': true,
              name: 'authenticator',
              required: true,
              type: 'authenticatorEnrollSelect',
              options: [
                {
                  label: 'unit test - password authenticator',
                  value: { id: 'autwa6eD9o02iBbtv0g3' },
                  authenticatorKey: 'okta_password'
                },
                {
                  label: 'unit test - phone authenticator',
                  value: { id: 'aid568g3mXgtID0X1SLH' },
                  authenticatorKey: 'phone_number',
                },
                {
                  label: 'Security Key or Biometric Authenticator (FIDO2)',
                  value: { id: 'aidtheidkwh282hv8g3' },
                  authenticatorKey: 'webauthn'
                },
                {
                  label: 'unit test - security question authenticator',
                  value: { id: 'aid568g3mXgtID0X1GGG' },
                  authenticatorKey: 'security_question'
                }, {
                  label: 'unit test - google authenticator',
                  value: { id: 'autwa6eD9o02iCbtv0g3' },
                  authenticatorKey: 'google_otp'
                }, {
                  label: 'unit test - rsa',
                  value: { id: 'autwa6eD9o02iCbtv0g3' },
                  authenticatorKey: 'rsa_token'
                },
              ]
            }
          ]
        }
      ]
    });
  });

  it('converts labels for enroll-authenticator-data - phone', () => {
    const resp = {
      remediations: [
        {
          name: 'authenticator-enrollment-data',
          relatesTo: {
            value: {
              type: 'phone',
              key: 'phone_number'
            }
          },
          uiSchema: [
            {
              'name': 'authenticator.methodType',
              'required': true,
              'options': [
                {
                  'label': 'Voice call',
                  'value': 'voice'
                },
                {
                  'label': 'SMS',
                  'value': 'sms'
                },
              ],
              'type': 'radio'
            },
            {
              'name': 'authenticator.phoneNumber',
              'required': true,
              'type': 'text',
              'label': 'Phone number',
              'label-top': true
            }
          ]
        }
      ]
    };

    expect(i18nTransformer(resp)).toEqual({
      remediations: [
        {
          name: 'authenticator-enrollment-data',
          relatesTo: {
            value: {
              type: 'phone',
              key: 'phone_number'
            }
          },
          uiSchema: [
            {
              'name': 'authenticator.methodType',
              'required': true,
              'options': [
                {
                  'label': 'unit test - voice call',
                  'value': 'voice'
                },
                {
                  'label': 'unit test - sms',
                  'value': 'sms'
                }
              ],
              'type': 'radio'
            },
            {
              'name': 'authenticator.phoneNumber',
              'required': true,
              'type': 'text',
              'label': 'unit test - phone number',
              'label-top': true
            }
          ]
        }
      ]
    });
  });

  it('converts label for enroll-authenticator - phone', () => {
    const resp = {
      remediations: [
        {
          name: 'enroll-authenticator',
          relatesTo: {
            value: {
              type: 'phone',
              key: 'phone_number',
              methods:[{
                type: 'sms',
              }]
            }
          },
          uiSchema: [
            {
              'name': 'credentials.passcode',
              'label': 'Enter password',
              'secret': true,
              'label-top': true,
              'type': 'password',
              'params': {
                'showPasswordToggle': true
              }
            }
          ]
        }
      ]
    };

    expect(i18nTransformer(resp)).toEqual({
      remediations: [
        {
          name: 'enroll-authenticator',
          relatesTo: {
            value: {
              type: 'phone',
              key: 'phone_number',
              methods:[{
                // This is not expected to be translated for enroll-authenticator.
                type: 'sms',
              }]
            }
          },
          uiSchema: [
            {
              'name': 'credentials.passcode',
              'label': 'unit test - enter code',
              'secret': true,
              'label-top': true,
              'type': 'password',
              'params': {
                'showPasswordToggle': true
              }
            }
          ]
        }
      ]
    });
  });

  it('converts label for enroll-authenticator - email', () => {
    const resp = {
      remediations: [
        {
          name: 'enroll-authenticator',
          relatesTo: {
            value: {
              type: 'email',
              key: 'okta_email',
              'displayName': 'Email',
              'methods': [
                {
                  'type': 'email'
                }
              ]
            }
          },
          uiSchema: [
            {
              'name': 'credentials.passcode',
              'label': 'Enter code',
              'required': true,
              'label-top': true,
              'type': 'password',
              'params': {
                'showPasswordToggle': true
              }
            }
          ]
        }
      ]
    };

    expect(i18nTransformer(resp)).toEqual({
      remediations: [
        {
          name: 'enroll-authenticator',
          relatesTo: {
            value: {
              type: 'email',
              key: 'okta_email',
              'displayName': 'Email',
              'methods': [
                {
                  'type': 'email'
                }
              ]
            }
          },
          uiSchema: [
            {
              'name': 'credentials.passcode',
              'label': 'unit test - enter code',
              'required': true,
              'label-top': true,
              'type': 'password',
              'params': {
                'showPasswordToggle': true
              }
            }
          ]
        }
      ]
    });
  });

  it('converts label for enroll-authenticator - password', () => {
    const resp = {
      remediations: [
        {
          name: 'enroll-authenticator',
          relatesTo: {
            value: {
              type: 'password',
              key: 'okta_password'
            }
          },
          uiSchema: [
            {
              'name': 'credentials.passcode',
              'label': 'Enter password',
              'secret': true,
              'label-top': true,
              'type': 'password',
              'params': {
                'showPasswordToggle': true
              }
            }
          ]
        }
      ]
    };
    expect(i18nTransformer(resp)).toEqual({
      remediations: [
        {
          name: 'enroll-authenticator',
          relatesTo: {
            value: {
              type: 'password',
              key: 'okta_password'
            }
          },
          uiSchema: [
            {
              'name': 'credentials.passcode',
              'label': 'unit test - enter password',
              'secret': true,
              'label-top': true,
              'type': 'password',
              'params': {
                'showPasswordToggle': true
              }
            }
          ]
        }
      ]
    });
  });

  it('converts label for enroll-authenticator - security question', () => {
    const resp = {
      remediations: [
        {
          name: 'enroll-authenticator',
          relatesTo: {
            value: {
              type: 'security_question',
              key: 'security_question'
            }
          },
          uiSchema: [
            {
              'name': 'sub_schema_local_credentials',
              'type': 'radio',
              'required': true,
              'value': '0',
              'options': [
                {
                  'label': 'Choose a security question',
                  'value': 0
                },
                {
                  'label': 'Create my own security question',
                  'value': 1
                }
              ],
              'label-top': true,
              'optionsUiSchemas': [
                [
                  {
                    'name': 'credentials.questionKey',
                    'type': 'select',
                    'required': true,
                    'label': 'Choose a security question',
                    'options': {
                      'disliked_food': 'What is the food you least liked as a child?',
                      'name_of_first_plush_toy': 'What is the name of your first stuffed animal?',
                      'favorite_vacation_location': 'Where did you go for your favorite vacation?'
                    },
                    'label-top': true,
                    'wide': true
                  },
                  {
                    'name': 'credentials.answer',
                    'label': 'Answer',
                    'required': true,
                    'secret': true,
                    'label-top': true,
                    'type': 'password',
                    'params': {
                      'showPasswordToggle': true
                    }
                  }
                ],
                [
                  {
                    'name': 'credentials.questionKey',
                    'required': true,
                    'value': 'custom',
                    'mutable': false,
                    'label-top': true,
                    'type': 'text'
                  },
                  {
                    'name': 'credentials.question',
                    'label': 'Create a security question',
                    'required': true,
                    'label-top': true,
                    'type': 'text'
                  },
                  {
                    'name': 'credentials.answer',
                    'label': 'Answer',
                    'required': true,
                    'secret': true,
                    'label-top': true,
                    'type': 'password',
                    'params': {
                      'showPasswordToggle': true
                    }
                  }
                ]
              ]
            }
          ]
        }
      ]
    };
    expect(i18nTransformer(resp)).toEqual({
      remediations: [
        {
          name: 'enroll-authenticator',
          relatesTo: {
            value: {
              type: 'security_question',
              key: 'security_question'
            }
          },
          uiSchema: [
            {
              'name': 'sub_schema_local_credentials',
              'type': 'radio',
              'required': true,
              'value': '0',
              'options': [
                {
                  'label': 'unit test - choose a question',
                  'value': 0
                },
                {
                  'label': 'unit test - create a question',
                  'value': 1
                }
              ],
              'label-top': true,
              'optionsUiSchemas': [
                [
                  {
                    'name': 'credentials.questionKey',
                    'type': 'select',
                    'required': true,
                    'label': 'unit test - choose a question',
                    'options': {
                      'disliked_food': 'unit test - dislike food answer',
                      'name_of_first_plush_toy': 'unit test - first plush toy answer',
                      'favorite_vacation_location': 'unit test - vacation location answer',
                    },
                    'label-top': true,
                    'wide': true
                  },
                  {
                    'name': 'credentials.answer',
                    'label': 'unit test - answer',
                    'required': true,
                    'secret': true,
                    'label-top': true,
                    'type': 'password',
                    'params': {
                      'showPasswordToggle': true
                    }
                  }
                ],
                [
                  {
                    'name': 'credentials.questionKey',
                    'required': true,
                    'value': 'custom',
                    'mutable': false,
                    'label-top': true,
                    'type': 'text'
                  },
                  {
                    'name': 'credentials.question',
                    'label': 'unit test - create a question',
                    'required': true,
                    'label-top': true,
                    'type': 'text'
                  },
                  {
                    'name': 'credentials.answer',
                    'label': 'unit test - answer',
                    'required': true,
                    'secret': true,
                    'label-top': true,
                    'type': 'password',
                    'params': {
                      'showPasswordToggle': true
                    }
                  }
                ]
              ]
            }
          ]
        }

      ]
    });
  });

  it('converts messages', () => {
    const resp = {
      messages: {
        value: [
          {
            'message': 'unit test - To finish signing in, check your email.',
            'i18n': {
              'key': 'idx.email.verification.required'
            },
            'class': 'INFO'
          },
          {
            'message': 'The session has expired.',
            'i18n': {
              'key': 'idx.session.expired'
            },
            'class': 'ERROR'
          },
          {
            'message': 'Authentication failed after password update.',
            'i18n': {
              'key': 'api.users.auth.error.POST_PASSWORD_UPDATE_AUTH_FAILURE'
            },
            'class': 'ERROR'
          },
          {
            'message': 'another {0} message',
            'i18n': {
              'key': 'idx.foo',
              'params': [
                'Email'
              ]
            },
            'class': 'INFO'
          }
        ]
      }
    };
    expect(i18nTransformer(resp)).toEqual({
      messages: {
        value: [
          {
            'message': 'unit test - To finish signing in, check your email.',
            'i18n': {
              'key': 'idx.email.verification.required'
            },
            'class': 'INFO'
          },
          {
            'message': 'unit test - The session has expired.',
            'i18n': {
              'key': 'idx.session.expired'
            },
            'class': 'ERROR'
          },
          {
            'message': 'unit test - Authentication failed after password update.',
            'i18n': {
              'key': 'api.users.auth.error.POST_PASSWORD_UPDATE_AUTH_FAILURE'
            },
            'class': 'ERROR'
          },
          {
            'message': 'unit test - hello the Email authenticator',
            'i18n': {
              'key': 'idx.foo',
              'params': [
                'Email'
              ]
            },
            'class': 'INFO'
          }
        ]
      }
    });
  });

  it('converts errors.E0000113 message', () => {
    const resp = {
      messages: {
        value: [
          {
            'message': 'error from rsa',
            'i18n': {
              'key': 'errors.E0000113',
              'params': ['error from rsa']
            },
            'class': 'ERROR'
          },
          {
            'message': 'another {0} message',
            'i18n': {
              'key': 'idx.foo',
              'params': [
                'Atko custom on-prem'
              ]
            },
            'class': 'INFO'
          }
        ]
      }
    };
    expect(i18nTransformer(resp)).toEqual({
      messages: {
        value: [
          {
            'message': 'unit test - error from rsa',
            'i18n': {
              'key': 'errors.E0000113',
              'params': ['error from rsa']
            },
            'class': 'ERROR'
          },
          {
            'message': 'unit test - hello the Atko custom on-prem authenticator',
            'i18n': {
              'key': 'idx.foo',
              'params': [
                'Atko custom on-prem'
              ]
            },
            'class': 'INFO'
          }
        ]
      }
    });
  });

  it('does not convert a label if no such key exists', () => {
    const resp = {
      remediations: [
        {
          relatesTo: {
            value: {
              type: 'password',
              key: 'okta_password'
            }
          },
          name: 'challenge-authenticator',
          uiSchema: [
            {
              'name': 'non.existent.key',
              'label': 'Type Passcode',
              'secret': true,
              'label-top': true,
              'type': 'password',
              'params': { 'showPasswordToggle': true }
            }
          ]
        }
      ]
    };
    expect(i18nTransformer(resp)).toEqual({
      remediations: [
        {
          relatesTo: {
            value: {
              type: 'password',
              key: 'okta_password'
            }
          },
          name: 'challenge-authenticator',
          uiSchema: [
            {
              'name': 'non.existent.key',
              'label': 'Type Passcode',
              'secret': true,
              'label-top': true,
              'type': 'password',
              'params': { 'showPasswordToggle': true }
            }
          ]
        }
      ]
    });
  });

  it('should not converts label for challenge-authenticator - security question for customized question', () => {
    const resp = {
      remediations: [
        {
          name: 'challenge-authenticator',
          relatesTo: {
            value: {
              type: 'security_question'
            }
          },
          uiSchema: [
            {
              'name': 'credentials.questionKey',
              'label': 'Which is your favourite stock',
              'required': true,
              'value': 'custom',
              'visible': false,
              'label-top': true,
              'type': 'text'
            },
            {
              'name': 'credentials.answer',
              'label': 'answer',
              'required': true,
              'label-top': true,
              'type': 'text'
            }
          ]
        }
      ]
    };
    expect(i18nTransformer(resp)).toEqual({
      remediations: [
        {
          name: 'challenge-authenticator',
          relatesTo: {
            value: {
              type: 'security_question'
            }
          },
          uiSchema: [
            {
              'name': 'credentials.questionKey',
              'label': 'Which is your favourite stock',
              'required': true,
              'value': 'custom',
              'visible': false,
              'label-top': true,
              'type': 'text'
            },
            {
              'name': 'credentials.answer',
              'label': 'answer',
              'required': true,
              'label-top': true,
              'type': 'text'
            }
          ]
        }
      ]
    });
  });

  it('converts label for enroll-authenticator - google authenticator', () => {
    const resp = {
      remediations: [
        {
          name: 'enroll-authenticator',
          relatesTo: {
            value: {
              type: 'app',
              key: 'google_otp'
            }
          },
          uiSchema: [
            {
              'name': 'sub_schema_local_credentials',
              'type': 'radio',
              'required': true,
              'value': '0',
              'label-top': true,
              'optionsUiSchemas': [
                [
                  {
                    name: 'credentials.passcode',
                    label: 'Enter code',
                    required: true,
                    visible: true
                  }
                ]
              ]
            }
          ]
        }
      ]
    };
    expect(i18nTransformer(resp)).toEqual({
      remediations: [
        {
          name: 'enroll-authenticator',
          relatesTo: {
            value: {
              type: 'app',
              key: 'google_otp'
            }
          },
          uiSchema: [
            {
              'name': 'sub_schema_local_credentials',
              'type': 'radio',
              'required': true,
              'value': '0',
              'label-top': true,
              'optionsUiSchemas': [
                [
                  {
                    'name': 'credentials.passcode',
                    'label': 'unit test - enter passcode',
                    'required': true,
                    'visible': true,
                  }
                ]
              ]
            }
          ]
        }
      ]
    });
  });

  it('converts label for enroll-authenticator - on prem authenticator', () => {
    const resp = {
      remediations: [
        {
          name: 'enroll-authenticator',
          relatesTo: {
            value: {
              type: 'security_key',
              key: 'onprem_mfa',
              displayName: 'on-prem auth'
            }
          },
          uiSchema: [
            {
              'optionsUiSchemas': [
                [
                  {
                    'label': 'User Name',
                    'label-top': true,
                    'name': 'credentials.clientData',
                    'required': true,
                    'type': 'text',
                    'value': 'rsa_username'
                  },
                  {
                    'label': 'Passcode',
                    'label-top': true,
                    'name': 'credentials.passcode',
                    'required': true,
                    'type': 'text'
                  }
                ]
              ]
            }
          ]
        }
      ]
    };
    expect(i18nTransformer(resp)).toEqual({
      remediations: [
        {
          name: 'enroll-authenticator',
          relatesTo: {
            value: {
              type: 'security_key',
              key: 'onprem_mfa',
              displayName: 'on-prem auth'
            }
          },
          uiSchema: [
            {
              'optionsUiSchemas': [
                [
                  {
                    'label': 'unit test - enter on-prem auth username',
                    'label-top': true,
                    'name': 'credentials.clientData',
                    'required': true,
                    'type': 'text',
                    'value': 'rsa_username'
                  },
                  {
                    'label': 'unit test - enter on-prem auth passcode',
                    'label-top': true,
                    'name': 'credentials.passcode',
                    'required': true,
                    'type': 'text'
                  }
                ]
              ]
            }
          ]
        }
      ]
    });
  });

  it('converts label for challenge-authenticator - on prem authenticator', () => {
    const resp = {
      remediations: [
        {
          relatesTo: {
            value: {
              type: 'security_key',
              key: 'onprem_mfa'
            }
          },
          name: 'challenge-authenticator',
          uiSchema: [
            {
              'label': 'Enter code',
              'label-top': true,
              'name': 'credentials.passcode',
              'type': 'text'
            }
          ]
        }
      ]
    };
    expect(i18nTransformer(resp)).toEqual({
      remediations: [
        {
          relatesTo: {
            value: {
              type: 'security_key',
              key: 'onprem_mfa'
            }
          },
          name: 'challenge-authenticator',
          uiSchema: [
            {
              'label': 'unit test - enter code',
              'label-top': true,
              'name': 'credentials.passcode',
              'type': 'text'
            }
          ]
        }
      ]
    });
  });

  it('converts label for enroll-authenticator - rsa authenticator', () => {
    const resp = {
      remediations: [
        {
          name: 'enroll-authenticator',
          relatesTo: {
            value: {
              type: 'security_key',
              key: 'rsa_token',
              displayName: 'rsa auth'
            }
          },
          uiSchema: [
            {
              'optionsUiSchemas': [
                [
                  {
                    'label': 'User Name',
                    'label-top': true,
                    'name': 'credentials.clientData',
                    'required': true,
                    'type': 'text',
                    'value': 'rsa_username'
                  },
                  {
                    'label': 'Passcode',
                    'label-top': true,
                    'name': 'credentials.passcode',
                    'required': true,
                    'type': 'text'
                  }
                ]
              ]
            }
          ]
        }
      ]
    };
    expect(i18nTransformer(resp)).toEqual({
      remediations: [
        {
          name: 'enroll-authenticator',
          relatesTo: {
            value: {
              type: 'security_key',
              key: 'rsa_token',
              displayName: 'rsa auth'
            }
          },
          uiSchema: [
            {
              'optionsUiSchemas': [
                [
                  {
                    'label': 'unit test - enter rsa auth username',
                    'label-top': true,
                    'name': 'credentials.clientData',
                    'required': true,
                    'type': 'text',
                    'value': 'rsa_username'
                  },
                  {
                    'label': 'unit test - enter rsa auth passcode',
                    'label-top': true,
                    'name': 'credentials.passcode',
                    'required': true,
                    'type': 'text'
                  }
                ]
              ]
            }
          ]
        }
      ]
    });
  });

  it('converts label for challenge-authenticator - rsa authenticator', () => {
    const resp = {
      remediations: [
        {
          relatesTo: {
            value: {
              type: 'security_key',
              key: 'rsa_token'
            }
          },
          name: 'challenge-authenticator',
          uiSchema: [
            {
              'label': 'Enter code',
              'label-top': true,
              'name': 'credentials.passcode',
              'type': 'text'
            }
          ]
        }
      ]
    };
    expect(i18nTransformer(resp)).toEqual({
      remediations: [
        {
          relatesTo: {
            value: {
              type: 'security_key',
              key: 'rsa_token'
            }
          },
          name: 'challenge-authenticator',
          uiSchema: [
            {
              'label': 'unit test - enter code',
              'label-top': true,
              'name': 'credentials.passcode',
              'type': 'text'
            }
          ]
        }
      ]
    });
  });

  it('converts label for challenge-authenticator - custom otp authenticator', () => {
    const resp = {
      remediations: [
        {
          relatesTo: {
            value: {
              type: 'security_key',
              key: 'custom_otp'
            }
          },
          name: 'challenge-authenticator',
          uiSchema: [
            {
              'label': 'Enter code',
              'label-top': true,
              'name': 'credentials.passcode',
              'type': 'text'
            }
          ]
        }
      ]
    };
    expect(i18nTransformer(resp)).toEqual({
      remediations: [
        {
          relatesTo: {
            value: {
              type: 'security_key',
              key: 'custom_otp'
            }
          },
          name: 'challenge-authenticator',
          uiSchema: [
            {
              'label': 'unit test - enter passcode',
              'label-top': true,
              'name': 'credentials.passcode',
              'type': 'text'
            }
          ]
        }
      ]
    });
  });

  it('should get email label if it defined on enrollment-channel-data', () => {
    const resp = {
      remediations: [{
        name: 'enrollment-channel-data',
        value: [{
          label: 'Email',
          name: 'email',
          required: true,
          visible: true
        }],
        uiSchema: [{
          label: 'Email',
          name: 'email',
          required: true,
          visible: true,
          'label-top': true,
          'data-se': 'o-form-fieldset-email',
          type: 'text'
        }]
      }],
    };

    expect(i18nTransformer(resp)).toEqual({
      'remediations': [{
        name: 'enrollment-channel-data',
        'value': [{
          'label': 'Email',
          'name': 'email',
          'required': true,
          'visible': true
        }],
        'uiSchema': [{
          'label': 'unit test - email',
          'name': 'email',
          'required': true,
          'visible': true,
          'label-top': true,
          'data-se': 'o-form-fieldset-email',
          'type': 'text'
        }]
      }],
    });
  });

  describe('getMessageKey', () => {
    it('gets message key', () => {
      const message =
      {
        'message': 'To finish signing in, check your email.',
        'i18n': {
          'key': 'idx.email.verification.required'
        },
        'class': 'INFO'
      };
      expect(getMessageKey(message)).toEqual('idx.email.verification.required');
    });
  });

  describe('getI18NParams', () => {
    it('gets message params for enroll-authenticator rsa / on-prem', () => {
      const remediation =
      {
        'name': 'enroll-authenticator',
        'relatesTo': {
          'value': {
            'displayName': 'Atko authenticator'
          }
        }
      };
      expect(getI18NParams(remediation, 'rsa_token')).toEqual(['Atko authenticator']);
      expect(getI18NParams(remediation, 'onprem_mfa')).toEqual(['Atko authenticator']);
    });

    it('does not get message params for challenge-authenticator rsa / on-prem', () => {
      const remediation =
      {
        'name': 'challenge-authenticator',
        'relatesTo': {
          'value': {
            'displayName': 'Atko authenticator'
          }
        }
      };
      expect(getI18NParams(remediation, 'rsa_token')).toEqual([]);
      expect(getI18NParams(remediation, 'onprem_mfa')).toEqual([]);
    });

    it('does not get message params for enroll-authenticator google authenticator', () => {
      const remediation =
      {
        'name': 'enroll-authenticator',
        'relatesTo': {
          'value': {
            'displayName': 'Atko authenticator'
          }
        }
      };
      expect(getI18NParams(remediation, 'google_otp')).toEqual([]);
    });
  });

  describe('getMessageFromBrowserError', () => {
    it('should get translated error message if the browser thrown error supported in our i18n bundle', () => {
      expect(getMessageFromBrowserError({
        message: 'browser message',
        name: 'NotAllowedError'
      })).toEqual('unit test - translated browser thrown error');
    });
  
    it('should get original message if the browser thrown error is not supported in our i18n bundle', () => {
      expect(getMessageFromBrowserError({
        message: 'browser message',
        name: 'UnsupportedErrorName'
      })).toEqual('browser message');
    });
  });

  describe('getMessage', () => {
    const expectedWebAuthnGenericError = 'You are currently unable to use a Security key or biometric authenticator. Try again.';

    it.each([
      [
        'authfactor.webauthn.error.assertion_validation_failure',
        {
          message:'None of the WebAuthn authenticators the user has enrolled for was able to validate the assertion',
          i18n:{
            key:'authfactor.webauthn.error.assertion_validation_failure',
          }
        },
        expectedWebAuthnGenericError,
      ], [
        'authfactor.webauthn.error.authdata_validation_failure_during_authentication_challenge',
        {
          message:'Failed to validate authenticator data during WebAuthn verification.',
          i18n:{
            key:'authfactor.webauthn.error.authdata_validation_failure_during_authentication_challenge',
          }
        },
        expectedWebAuthnGenericError,
      ], [
        'authfactor.webauthn.error.clientdata_challenge_mismatch',
        {
          message:'Challenge in client data doesn\'t match with server side value',
          i18n:{
            key:'authfactor.webauthn.error.clientdata_challenge_mismatch',
          }
        },
        expectedWebAuthnGenericError,
      ], [
        'authfactor.webauthn.error.clientdata_challenge_missing',
        {
          message:'No challenge parameter in client data',
          i18n:{
            key:'authfactor.webauthn.error.clientdata_challenge_missing',
          }
        },
        expectedWebAuthnGenericError,
      ], [
        'authfactor.webauthn.error.signature_verification_failure',
        {
          message:'Signature verification was unsuccessful.',
          i18n:{
            key:'authfactor.webauthn.error.signature_verification_failure',
          }
        },
        expectedWebAuthnGenericError,
      ], [
        'authfactor.webauthn.error.clientdata_origin_missing',
        {
          message:'No origin parameter in client data',
          i18n:{
            key:'authfactor.webauthn.error.clientdata_origin_missing',
          }
        },
        expectedWebAuthnGenericError,
      ], [
        'authfactor.webauthn.error.clientdata_origin_mismatch',
        {
          message: 'Origin parameter in client data doesn\'t match. clientData origin was {0}',
          i18n: {
            key: 'authfactor.webauthn.error.clientdata_origin_mismatch',
            params: ['https://idx.okta1.com']
          },
        },
        expectedWebAuthnGenericError,
      ], [
        'authfactor.webauthn.error.clientdata_message_type_mismatch',
        {
          message: 'Message type in client data doesn\'t match expected message type.',
          i18n: {
            key: 'authfactor.webauthn.error.clientdata_message_type_mismatch',
          },
        },
        expectedWebAuthnGenericError,
      ], [
        'authfactor.webauthn.error.clientdata_parsing_failed',
        {
          message:'Client data parsing failed',
          i18n:{
            key:'authfactor.webauthn.error.clientdata_parsing_failed',
          },
        },
        expectedWebAuthnGenericError,
      ], [
        'authfactor.webauthn.error.invalid_enrollment_request_data',
        {
          message:'Invalid data in the WebAuthn enrollment request. {0}',
          i18n:{
            key:'authfactor.webauthn.error.invalid_enrollment_request_data',
            params: ['User present bit was not set'],
          },
        },
        expectedWebAuthnGenericError,
      ],[
        'oie.authenticator.duo.method.duo.verification_timeout',
        {
          message:'We did not hear back from Duo.',
          i18n:{
            key:'oie.authenticator.duo.method.duo.verification_timeout',
          },
        },
        'We were unable to verify with Duo. Try again.',
      ],[
        'oie.authenticator.duo.method.duo.verification_failed',
        {
          message:'Duo web signature verification failed.',
          i18n:{
            key:'oie.authenticator.duo.method.duo.verification_failed',
          },
        },
        'We were unable to verify with Duo. Try again.',
      ], [
        'authfactor.webauthn.not.known.api.error',
        {
          message:'This is not a api error that can be generic.',
          i18n:{
            key:'authfactor.webauthn.not.known.api.error',
          },
        },
        'This is not a api error that can be generic.',
      ],
    ])('should render correct error message by get key from API: %s', (key, error, expectedMessage) => {
      Bundles.login = originalLoginBundle;
      expect(Bundles.login[key]).toBeUndefined();
      expect(getMessage(error)).toEqual(expectedMessage);
    });

    it('returns an override key when present in the override map', () => {
      const key = 'api.authn.poll.error.push_rejected';
      const message = {
        message: 'some message',
        i18n: { key }
      };
      const widgetKey = 'oktaverify.rejected';
      expect(Bundles.login[key]).toBeUndefined();
      expect(getMessage(message)).toEqual(Bundles.login[widgetKey]);
    });

    it('uses an i18n key that includes the param if in I18N_OVERRIDE_WITH_PARAMS_MAP and has a known param', () => {
      const key = 'registration.error.invalidLoginEmail';
      const message = {
        message: 'some message',
        i18n: { key, params: ['Email'] },
      };
      const newKey = 'registration.error.invalidLoginEmail.Email';
      expect(Bundles.login[key]).toBeUndefined();
      expect(getMessage(message)).toEqual(Bundles.login[newKey]);
    });

    it('uses an i18n key that includes "custom" if in I18N_OVERRIDE_WITH_PARAMS_MAP and has an unknown param', () => {
      const key = 'registration.error.invalidLoginEmail';
      const message = {
        message: 'some message',
        i18n: { key, params: ['SecondEmail'] },
      };
      const newKey = 'registration.error.invalidLoginEmail.custom';
      expect(Bundles.login[key]).toBeUndefined();
      expect(getMessage(message).replace('SecondEmail', '{0}')).toEqual(Bundles.login[newKey]);
    });
  });
});
