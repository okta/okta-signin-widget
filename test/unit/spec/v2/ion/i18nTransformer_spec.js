import { _ } from 'okta';
import i18nTransformer from 'v2/ion/i18nTransformer';
import Bundles from 'util/Bundles';

describe.only('v2/ion/i18nTransformer', function () {
  let originalLoginBundle;

  beforeAll(() => {
    originalLoginBundle = Bundles.login;
    Bundles.login = _.mapObject({

      'oie.authenticator.email.label': 'email authenticator',
      'oie.authenticator.password.label': 'password authenticator',
      'oie.authenticator.phone.label': 'phone authenticator',
      'oie.webauthn': 'webauthn authenticator',
      'oie.authenticator.security.question.label': 'security question authenticator',

      'oie.password.passwordLabel': 'enter password',
      'oie.security.question.questionKey.label': 'choose a question',
      'oie.security.question.createQuestion.label': 'create a question',

      'mfa.phoneNumber.placeholder': 'phone number',
      'mfa.challenge.answer.placeholder': 'answer',
      'mfa.challenge.enterCode.placeholder': 'enter code',
      'mfa.challenge.password.placeholder': 'password',

      'primaryauth.password.placeholder': 'password',
      'primaryauth.username.placeholder': 'username',
      'remember': 'remember me',
      'security.disliked_food': 'dislike food answer',
      'security.name_of_first_plush_toy': 'first plush toy answer',
      'security.favorite_vacation_location': 'vacation location answer',

      'idx.email.verification.required': 'An email has been sent. Check your inbox.',
      'idx.foo': 'hello the {0} authenticator',

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
                  'authenticatorType': 'password'
                },
                {
                  'label': 'FIDO2 (WebAuthn)',
                  'value': {
                    'id': 'fwftheidkwh282hv8g3'
                  },
                  'authenticatorType': 'security_key'
                },
                {
                  'label': 'FIDO2 (WebAuthn)',
                  'value': {
                    'id': 'aidtheidkwh282hv8g3'
                  },
                  'authenticatorType': 'security_key'
                },
                {
                  'label': 'Okta Email',
                  'value': {
                    'id': 'aidtm56L8gXXHI1SD0g3'
                  },
                  'authenticatorType': 'email'
                },
                {
                  'label': 'Okta Phone',
                  'value': {
                    'id': 'aid568g3mXgtID0X1SLH'
                  },
                  'authenticatorType': 'phone'
                },
                {
                  'label': 'Okta Security Question',
                  'value': {
                    'id': 'aid568g3mXgtID0HHSLH'
                  },
                  'authenticatorType': 'security_question'
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
                  'authenticatorType': 'password'
                },
                {
                  'label': 'FIDO2 (WebAuthn)',
                  'value': {
                    'id': 'fwftheidkwh282hv8g3'
                  },
                  'authenticatorType': 'security_key'
                },
                {
                  'label': 'FIDO2 (WebAuthn)',
                  'value': {
                    'id': 'aidtheidkwh282hv8g3'
                  },
                  'authenticatorType': 'security_key'
                },
                {
                  'label': 'unit test - email authenticator',
                  'value': {
                    'id': 'aidtm56L8gXXHI1SD0g3'
                  },
                  'authenticatorType': 'email'
                },
                {
                  'label': 'unit test - phone authenticator',
                  'value': {
                    'id': 'aid568g3mXgtID0X1SLH'
                  },
                  'authenticatorType': 'phone'
                },
                {
                  'label': 'unit test - security question authenticator',
                  'value': {
                    'id': 'aid568g3mXgtID0HHSLH'
                  },
                  'authenticatorType': 'security_question'
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
              type: 'email'
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
              type: 'email'
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
              type: 'phone'
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
              type: 'phone'
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
              type: 'password'
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
              type: 'password'
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
              type: 'security_question'
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
              type: 'security_question'
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
                  authenticatorType: 'password'
                },
                {
                  label: 'Okta Phone',
                  value: { id: 'aid568g3mXgtID0X1SLH' },
                  authenticatorType: 'phone'
                },
                {
                  label: 'Security Key or Biometric Authenticator (FIDO2)',
                  value: { id: 'aidtheidkwh282hv8g3' },
                  authenticatorType: 'security_key'
                },
                {
                  label: 'Okta Security Question',
                  value: { id: 'aid568g3mXgtID0X1GGG' },
                  authenticatorType: 'security_question'
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
                  authenticatorType: 'password'
                },
                {
                  label: 'unit test - phone authenticator',
                  value: { id: 'aid568g3mXgtID0X1SLH' },
                  authenticatorType: 'phone'
                },
                {
                  label: 'Security Key or Biometric Authenticator (FIDO2)',
                  value: { id: 'aidtheidkwh282hv8g3' },
                  authenticatorType: 'security_key'
                },
                {
                  label: 'unit test - security question authenticator',
                  value: { id: 'aid568g3mXgtID0X1GGG' },
                  authenticatorType: 'security_question'
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
              type: 'phone'
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
              type: 'phone'
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
              type: 'password'
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
              type: 'password'
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
              type: 'security_question'
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
              type: 'security_question'
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
              type: 'password'
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
              type: 'password'
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
});
