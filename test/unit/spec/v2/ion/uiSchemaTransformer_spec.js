import { _ } from 'okta';
import responseTransformer from 'v2/ion/responseTransformer';
import uiSchemaTransformer from 'v2/ion/uiSchemaTransformer';
import MockUtil from '../../../helpers/v2/MockUtil';

import XHREnrollProfile from '../../../../../playground/mocks/data/idp/idx/enroll-profile.json';
import XHRFactorRequiredEmail  from '../../../../../playground/mocks/data/idp/idx/factor-verification-email.json';
import XHRFactorEnrollOptions from '../../../../../playground/mocks/data/idp/idx/factor-enroll-options.json';
import XHRAuthenticatorRequiredEmail  from '../../../../../playground/mocks/data/idp/idx/authenticator-verification-email.json';
import XHRAuthenticatorEnrollOptions  from '../../../../../playground/mocks/data/idp/idx/authenticator-select-enroll-options.json';
import XHRAuthenticatorEnrollPhone  from '../../../../../playground/mocks/data/idp/idx/authenticator-enroll-phone.json';
import XHRAuthenticatorEnrollSecurityQuestion  from '../../../../../playground/mocks/data/idp/idx/authenticator-enroll-security-question.json';
import XHRIdentifyResponse from '../../../../../playground/mocks/data/idp/idx/identify.json';

