import { _ } from 'okta';
import responseTransformer from 'v2/ion/responseTransformer';
import actionsTransformer from 'v2/ion/actionsTransformer';
import uiSchemaTransformer from 'v2/ion/uiSchemaTransformer';
import XHRFactorRequiredEmail from '../../../helpers/xhr/v2/FACTOR_REQUIRED_EMAIL';
import XHRFactorVerificationRequiredEmail from '../../../helpers/xhr/v2/FACTOR_VERIFICATION_REQUIRED_EMAIL';
import XHRFactorEnrollOptions from '../../../helpers/xhr/v2/FACTOR_ENROLL_OPTIONS';

describe('v2/ion/uiSchemaTransformer', function () {
  it('converts factor require email', () => {
    const result = _.compose(uiSchemaTransformer, actionsTransformer, responseTransformer)(XHRFactorRequiredEmail.response);
    expect(result.currentState).toEqual({
      'version': '1.0.0',
      'stateHandle': '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82',
      'expiresAt': '2018-09-17T23:08:56.000Z',
      'step': 'FACTOR_REQUIRED',
      'intent': 'login',
      'submit-factor': jasmine.any(Function),
      'cancel': jasmine.any(Function),
      'context': jasmine.any(Function),
      'remediation': [
        {
          'name': 'submit-factor',
          'value': [
            {
              'name': 'email',
              'placeholder': 'Enter code',
              'required': true,
              'type': 'text'
            }
          ],
          'uiSchema': [
            {
              'name': 'email',
              'placeholder': 'Enter code',
              'required': true,
              'type': 'text'
            }
          ]
        }
      ]
    });
  });

  it('converts factor enroll options', () => {
    const result = _.compose(uiSchemaTransformer, actionsTransformer, responseTransformer)(XHRFactorEnrollOptions.response);
    expect(result.currentState).toEqual({
      'version': '1.0.0',
      'stateHandle': '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82',
      'expiresAt': '2018-09-17T23:08:56.000Z',
      'step': 'FACTOR_ENROLL',
      'intent': 'login',
      'select-factor': jasmine.any(Function),
      'cancel': jasmine.any(Function),
      'context': jasmine.any(Function),
      'remediation': [
        {
          'name': 'select-factor',
          'value': [
            {
              'name': 'factorType',
              'type': 'set',
              'options': [
                {
                  'label': 'Password',
                  'value': 'password'
                },
                {
                  'label': 'E-mail',
                  'value': 'email'
                }
              ]
            }
          ],
          'uiSchema': [
            {
              'name': 'factorType',
              'type': 'factorType',
              'options': [
                {
                  'label': 'Password',
                  'value': 'password'
                },
                {
                  'label': 'E-mail',
                  'value': 'email'
                }
              ]
            }
          ]
        }
      ]
    });
  });

  it('converts factor verification require email', () => {
    const result = _.compose(uiSchemaTransformer, actionsTransformer, responseTransformer)(XHRFactorVerificationRequiredEmail.response);
    expect(result.currentState).toEqual({
      'version': '1.0.0',
      'stateHandle': '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82',
      'expiresAt': '2018-09-17T23:08:56.000Z',
      'step': 'FACTOR_VERIFICATION_REQUIRED',
      'intent': 'login',
      'factor-poll-verification': jasmine.any(Function),
      'otp': jasmine.any(Function),
      'cancel': jasmine.any(Function),
      'context': jasmine.any(Function),
      'remediation': [
        {
          'name': 'factor-poll-verification',
          'refresh': 2000,
          'value': [],
          'uiSchema': [],
        },
        {
          'name': 'otp',
          'value': [
            {
              "name": "otp",
              "label": "Passcode",
              "minLength": 4
            }
          ],
          'uiSchema': [
            {
              "name": "otp",
              "label": "Passcode",
              "minLength": 4,
              type: 'text',
            }
          ],
        }
      ]
    });
  });

});
