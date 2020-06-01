import { _ } from 'okta';
import responseTransformer from 'v2/ion/responseTransformer';
import uiSchemaTransformer from 'v2/ion/uiSchemaTransformer';

import XHREnrollProfile from '../../../../../playground/mocks/idp/idx/data/enroll-profile.json';
import XHRFactorRequiredEmail  from '../../../../../playground/mocks/idp/idx/data/factor-verification-email.json';
import XHRFactorEnrollOptions from '../../../../../playground/mocks/idp/idx/data/factor-enroll-options.json';
import XHRAuthenticatorRequiredEmail  from '../../../../../playground/mocks/idp/idx/data/authenticator-verification-email.json';
import XHRAuthenticatorEnrollOptions  from '../../../../../playground/mocks/idp/idx/data/authenticator-select-enroll-options.json';


describe('v2/ion/uiSchemaTransformer', function () {
  it('converts factor require email', () => {
    const rawFactorRequiredEmailResponse = XHRFactorRequiredEmail;
    const transformedResponse  = {
      'proceed': jasmine.any(Function),
      'neededToProceed': XHRFactorRequiredEmail.remediation.value,
      'actions':{
      },
      'context': _.omit(XHRFactorRequiredEmail, 'remediation', 'cancel'),
      'rawIdxState': rawFactorRequiredEmailResponse
    };
    const result = _.compose(uiSchemaTransformer, responseTransformer)(transformedResponse);
    expect(result).toEqual({
      'factors': _.pick(XHRFactorRequiredEmail.factors, 'value'),
      'factor': XHRFactorRequiredEmail.factor.value,
      'user':{
        'id':'00usip1dptbE7NiLa0g3'
      },
      'proceed': jasmine.any(Function),
      'neededToProceed': XHRFactorRequiredEmail.remediation.value,
      'actions':{
      },
      'context': _.omit(XHRFactorRequiredEmail, 'remediation', 'cancel'),
      'rawIdxState':rawFactorRequiredEmailResponse,
      'remediations':[
        {
          'href': 'http://localhost:3000/idp/idx/challenge/answer',
          'name':'challenge-factor',
          'method':'POST',
          'value':[
            {
              'name':'credentials',
              'form':{
                'value':[
                  {
                    'name':'passcode',
                    'label':'One-time verification code',
                    'secret':true,
                  },
                ]
              }
            }
          ],
          'uiSchema':[
            {
              'name':'credentials.passcode',
              'label':'One-time verification code',
              'label-top': true,
              'secret':true,
              'type':'password',
              'params':{
                'showPasswordToggle':true
              }
            }
          ]
        },
        {
          'href': 'http://localhost:3000/idp/idx/challenge',
          'name':'select-factor-authenticate',
          'method':'POST',
          'value':[
            {
              'name':'factorId',
              'type':'set',
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
      ]
    });
  });

  it('converts factor enroll options', () => {
    const transformedResponse  = {
      'neededToProceed': XHRFactorEnrollOptions.remediation.value,
      'actions':{
      },
      'context': _.omit(XHRFactorEnrollOptions, 'remediation', 'cancel'),
      'rawIdxState':XHRFactorEnrollOptions
    };
    const result = _.compose(uiSchemaTransformer, responseTransformer)(transformedResponse);
    expect(result).toEqual({
      'factors': _.pick(XHRFactorEnrollOptions.factors, 'value'),
      'user': XHRFactorEnrollOptions.user.value,
      'neededToProceed': XHRFactorEnrollOptions.remediation.value,
      'actions':{
      },
      'context': _.omit(XHRFactorEnrollOptions, 'remediation', 'cancel'),
      'rawIdxState': XHRFactorEnrollOptions,
      'remediations':[
        {
          'href': 'http://localhost:3000/idp/idx/credential/enroll',
          'name':'select-factor-enroll',
          'method':'POST',
          'value':[
            {
              'name':'factorProfileId',
              'type':'set',
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
      ]
    });
  });

  it('converts response with fields as form for ENROLL_PROFILE', () => {
    const rawUserEnrollResponse = XHREnrollProfile;
    const transformedResponse  = {
      'neededToProceed':[
        {
          'rel':[
            'create-form'
          ],
          'name':'enroll-profile',
          'href':'http://localhost:3000/idp/idx/enroll',
          'method':'post',
          'accepts':'application/vnd.okta.v1+json',
          'value':[
            {
              'name':'userProfile',
              'form':{
                'value':[
                  {
                    'name':'lastName',
                    'label':'Last name',
                    'required':true,
                    'method':'post'
                  },
                  {
                    'name':'firstName',
                    'label':'First name',
                    'required':true,
                    'method':'post'
                  },
                  {
                    'name':'email',
                    'label':'Primary email',
                    'required':true,
                    'method':'post'
                  }
                ],
                'method':'post'
              },
              'method':'post'
            }
          ]
        },
        {
          'rel':[
            'create-form'
          ],
          'name':'select-identify',
          'href':'http://localhost:3000/idp/idx',
          'method':'post',
          'accepts':'application/vnd.okta.v1+json',
          'value':[
            {
              'name':'identifier',
              'label':'identifier',
              'method':'post'
            }
          ]
        }
      ],
      'actions':{

      },
      'context':{
        'stateHandle':'01r2p5S9qaAjESMFuPzt7r3ZMcZZQ_vvS0Tzg56ajB',
        'version':'1.0.0',
        'expiresAt':'2019-07-24T21:25:33.000Z',
        'step':'PROFILE_REQUIRED',
        'intent':'LOGIN'
      },
      'rawIdxState':rawUserEnrollResponse
    };
    const result = _.compose(uiSchemaTransformer, responseTransformer)(transformedResponse);
    expect(result).toEqual({
      'neededToProceed':[
        {
          'rel':[
            'create-form'
          ],
          'name':'enroll-profile',
          'href':'http://localhost:3000/idp/idx/enroll',
          'method':'post',
          'accepts':'application/vnd.okta.v1+json',
          'value':[
            {
              'name':'userProfile',
              'form':{
                'value':[
                  {
                    'name':'lastName',
                    'label':'Last name',
                    'required':true,
                    'method':'post'
                  },
                  {
                    'name':'firstName',
                    'label':'First name',
                    'required':true,
                    'method':'post'
                  },
                  {
                    'name':'email',
                    'label':'Primary email',
                    'required':true,
                    'method':'post'
                  }
                ],
                'method':'post'
              },
              'method':'post'
            }
          ]
        },
        {
          'rel':[
            'create-form'
          ],
          'name':'select-identify',
          'href':'http://localhost:3000/idp/idx',
          'method':'post',
          'accepts':'application/vnd.okta.v1+json',
          'value':[
            {
              'name':'identifier',
              'label':'identifier',
              'method':'post'
            }
          ]
        }
      ],
      'actions':{

      },
      'context':{
        'stateHandle':'01r2p5S9qaAjESMFuPzt7r3ZMcZZQ_vvS0Tzg56ajB',
        'version':'1.0.0',
        'expiresAt':'2019-07-24T21:25:33.000Z',
        'step':'PROFILE_REQUIRED',
        'intent':'LOGIN'
      },
      'rawIdxState':rawUserEnrollResponse,
      'remediations':[
        {
          'value':[
            {
              'name':'userProfile',
              'form':{
                'value':[
                  {
                    'name':'lastName',
                    'label':'Last name',
                    'required':true,
                    'method':'post'
                  },
                  {
                    'name':'firstName',
                    'label':'First name',
                    'required':true,
                    'method':'post'
                  },
                  {
                    'name':'email',
                    'label':'Primary email',
                    'required':true,
                    'method':'post'
                  }
                ],
                'method':'post'
              },
              'method':'post'
            }
          ],
          'href': 'http://localhost:3000/idp/idx/enroll',
          'name':'enroll-profile',
          'method':'post',
          'uiSchema':[
            {
              'name':'userProfile.lastName',
              'label':'Last name',
              'required':true,
              'method':'post',
              'label-top': true,
              'type':'text'
            },
            {
              'name':'userProfile.firstName',
              'label':'First name',
              'label-top': true,
              'required':true,
              'method':'post',
              'type':'text'
            },
            {
              'name':'userProfile.email',
              'label':'Primary email',
              'label-top': true,
              'required':true,
              'method':'post',
              'type':'text'
            }
          ]
        },
        {
          'value':[
            {
              'name':'identifier',
              'label':'identifier',
              'method':'post'
            }
          ],
          'href': 'http://localhost:3000/idp/idx',
          'name':'select-identify',
          'method':'post',
          'uiSchema':[
            {
              'name':'identifier',
              'label':'identifier',
              'label-top': true,
              'method':'post',
              'type':'text'
            }
          ]
        }
      ]
    });
  });

  it('converts authenticator require email', () => {
    const rawAuthenticatorRequiredEmailResponse = XHRAuthenticatorRequiredEmail;
    const transformedResponse  = {
      'proceed': jasmine.any(Function),
      'neededToProceed': rawAuthenticatorRequiredEmailResponse.remediation.value,
      'actions':{
      },
      'context': _.omit(rawAuthenticatorRequiredEmailResponse, 'remediation', 'cancel'),
      'rawIdxState': rawAuthenticatorRequiredEmailResponse
    };
    const result = _.compose(uiSchemaTransformer, responseTransformer)(transformedResponse);
    expect(result).toEqual({
      'authenticatorEnrollments': _.pick(rawAuthenticatorRequiredEmailResponse.authenticatorEnrollments, 'value'),
      'currentAuthenticator': rawAuthenticatorRequiredEmailResponse.currentAuthenticator.value,
      'user': {
        'id': '00uwb8GLwf1HED5Xs0g3'
      },
      'proceed': jasmine.any(Function),
      'neededToProceed': rawAuthenticatorRequiredEmailResponse.remediation.value,
      'actions':{
      },
      'context': _.omit(rawAuthenticatorRequiredEmailResponse, 'remediation', 'cancel'),
      'rawIdxState': rawAuthenticatorRequiredEmailResponse,
      'remediations': [
        {
          'name': 'challenge-authenticator',
          'href': 'http://localhost:3000/idp/idx/challenge/answer',
          'method': 'POST',
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
            }
          ],
          'uiSchema': [
            {
              'name': 'authenticator',
              'type': 'authenticatorSelect',
              'label-top': true,
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
      ]
    });
  });

  it('converts authenticator enroll password', () => {
    const rawAuthenticatorEnrollOptionsResponse = XHRAuthenticatorEnrollOptions;
    const transformedResponse  = {
      'proceed': jasmine.any(Function),
      'authenticators': _.pick(rawAuthenticatorEnrollOptionsResponse.authenticators, 'value'),
      'neededToProceed': rawAuthenticatorEnrollOptionsResponse.remediation.value,
      'actions':{
      },
      'context': _.omit(rawAuthenticatorEnrollOptionsResponse, 'remediation', 'cancel'),
      'rawIdxState': rawAuthenticatorEnrollOptionsResponse
    };
    const result = _.compose(uiSchemaTransformer, responseTransformer)(transformedResponse);
    expect(result).toEqual({
      'authenticators': _.pick(rawAuthenticatorEnrollOptionsResponse.authenticators, 'value'),
      'user': {
        'id': '00utjm1GstPjCF9Ad0g3'
      },
      'proceed': jasmine.any(Function),
      'neededToProceed': rawAuthenticatorEnrollOptionsResponse.remediation.value,
      'actions':{

      },
      'context': _.omit(rawAuthenticatorEnrollOptionsResponse, 'remediation', 'cancel'),
      'rawIdxState': rawAuthenticatorEnrollOptionsResponse,
      'remediations': [
        {
          'name': 'select-authenticator-enroll',
          'href': 'http://localhost:3000/idp/idx/credential/enroll',
          'method': 'POST',
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
              ]
            }
          ],
          'uiSchema': [
            {
              'name': 'authenticator',
              'type': 'authenticatorSelect',
              'required': true,
              'label-top': true,
              'options': [
                {
                  'label': 'Okta Password',
                  'value': {
                    'id': 'autwa6eD9o02iBbtv0g3'
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
              ]
            }
          ]
        }
      ]
    });
  });

});