describe('v2/ion/uiSchemaTransformer', function () {
  it('converts factor require email', (done) => {
    MockUtil.mockIntrospect(done, XHRFactorRequiredEmail, idxResp => {
      const result = _.compose(uiSchemaTransformer, responseTransformer)(idxResp);
      expect(result).toEqual({
        'factors': _.pick(XHRFactorRequiredEmail.factors, 'value'),
        'factor': XHRFactorRequiredEmail.factor.value,
        'user':{
          'id':'00usip1dptbE7NiLa0g3'
        },
        'remediations':[
          {
            'href': 'http://localhost:3000/idp/idx/challenge/answer',
            'name':'challenge-factor',
            'method':'POST',
            'rel': [ 'create-form' ],
            'accepts': 'application/vnd.okta.v1+json',
            'action': jasmine.any(Function),
            'value':[
              {
                'name':'credentials',
                'form':{
                  'value':[
                    {
                      'name':'passcode',
                      'label':'Enter code',
                    },
                  ]
                }
              },
              {
                name: 'stateHandle',
                required: true,
                value: '02WTSGqlHUPjoYvorz8T48txBIPe3VUisrQOY4g5N8',
                visible: false,
                mutable: false
              }
            ],
            'uiSchema':[
              {
                'name':'credentials.passcode',
                'label': 'Enter code',
                'label-top': true,
                'type': 'text'
              }
            ]
          },
          {
            'href': 'http://localhost:3000/idp/idx/challenge',
            'name':'select-factor-authenticate',
            'method':'POST',
            'rel': [ 'create-form' ],
            'accepts': 'application/vnd.okta.v1+json',
            'action': jasmine.any(Function),
            'value':[
              {
                'name':'factorId',
                'type':'string',
                'options':[
                  {
                    'label':'Password',
                    'value':'00u2j17ObFUsbGfLg0g4',
                    'factorType':'password'
                  },
                  {
                    'label':'Email',
                    'value':'emf2j1ccd6CF4IWFY0g3',
                    'factorType':'email'
                  }
                ]
              },
              {
                name: 'stateHandle',
                required: true,
                value: '02h50hMLvmuZUuoKCShHKZytlDeFRnn8KG-rcd8Ay5',
                visible: false,
                mutable: false
              }
            ],
            'uiSchema':[
              {
                'name':'factorId',
                'type':'factorSelect',
                'label-top': true,
                'options':[
                  {
                    'label':'Password',
                    'value':'00u2j17ObFUsbGfLg0g4',
                    'factorType':'password'
                  },
                  {
                    'label':'Email',
                    'value':'emf2j1ccd6CF4IWFY0g3',
                    'factorType':'email'
                  }
                ]
              }
            ]
          }
        ],
        idx: idxResp,
      });
    });
  });

  it('converts factor enroll options', (done) => {
    MockUtil.mockIntrospect(done, XHRFactorEnrollOptions, idxResp => {
      const result = _.compose(uiSchemaTransformer, responseTransformer)(idxResp);
      expect(result).toEqual({
        'factors': _.pick(XHRFactorEnrollOptions.factors, 'value'),
        'user': XHRFactorEnrollOptions.user.value,
        'remediations':[
          {
            'href': 'http://localhost:3000/idp/idx/credential/enroll',
            'name':'select-factor-enroll',
            'rel': [ 'create-form' ],
            'accepts': 'application/vnd.okta.v1+json',
            'method':'POST',
            'action': jasmine.any(Function),
            'value':[
              {
                'name':'factorProfileId',
                'type':'string',
                'options':[
                  {
                    'label':'Password Label',
                    'value':'00u2j17ObFUsbGfLg0g4',
                    'factorType':'password'
                  },
                  {
                    'label':'Email Label',
                    'value':'emf2j1ccd6CF4IWFY0g3',
                    'factorType':'email'
                  }
                ]
              },
              {
                name: 'stateHandle',
                value: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82',
                visible: false
              }
            ],
            'uiSchema':[
              {
                'name':'factorProfileId',
                'type':'factorSelect',
                'label-top': true,
                'options':[
                  {
                    'label':'Password Label',
                    'value':'00u2j17ObFUsbGfLg0g4',
                    'factorType':'password'
                  },
                  {
                    'label':'Email Label',
                    'value':'emf2j1ccd6CF4IWFY0g3',
                    'factorType':'email'
                  }
                ]
              }
            ]
          }
        ],
        'idx': idxResp,
      });
    });
  });

  it('converts response with fields as form for ENROLL_PROFILE', (done) => {
    MockUtil.mockIntrospect(done, XHREnrollProfile, idxResp => {
      const result = _.compose(uiSchemaTransformer, responseTransformer)(idxResp);
      expect(result).toEqual({
        'remediations':[
          {
            'href': 'http://localhost:3000/idp/idx/enroll',
            'name':'enroll-profile',
            'method':'POST',
            'rel': [ 'create-form' ],
            'accepts': 'application/vnd.okta.v1+json',
            'action': jasmine.any(Function),
            'value':[
              {
                'name':'userProfile',
                'form':{
                  'value':[
                    {
                      'name':'lastName',
                      'label':'Last name',
                      'required':true,
                    },
                    {
                      'name':'firstName',
                      'label':'First name',
                      'required':true,
                    },
                    {
                      'name':'email',
                      'label':'Primary email',
                      'required':true,
                    }
                  ],
                },
              },
              {
                name: 'stateHandle',
                value: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82',
                visible: false
              }
            ],
            'uiSchema':[
              {
                'name':'userProfile.lastName',
                'label':'Last name',
                'required':true,
                'label-top': true,
                'type':'text'
              },
              {
                'name':'userProfile.firstName',
                'label':'First name',
                'label-top': true,
                'required':true,
                'type':'text'
              },
              {
                'name':'userProfile.email',
                'label':'Primary email',
                'label-top': true,
                'required':true,
                'type':'text'
              }
            ]
          },
          {
            'href': 'http://localhost:3000/idp/idx/identify',
            'name':'select-identify',
            'rel': [ 'create-form' ],
            'accepts': 'application/vnd.okta.v1+json',
            'method': 'POST',
            'action': jasmine.any(Function),
            'value':[
              {
                'name':'identifier',
                'label':'identifier',
              },
              {
                name: 'stateHandle',
                value: '01r2p5S9qaAjESMFuPzt7r3ZMcZZQ_vvS0Tzg56ajB',
                visible: false
              }
            ],
            'uiSchema':[
              {
                'name':'identifier',
                'label':'identifier',
                'label-top': true,
                'type':'text'
              }
            ]
          }
        ],
        'idx': idxResp,
      });
    });
  });

  it('converts authenticator require - email', (done) => {
    MockUtil.mockIntrospect(done, XHRAuthenticatorRequiredEmail, idxResp => {
      const result = _.compose(uiSchemaTransformer, responseTransformer)(idxResp);
      expect(result).toEqual({
        'authenticatorEnrollments': _.pick(XHRAuthenticatorRequiredEmail.authenticatorEnrollments, 'value'),
        'currentAuthenticator': XHRAuthenticatorRequiredEmail.currentAuthenticator.value,
        'user': {
          'id': '00uwb8GLwf1HED5Xs0g3'
        },
        'remediations': [
          {
            'name': 'challenge-authenticator',
            'href': 'http://localhost:3000/idp/idx/challenge/answer',
            'rel': [ 'create-form' ],
            'accepts': 'application/vnd.okta.v1+json',
            'method': 'POST',
            'action': jasmine.any(Function),
            'value': [
              {
                'name': 'credentials',
                'form': {
                  'value': [
                    {
                      'name': 'passcode',
                      'label': 'One-time verification code',
                      'secret': true
                    }
                  ]
                }
              },
              {
                name: 'stateHandle', required: true,
                value: '02WTSGqlHUPjoYvorz8T48txBIPe3VUisrQOY4g5N8',
                visible: false, mutable: false
              }
            ],
            'uiSchema': [
              {
                'name': 'credentials.passcode',
                'label': 'One-time verification code',
                'secret': true,
                'label-top': true,
                'type': 'password',
                'params': {
                  'showPasswordToggle': true
                }
              }
            ]
          },
          {
            'name': 'select-authenticator-authenticate',
            'href': 'http://localhost:3000/idp/idx/challenge',
            'method': 'POST',
            'rel': [ 'create-form' ],
            'accepts': 'application/vnd.okta.v1+json',
            'action': jasmine.any(Function),
            'value': [
              {
                'name': 'authenticator',
                'type': 'object',
                'options': [
                  {
                    'label': 'Okta Password',
                    'value': {
                      'form': {
                        'value': [
                          {
                            'name': 'id',
                            'required': true,
                            'value': 'aidwboITrg4b4yAYd0g3',
                            'mutable': false
                          },
                          {
                            'name': 'methodType',
                            'required': false,
                            'value': 'password',
                            'mutable': false
                          }
                        ]
                      }
                    }
                  },
                  {
                    'label': 'Security Key or Biometric Authenticator (FIDO2)',
                    'value': {
                      'form': {
                        'value': [
                          {
                            'name': 'id',
                            'value': 'aidtheidkwh282hv8g3',
                            'required': true,
                            'mutable': false,
                            'visible': false
                          },
                          {
                            'name': 'methodType',
                            'value': 'webauthn',
                            'required': false,
                            'mutable': false,
                            'visible': false
                          }
                        ]
                      }
                    }
                  },
                  {
                    'label': 'Okta Email',
                    'value': {
                      'form': {
                        'value': [
                          {
                            'name': 'id',
                            'value': 'aidtm56L8gXXHI1SD0g3',
                            'required': true,
                            'mutable': false,
                            'visible': false
                          },
                          {
                            'name': 'methodType',
                            'value': 'email',
                            'required': false,
                            'mutable': false
                          }
                        ]
                      }
                    }
                  }
                ]
              },
              {
                name: 'stateHandle',
                required: true,
                value: '02WTSGqlHUPjoYvorz8T48txBIPe3VUisrQOY4g5N8',
                visible: false, mutable: false
              }
            ],
            'uiSchema': [
              {
                'name': 'authenticator',
                'type': 'authenticatorSelect',
                'label-top': true,
                'modelType': 'object',
                'options': [
                  {
                    'label': 'Okta Password',
                    'value': {
                      'id': 'aidwboITrg4b4yAYd0g3'
                    },
                    'authenticatorType': 'password'
                  },
                  {
                    'label': 'Security Key or Biometric Authenticator (FIDO2)',
                    'value': {
                      'id': 'aidtheidkwh282hv8g3'
                    },
                    'authenticatorType': 'webauthn'
                  },
                  {
                    'label': 'Okta Email',
                    'value': {
                      'id': 'aidtm56L8gXXHI1SD0g3'
                    },
                    'authenticatorType': 'email'
                  }
                ]
              }
            ]
          }
        ],
        'idx': idxResp,
      });
    });
  });

  it('converts authenticator enroll - authenticator list', (done) => {
    MockUtil.mockIntrospect(done, XHRAuthenticatorEnrollOptions, idxResp => {
      const result = _.compose(uiSchemaTransformer, responseTransformer)(idxResp);
      expect(result).toEqual({
        'authenticators': _.pick(XHRAuthenticatorEnrollOptions.authenticators, 'value'),
        'user': {
          'id': '00utjm1GstPjCF9Ad0g3'
        },
        'remediations': [
          {
            'name': 'select-authenticator-enroll',
            'href': 'http://localhost:3000/idp/idx/credential/enroll',
            'rel': [ 'create-form' ],
            'accepts': 'application/vnd.okta.v1+json',
            'method': 'POST',
            'action': jasmine.any(Function),
            'value': [
              {
                'name': 'authenticator',
                'type': 'object',
                'required': true,
                'options': [
                  {
                    'label': 'Okta Password',
                    'value': {
                      'form': {
                        'value': [
                          {
                            'name': 'id',
                            'required': true,
                            'value': 'autwa6eD9o02iBbtv0g3',
                            'mutable': false
                          },
                          {
                            'name': 'methodType',
                            'required': false,
                            'value': 'password',
                            'mutable': false
                          }
                        ]
                      }
                    }
                  },
                  {
                    'label': 'Okta Phone',
                    'value': {
                      'form': {
                        'value': [
                          {
                            'name': 'id',
                            'value': 'aid568g3mXgtID0X1SLH',
                            'mutable': false,
                            'required': true
                          },
                          {
                            'name': 'methodType',
                            'required': false,
                            'options': [
                              { 'label': 'SMS', 'value': 'sms' },
                              { 'label': 'VOICE', 'value': 'voice' }
                            ]
                          },
                          {
                            'name': 'phoneNumber',
                            'required': false,
                            'type': 'string'
                          }
                        ]
                      }
                    }
                  },
                  {
                    'label': 'Security Key or Biometric Authenticator (FIDO2)',
                    'value': {
                      'form': {
                        'value': [
                          {
                            'name': 'id',
                            'value': 'aidtheidkwh282hv8g3',
                            'required': true,
                            'mutable': false,
                            'visible': false
                          },
                          {
                            'name': 'methodType',
                            'value': 'webauthn',
                            'required': false,
                            'mutable': false,
                            'visible': false
                          }
                        ]
                      }
                    }
                  },
                  {
                    'label': 'Okta Security Question',
                    'value': {
                      'form': {
                        'value': [
                          {
                            'name': 'id',
                            'value': 'aid568g3mXgtID0X1GGG',
                            'required': true,
                            'mutable': false,
                            'visible': false
                          }
                        ]
                      }
                    }
                  },
                ]
              },
              {
                name: 'stateHandle',
                required: true,
                value: '02CqFbzJ_zMGCqXut-1CNXfafiTkh9wGlbFqi9Xupt',
                visible: false,
                mutable: false
              }
            ],
            'uiSchema': [
              {
                'name': 'authenticator',
                'type': 'authenticatorSelect',
                'required': true,
                'label-top': true,
                'modelType': 'object',
                'options': [
                  {
                    'label': 'Okta Password',
                    'value': {
                      'id': 'autwa6eD9o02iBbtv0g3'
                    },
                    'authenticatorType': 'password'
                  },
                  {
                    'label': 'Okta Phone',
                    'value': {
                      'id': 'aid568g3mXgtID0X1SLH'
                    },
                    'authenticatorType': 'phone'
                  },
                  {
                    'label': 'Security Key or Biometric Authenticator (FIDO2)',
                    'value': {
                      'id': 'aidtheidkwh282hv8g3'
                    },
                    'authenticatorType': 'security_key'
                  },
                  {
                    'label': 'Okta Security Question',
                    'value': {
                      'id': 'aid568g3mXgtID0X1GGG'
                    },
                    'authenticatorType': 'security_question'
                  },
                ]
              }
            ]
          }
        ],
        'idx': idxResp,
      });
    });
  });

  it('converts authenticator enroll - phone', (done) => {
    MockUtil.mockIntrospect(done, XHRAuthenticatorEnrollPhone, idxResp => {
      const result = _.compose(uiSchemaTransformer, responseTransformer)(idxResp);
      expect(result).toEqual({
        'currentAuthenticator': {
          'type': 'phone',
          'id': 'aid568g3mXgtID0X1SLH',
        },
        'user': {
          'id': 'I9bvFiq01cRFgbn',
          'passwordChanged': '2019-05-03T19:00:00.000Z',
          'profile': {
            'login': 'foo@example.com',
            'firstName': 'Foo',
            'lastName': 'Bar',
            'locale': 'en-us',
            'timeZone': 'UTC'
          }
        },
        'remediations': [
          {
            'name': 'select-authenticator-enroll-data',
            'href': 'http://localhost:3000/idp/idx/challenge',
            'rel': [ 'create-form' ],
            'accepts': 'application/vnd.okta.v1+json',
            'method': 'POST',
            'action': jasmine.any(Function),
            'value': [
              {
                'name': 'authenticator',
                'required': true,
                'type': 'object',
                'visible': true,
                'value': {
                  'label': 'Okta Phone',
                  'form': {
                    'value': [
                      {
                        'name': 'id',
                        'value': 'aid568g3mXgtID0X1SLH',
                        'mutable': false,
                        'visible': false,
                        'required': true
                      },
                      {
                        'name': 'methodType',
                        'required': true,
                        'options': [
                          {
                            'label': 'SMS',
                            'value': 'sms'
                          },
                          {
                            'label': 'Voice call',
                            'value': 'voice'
                          }
                        ]
                      },
                      {
                        'name': 'phoneNumber',
                        'required': true,
                        'type': 'string',
                        'label': 'Phone number'
                      }
                    ]
                  }
                }
              },
              {
                name: 'stateHandle',
                value: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82',
                visible: false
              }
            ],
            'uiSchema': [
              {
                'name': 'authenticator.id',
                'value': 'aid568g3mXgtID0X1SLH',
                'mutable': false,
                'visible': false,
                'required': true,
                'label-top': true,
                'type': 'text'
              },
              {
                'name': 'authenticator.methodType',
                'required': true,
                'options': [
                  {
                    'label': 'SMS',
                    'value': 'sms'
                  },
                  {
                    'label': 'Voice call',
                    'value': 'voice'
                  }
                ],
                'label-top': true,
                'type': 'radio'
              },
              {
                'name': 'authenticator.phoneNumber',
                'required': true,
                'type': 'text',
                'label-top': true
              }
            ]
          }
        ],
        'idx': idxResp,
      });
    });
  });

  it('converts authenticator enroll - security question', (done) => {
    MockUtil.mockIntrospect(done, XHRAuthenticatorEnrollSecurityQuestion, idxResp => {
      const result = _.compose(uiSchemaTransformer, responseTransformer)(idxResp);
      expect(result).toEqual({
        'currentAuthenticator': {
          'type': 'security_question',
          'id': 'aid568g3mXgtID0X1GGG',
        },
        'user': {
          'id': 'I9bvFiq01cRFgbn',
          'passwordChanged': '2019-05-03T19:00:00.000Z',
          'profile': {
            'login': 'foo@example.com',
            'firstName': 'Foo',
            'lastName': 'Bar',
            'locale': 'en-us',
            'timeZone': 'UTC'
          }
        },
        'remediations': [
          {
            'rel': [
              'create-form'
            ],
            'name': 'enroll-authenticator',
            'href': 'http://localhost:3000/idp/idx/challenge/answer',
            'method': 'POST',
            'accepts': 'application/vnd.okta.v1+json',
            'action': jasmine.any(Function),
            'value': [
              {
                'name': 'credentials',
                'type': 'object',
                'required': true,
                'options': [
                  {
                    'label': 'Choose a security question',
                    'value': {
                      'form': {
                        'value': [
                          {
                            'name': 'questionKey',
                            'type': 'string',
                            'required': true,
                            'label': 'Choose a security question',
                            'options': [
                              {
                                'label': 'What is the food you least liked as a child?',
                                'value': 'disliked_food'
                              },
                              {
                                'label': 'What is the name of your first stuffed animal?',
                                'value': 'name_of_first_plush_toy'
                              },
                              {
                                'label': 'Where did you go for your favorite vacation?',
                                'value': 'favorite_vacation_location'
                              }
                            ]
                          },
                          {
                            'name': 'answer',
                            'label': 'Answer',
                            'required': true,
                            'secret': true
                          }
                        ]
                      }
                    }
                  },
                  {
                    'label': 'Create my own security question',
                    'value': {
                      'form': {
                        'value': [
                          {
                            'name': 'questionKey',
                            'required': true,
                            'value': 'custom',
                            'mutable': false
                          },
                          {
                            'name': 'question',
                            'label': 'Create a security question',
                            'required': true
                          },
                          {
                            'name': 'answer',
                            'label': 'Answer',
                            'required': true,
                            'secret': true
                          }
                        ]
                      }
                    }
                  }
                ]
              },
              {
                'name': 'stateHandle',
                'required': true,
                'value': '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82',
                'visible': false,
                'mutable': false
              }
            ],
            'uiSchema': [
              {
                'name': 'sub_schema_local_credentials',
                'type': 'radio',
                'required': true,
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
                ],
                'value': '0'
              }
            ]
          }
        ],
        'idx': idxResp,
      });
    });
  });

  it('converts identify remidiation response', (done) => {
    MockUtil.mockIntrospect(done, XHRIdentifyResponse, idxResp => {
      const result = _.compose(uiSchemaTransformer, responseTransformer)(idxResp);
      expect(result).toEqual({
        'remediations': [
          {
            'name':'identify',
            'href':'http://localhost:3000/idp/idx/identify',
            'rel': [ 'create-form' ],
            'accepts': 'application/vnd.okta.v1+json',
            'method':'POST',
            'action': jasmine.any(Function),
            'value':[
              {
                'name':'identifier',
                'label':'Username'
              },
              {
                'name':'rememberMe',
                'label':'Remember Me',
                'type':'boolean'
              },
              {
                name: 'stateHandle',
                required: true,
                value: jasmine.any(String),
                visible: false,
                mutable: false
              }
            ],
            'uiSchema':[
              {
                'name':'identifier',
                'label':'Username',
                'type':'text',
                'label-top': true,
              },
              {
                'name':'rememberMe',
                'label':false,
                'type':'checkbox',
                'placeholder':'Remember Me',
                'modelType':'boolean',
                'required':false,
                'label-top': true,
              }
            ]
          },
          {
            'name':'select-enroll-profile',
            'href':'http://localhost:3000/idp/idx/enroll',
            'rel': [ 'create-form' ],
            'accepts': 'application/vnd.okta.v1+json',
            'method':'POST',
            'action': jasmine.any(Function),
            'value':[
              {
                name: 'stateHandle',
                required: true,
                value: jasmine.any(String),
                visible: false,
                mutable: false
              }
            ],
            'uiSchema':[]
          }
        ],
        'idx': idxResp
      });
    });
  });
});
