import 'jasmine-ajax';
import transformResponse from 'v2/ion/responseTransformer';

import MockUtil from '../../../helpers/v2/MockUtil';
import XHRAuthenticatorRequiredEmail from '../../../../../playground/mocks/data/idp/idx/authenticator-verification-email.json';
import XHRErrorIdentifyAccessDenied from '../../../../../playground/mocks/data/idp/idx/error-identify-access-denied.json';
import XHRSuccess from '../../../../../playground/mocks/data/idp/idx/success.json';

describe('v2/ion/responseTransformer', function () {

  it('returns result when invokes with invalid resp', () => {
    expect(transformResponse()).toBeNull();
    expect(transformResponse('hello')).toBeNull();
  });

  it('converts factor required email idx object', (done) => {
    MockUtil.mockIntrospect(done, XHRAuthenticatorRequiredEmail, idxResp => {
      const result = transformResponse(idxResp);
      expect(result).toEqual({
        'remediations': [
          {
            'action': jasmine.any(Function),
            'name': 'challenge-authenticator',
            'rel': [ 'create-form' ],
            'accepts': 'application/vnd.okta.v1+json',
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
              },
              { name: 'stateHandle', required: true, value: '02WTSGqlHUPjoYvorz8T48txBIPe3VUisrQOY4g5N8', visible: false, mutable: false }
            ]
          },
          {
            'action': jasmine.any(Function),
            'name': 'select-authenticator-authenticate',
            'href': 'http://localhost:3000/idp/idx/challenge',
            'method': 'POST',
            'rel': [ 'create-form' ],
            'accepts': 'application/vnd.okta.v1+json',
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
              { name: 'stateHandle', required: true, value: '02WTSGqlHUPjoYvorz8T48txBIPe3VUisrQOY4g5N8', visible: false, mutable: false }
            ]
          }
        ],
        authenticatorEnrollments: {
          value: XHRAuthenticatorRequiredEmail.authenticatorEnrollments.value,
        },
        currentAuthenticator: XHRAuthenticatorRequiredEmail.currentAuthenticator.value,
        'user':{
          'id':'00uwb8GLwf1HED5Xs0g3'
        },
        idx: idxResp,
      });
    });
  });

  it('converts ion response that has messages', (done) => {
    MockUtil.mockIntrospect(done, XHRErrorIdentifyAccessDenied, idxResp => {
      const result = transformResponse(idxResp);
      expect(result).toEqual({
        remediations: [
        ],
        messages: {
          value: [
            {
              'message': 'You do not have permission to perform the requested action.',
              'i18n': {
                'key': 'security.access_denied'
              },
              'class': 'ERROR'
            }
          ]
        },
        idx: idxResp,
      });
    });
  });

  it('converts success ion response', (done) => {
    MockUtil.mockIntrospect(done, XHRSuccess, idxResp => {
      const result = transformResponse(idxResp);
      expect(result).toEqual({
        remediations: [
          {
            'name': 'success-redirect',
            'href': 'http://localhost:3000/app/UserHome?stateToken=mockedStateToken123',
            'value': [],
          }
        ],
        'user': {
          'id': '00ub0ttoyz062NeVa0g4'
        },
        idx: idxResp,
      });
    });
  });

});
