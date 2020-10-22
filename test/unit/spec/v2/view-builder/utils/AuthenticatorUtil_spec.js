import { removeRequirementsFromError } from 'v2/view-builder/utils/AuthenticatorUtil';

describe('v2/utils/AuthenticatorUtil', function () {
  it('filters requirements from password error', function () {
    const policy = {
      'complexity': {
        'minLength': 8,
        'minLowerCase': 1,
        'minUpperCase': 1,
        'minNumber': 1,
        'minSymbol': 1,
        'excludeUsername': true,
        'excludeAttributes': [
          'firstName',
          'lastName'
        ],
        'excludeFirstName': true,
        'excludeLastName': true
      },
      'age': {
        'minAgeMinutes': 120,
        'historyCount': 4
      }
    };
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
    const result = removeRequirementsFromError(errorJSON, policy);
    expect(result).toEqual({
      'errorCauses': [
        {
          'property': 'credentials.passcode',
          'errorSummary': 'Password requirements were not met.'
        }
      ],
      'errorSummary': ''
    });
  });

  it('does not change anything if there are no requirements in error message', function () {
    const policy = {
      'complexity': {
        'minLength': 8,
        'minLowerCase': 1,
        'minUpperCase': 1,
        'minNumber': 1,
        'minSymbol': 1,
        'excludeUsername': true,
        'excludeAttributes': [
          'firstName',
          'lastName'
        ],
        'excludeFirstName': true,
        'excludeLastName': true
      },
      'age': {
        'minAgeMinutes': 120,
        'historyCount': 4
      }
    };
    const errorJSON = {
      'errorCauses': [
        {
          'property': 'credentials.passcode',
          'errorSummary': [
            'Password requirements were not met.'
          ]
        }
      ],
      'errorSummary': ''
    };
    const result = removeRequirementsFromError(errorJSON, policy);
    expect(result).toEqual({
      'errorCauses': [
        {
          'property': 'credentials.passcode',
          'errorSummary': 'Password requirements were not met.'
        }
      ],
      'errorSummary': ''
    });
  });
});
