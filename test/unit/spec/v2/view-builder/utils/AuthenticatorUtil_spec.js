import { removeRequirementsFromError, getAuthenticatorDisplayName } from 'v2/view-builder/utils/AuthenticatorUtil';

describe('v2/utils/AuthenticatorUtil', function() {
  it('filters requirements from password error', function() {
    const errorJSON = {
      'errorCauses': [
        {
          'property': 'credentials.passcode',
          'errorSummary': [
            'Password requirements were not met. Password requirements: at least 8 characters, a lowercase letter, an uppercase letter, a number, a symbol, no parts of your username, does not include your first name, does not include your last name. Your password cannot be any of your last 4 passwords. At least 2 hour(s) must have elapsed since you last changed your password.'
          ]
        }
      ],
      'errorSummary': ''
    };
    const result = removeRequirementsFromError(errorJSON);
    expect(result).toEqual({
      'errorCauses': [
        {
          'property': 'credentials.passcode',
          'errorSummary': 'Password requirements were not met'
        }
      ],
      'errorSummary': ''
    });
  });

  it('does not change anything if the error is not "requirements missing" error message', function() {
    const errorJSON = {
      'errorCauses': [
        {
          'property': 'credentials.passcode',
          'errorSummary': [
            'This password was found in a list of commonly used passwords. Please try another password.'
          ]
        }
      ],
      'errorSummary': ''
    };
    const result = removeRequirementsFromError(errorJSON);
    expect(result).toEqual({
      'errorCauses': [
        {
          'property': 'credentials.passcode',
          'errorSummary': 'This password was found in a list of commonly used passwords. Please try another password.'
        }
      ],
      'errorSummary': ''
    });
  });

  it('getAuthenticatorDisplayName returns displayName from remediation', function() {
    const remediation = {
      'relatesTo': {
        'value': {
          'displayName': 'authenticator name'
        }
      }
    };
    expect(getAuthenticatorDisplayName(remediation)).toEqual('authenticator name');
  });
});
