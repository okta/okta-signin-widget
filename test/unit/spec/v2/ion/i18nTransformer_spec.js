import { _ } from 'okta';
import i18nTransformer from 'v2/ion/i18nTransformer';
import { getMessageKey } from 'v2/ion/i18nTransformer';
import Bundles from 'util/Bundles';

describe('v2/ion/i18nTransformer', function () {
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
      'oie.security.question.questionKey.label': 'choose a question',
      'oie.security.question.createQuestion.label': 'create a question',
      'oie.google_authenticator.otp.title': 'enter otp code',

      'oie.on_prem.enroll.username.label': 'enter username',
      'oie.on_prem.enroll.passcode.label': 'enter passcode',
      'oie.on_prem.verify.passcode.label': 'enter passcode',

      'mfa.phoneNumber.placeholder': 'phone number',
      'mfa.challenge.answer.placeholder': 'answer',
      'mfa.challenge.enterCode.placeholder': 'enter code',
      'mfa.challenge.password.placeholder': 'password',
      'oie.okta_verify.totp.enterCodeText': 'enter totp code',
      'oie.google_authenticator.otp.enterCodeText': 'enter otp code',

      'primaryauth.password.placeholder': 'password',
      'primaryauth.username.placeholder': 'username',
      'remember': 'remember me',
      'security.disliked_food': 'dislike food answer',
      'security.name_of_first_plush_toy': 'first plush toy answer',
      'security.favorite_vacation_location': 'vacation location answer',

      'idx.email.verification.required': 'An email has been sent. Check your inbox.',
      'idx.foo': 'hello the {0} authenticator',

      'password.forgot.email.or.username.placeholder': 'email or username',

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
              placeholder: 'Remember Me',
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
              placeholder: 'unit test - remember me',
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
                  'authenticatorType': 'password',
                  'authenticatorKey': 'okta_password'
                },
                {
                  'label': 'FIDO2 (WebAuthn)',
                  'value': {
                    'id': 'fwftheidkwh282hv8g3'
                  },
                  'authenticatorType': 'security_key',
                  'authenticatorKey': 'webauthn'
                },
                {
                  'label': 'FIDO2 (WebAuthn)',
                  'value': {
                    'id': 'aidtheidkwh282hv8g3'
                  },
                  'authenticatorType': 'security_key',
                  'authenticatorKey': 'webauthn'
                },
                {
                  'label': 'Okta Email',
                  'value': {
                    'id': 'aidtm56L8gXXHI1SD0g3'
                  },
                  'authenticatorType': 'email',
                  'authenticatorKey': 'okta_email'

                },
                {
                  'label': 'Okta Phone',
                  'value': {
                    'id': 'aid568g3mXgtID0X1SLH'
                  },
                  'authenticatorType': 'phone',
                  'authenticatorKey': 'phone_number',
                },
                {
                  'label': 'Okta Security Question',
                  'value': {
                    'id': 'aid568g3mXgtID0HHSLH'
                  },
                  'authenticatorType': 'security_question',
                  'authenticatorKey': 'security_question'
                },
                {
                  'label': 'Use Okta FastPass',
                  'value': {
                    'id': 'aid568g3mXgtID0HHSLH',
                    'methodType': 'signed_nonce'
                  },
                  'authenticatorType': 'app',
                  'authenticatorKey': 'okta_verify'
                },
                {
                  'label': 'Get a push notification',
                  'value': {
                    'id': 'aid568g3mXgtID0HHSLH',
                    'methodType': 'push'
                  },
                  'authenticatorType': 'app',
                  'authenticatorKey': 'okta_verify'
                },
                {
                  'label': 'Enter a code',
                  'value': {
                    'id': 'aid568g3mXgtID0HHSLH',
                    'methodType': 'totp'
                  },
                  'authenticatorType': 'app',
                  'authenticatorKey': 'okta_verify'
                },
                {
                  'label': 'Enter a code',
                  'value': {
                    'id': 'aid568g3mCgtID0HHSLH',
                    'methodType': 'otp'
                  },
                  'authenticatorType': 'app',
                  'authenticatorKey': 'google_authenticator'
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
                  'authenticatorType': 'password',
                  'authenticatorKey': 'okta_password'
                },
                {
                  'label': 'FIDO2 (WebAuthn)',
                  'value': {
                    'id': 'fwftheidkwh282hv8g3'
                  },
                  'authenticatorType': 'security_key',
                  'authenticatorKey': 'webauthn'
                },
                {
                  'label': 'FIDO2 (WebAuthn)',
                  'value': {
                    'id': 'aidtheidkwh282hv8g3'
                  },
                  'authenticatorType': 'security_key',
                  'authenticatorKey': 'webauthn'
                },
                {
                  'label': 'unit test - email authenticator',
                  'value': {
                    'id': 'aidtm56L8gXXHI1SD0g3'
                  },
                  'authenticatorType': 'email',
                  'authenticatorKey': 'okta_email'
                },
                {
                  'label': 'unit test - phone authenticator',
                  'value': {
                    'id': 'aid568g3mXgtID0X1SLH'
                  },
                  'authenticatorType': 'phone',
                  'authenticatorKey': 'phone_number',
                },
                {
                  'label': 'unit test - security question authenticator',
                  'value': {
                    'id': 'aid568g3mXgtID0HHSLH'
                  },
                  'authenticatorType': 'security_question',
                  'authenticatorKey': 'security_question'
                },
                {
                  'label': 'unit test - okta verify fastpass',
                  'value': {
                    'id': 'aid568g3mXgtID0HHSLH',
                    'methodType': 'signed_nonce'
                  },
                  'authenticatorType': 'app',
                  'authenticatorKey': 'okta_verify'
                },
                {
                  'label': 'unit test - okta verify push',
                  'value': {
                    'id': 'aid568g3mXgtID0HHSLH',
                    'methodType': 'push'
                  },
                  'authenticatorType': 'app',
                  'authenticatorKey': 'okta_verify'
                },
                {
                  'label': 'unit test - okta verify totp',
                  'value': {
                    'id': 'aid568g3mXgtID0HHSLH',
                    'methodType': 'totp'
                  },
                  'authenticatorType': 'app',
                  'authenticatorKey': 'okta_verify'
                },
                {
                  'label': 'unit test - google authenticator',
                  'value': {
                    'id': 'aid568g3mCgtID0HHSLH',
                    'methodType': 'otp'
                  },
                  'authenticatorType': 'app',
                  'authenticatorKey': 'google_authenticator'
                }
              ],
              'label-top': true
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

  it('converts label for challenge-authenticator - password', () => {
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

  it('converts label for challenge-authenticator - google authenticator otp', () => {
    const resp = {
      remediations: [
        {
          relatesTo: {
            value: {
              type: 'app',
              key: 'google_authenticator'
            }
          },
          name: 'challenge-authenticator',
          uiSchema: [
            {
              label: 'Enter your Google Authenticator passcode',
              'label-top': true,
              name: 'credentials.otp',
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
              key: 'google_authenticator'
            }
          },
          name: 'challenge-authenticator',
          uiSchema: [
            {
              label: 'unit test - enter otp code',
              'label-top': true,
              name: 'credentials.otp',
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
                  authenticatorType: 'password',
                  authenticatorKey: 'okta_password'
                },
                {
                  label: 'Okta Phone',
                  value: { id: 'aid568g3mXgtID0X1SLH' },
                  authenticatorType: 'phone',
                  authenticatorKey: 'phone_number'
                },
                {
                  label: 'Security Key or Biometric Authenticator (FIDO2)',
                  value: { id: 'aidtheidkwh282hv8g3' },
                  authenticatorType: 'security_key',
                  authenticatorKey: 'webauthn'
                },
                {
                  label: 'Okta Security Question',
                  value: { id: 'aid568g3mXgtID0X1GGG' },
                  authenticatorType: 'security_question',
                  authenticatorKey: 'security_question'
                },
                {
                  label: 'Google Authenticator',
                  value: { id: 'autwa6eD9o02iCbtv0g3' },
                  authenticatorType: 'app',
                  authenticatorKey: 'google_authenticator'
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
                  authenticatorType: 'password',
                  authenticatorKey: 'okta_password'
                },
                {
                  label: 'unit test - phone authenticator',
                  value: { id: 'aid568g3mXgtID0X1SLH' },
                  authenticatorType: 'phone',
                  authenticatorKey: 'phone_number',
                },
                {
                  label: 'Security Key or Biometric Authenticator (FIDO2)',
                  value: { id: 'aidtheidkwh282hv8g3' },
                  authenticatorType: 'security_key',
                  authenticatorKey: 'webauthn'
                },
                {
                  label: 'unit test - security question authenticator',
                  value: { id: 'aid568g3mXgtID0X1GGG' },
                  authenticatorType: 'security_question',
                  authenticatorKey: 'security_question'
                }, {
                  label: 'unit test - google authenticator',
                  value: { id: 'autwa6eD9o02iCbtv0g3' },
                  authenticatorType: 'app',
                  authenticatorKey: 'google_authenticator'
                },
              ]
            }
          ]
        }
      ]
    });
  });

  it('converts label for enroll-authenticator-data - phone', () => {
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
                }
              ],
              'value': 'voice',
              'label-top': true,
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
                  'label': 'Voice call',
                  'value': 'voice'
                }
              ],
              'value': 'voice',
              'label-top': true,
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
            'message': 'An activation email has been sent to john@gmail.com.',
            'i18n': {
              'key': 'idx.email.verification.required'
            },
            'class': 'INFO'
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
            'message': 'unit test - An email has been sent. Check your inbox.',
            'i18n': {
              'key': 'idx.email.verification.required'
            },
            'class': 'INFO'
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
              key: 'google_authenticator'
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
                    name: 'credentials.otp',
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
              key: 'google_authenticator'
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
                    'name': 'credentials.otp',
                    'label': 'unit test - enter otp code',
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
              key: 'del_oath'
            }
          },
          uiSchema: [
            {
              'optionsUiSchemas': [
                [
                  {
                    'label': 'User Name',
                    'label-top': true,
                    'name': 'credentials.userName',
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
              key: 'del_oath'
            }
          },
          uiSchema: [
            {
              'optionsUiSchemas': [
                [
                  {
                    'label': 'unit test - enter username',
                    'label-top': true,
                    'name': 'credentials.userName',
                    'required': true,
                    'type': 'text',
                    'value': 'rsa_username'
                  },
                  {
                    'label': 'unit test - enter passcode',
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
              key: 'del_oath'
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
              key: 'del_oath'
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

  it('gets message key', () => {
    const message =
    {
      'message': 'An activation email has been sent to john@gmail.com.',
      'i18n': {
        'key': 'idx.email.verification.required'
      },
      'class': 'INFO'
    };
    expect(getMessageKey(message)).toEqual('idx.email.verification.required');
  });
});
