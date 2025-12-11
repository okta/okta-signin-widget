import {
  removeRequirementsFromError,
  getAuthenticatorDisplayName,
  getAuthenticatorDataForVerification,
  getAuthenticatorDataForEnroll,
  getWebAuthnI18nKey,
  getWebAuthnTitle,
  getWebAuthnAdditionalInstructions,
  WEBAUTHN_DISPLAY_NAMES,
} from 'v2/view-builder/utils/AuthenticatorUtil';

describe('v2/utils/AuthenticatorUtil', function() {
  it('filters requirements from password error', function() {
    const errorJSON = {
      'errorCauses': [
        {
          'property': 'credentials.passcode',
          'errorKey': ['password.passwordRequirementsNotMet'],
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
          'errorKey': ['password.passwordRequirementsNotMet'],
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

  it('shows nickname when available from remediation', function() {
    const authenticator = {
      'authenticatorKey': 'phone_number',
      'relatesTo': {
        'nickname': 'authenticator nickname'
      }
    };
    expect(getAuthenticatorDataForVerification(authenticator).nickname).toEqual('authenticator nickname');
  });

  describe('WebAuthn displayName-based i18n key mapping', function() {
    describe('getWebAuthnI18nKey', function() {
      const mockKeyMap = {
        DEFAULT: 'default.key',
        PASSKEYS: 'passkeys.key',
        CUSTOM: 'custom.key',
      };

      it('returns DEFAULT key when displayName is undefined', function() {
        expect(getWebAuthnI18nKey(mockKeyMap, undefined)).toBe('default.key');
      });

      it('returns DEFAULT key when displayName is null', function() {
        expect(getWebAuthnI18nKey(mockKeyMap, null)).toBe('default.key');
      });

      it('returns DEFAULT key when displayName matches DEFAULT constant', function() {
        expect(getWebAuthnI18nKey(mockKeyMap, WEBAUTHN_DISPLAY_NAMES.DEFAULT)).toBe('default.key');
      });

      it('returns PASSKEYS key when displayName matches PASSKEYS constant', function() {
        expect(getWebAuthnI18nKey(mockKeyMap, WEBAUTHN_DISPLAY_NAMES.PASSKEYS)).toBe('passkeys.key');
      });

      it('returns CUSTOM key when displayName is a custom value', function() {
        expect(getWebAuthnI18nKey(mockKeyMap, 'My Custom Authenticator')).toBe('custom.key');
      });
    });

    describe('getWebAuthnTitle', function() {
      it('returns correct title for DEFAULT displayName in enroll flow', function() {
        const currentViewState = {
          relatesTo: {
            value: {
              displayName: WEBAUTHN_DISPLAY_NAMES.DEFAULT,
            }
          }
        };
        const title = getWebAuthnTitle(currentViewState, false);
        expect(title).toBe('Set up security key or biometric authenticator');
      });

      it('returns correct title for PASSKEYS displayName in enroll flow', function() {
        const currentViewState = {
          relatesTo: {
            value: {
              displayName: WEBAUTHN_DISPLAY_NAMES.PASSKEYS,
            }
          }
        };
        const title = getWebAuthnTitle(currentViewState, false);
        expect(title).toBe('Set up a passkey');
      });

      it('returns correct title with custom displayName in enroll flow', function() {
        const currentViewState = {
          relatesTo: {
            value: {
              displayName: 'YubiKey',
            }
          }
        };
        const title = getWebAuthnTitle(currentViewState, false);
        expect(title).toBe('Set up YubiKey');
      });

      it('returns correct title for DEFAULT displayName in verify flow', function() {
        const currentViewState = {
          relatesTo: {
            value: {
              displayName: WEBAUTHN_DISPLAY_NAMES.DEFAULT,
            }
          }
        };
        const title = getWebAuthnTitle(currentViewState, true);
        expect(title).toBe('Verify with Security Key or Biometric Authenticator');
      });

      it('returns correct title for PASSKEYS displayName in verify flow', function() {
        const currentViewState = {
          relatesTo: {
            value: {
              displayName: WEBAUTHN_DISPLAY_NAMES.PASSKEYS,
            }
          }
        };
        const title = getWebAuthnTitle(currentViewState, true);
        expect(title).toBe('Verify with a passkey');
      });

      it('returns correct title with custom displayName in verify flow', function() {
        const currentViewState = {
          relatesTo: {
            value: {
              displayName: 'TouchID',
            }
          }
        };
        const title = getWebAuthnTitle(currentViewState, true);
        expect(title).toBe('Verify with TouchID');
      });

      it('handles missing displayName gracefully', function() {
        const currentViewState = {
          relatesTo: {
            value: {}
          }
        };
        const title = getWebAuthnTitle(currentViewState, false);
        expect(title).toBe('Set up security key or biometric authenticator');
      });
    });

    describe('getWebAuthnAdditionalInstructions', function() {
      it('returns null for DEFAULT displayName', function() {
        const currentViewState = {
          relatesTo: {
            value: {
              displayName: WEBAUTHN_DISPLAY_NAMES.DEFAULT,
              description: 'Some description',
            }
          }
        };
        expect(getWebAuthnAdditionalInstructions(currentViewState)).toBeNull();
      });

      it('returns null for PASSKEYS displayName', function() {
        const currentViewState = {
          relatesTo: {
            value: {
              displayName: WEBAUTHN_DISPLAY_NAMES.PASSKEYS,
              description: 'Some description',
            }
          }
        };
        expect(getWebAuthnAdditionalInstructions(currentViewState)).toBeNull();
      });

      it('returns description for custom displayName with description', function() {
        const currentViewState = {
          relatesTo: {
            value: {
              displayName: 'My Custom Authenticator',
              description: 'Custom authenticator instructions',
            }
          }
        };
        expect(getWebAuthnAdditionalInstructions(currentViewState)).toBe('Custom authenticator instructions');
      });

      it('returns null for custom displayName without description', function() {
        const currentViewState = {
          relatesTo: {
            value: {
              displayName: 'My Custom Authenticator',
            }
          }
        };
        expect(getWebAuthnAdditionalInstructions(currentViewState)).toBeNull();
      });

      it('returns null when displayName is missing', function() {
        const currentViewState = {
          relatesTo: {
            value: {
              description: 'Some description',
            }
          }
        };
        expect(getWebAuthnAdditionalInstructions(currentViewState)).toBeNull();
      });

      it('returns null when displayName is empty string', function() {
        const currentViewState = {
          relatesTo: {
            value: {
              displayName: '',
              description: 'Some description',
            }
          }
        };
        expect(getWebAuthnAdditionalInstructions(currentViewState)).toBeNull();
      });

      it('returns null when currentViewState is empty', function() {
        expect(getWebAuthnAdditionalInstructions({})).toBeNull();
      });
    });

    describe('getAuthenticatorDataForEnroll - WebAuthn cases', function() {
      it('returns correct data for DEFAULT displayName', function() {
        const authenticator = {
          authenticatorKey: 'webauthn',
          relatesTo: {
            displayName: WEBAUTHN_DISPLAY_NAMES.DEFAULT,
          }
        };
        const data = getAuthenticatorDataForEnroll(authenticator);
        expect(data.description).toBe('Use a security key or a biometric authenticator to sign in');
        expect(data.iconClassName).toBe('mfa-webauthn');
        expect(data.ariaLabel).toBe('Set up Security Key or Biometric Authenticator.');
      });

      it('returns correct data for PASSKEYS displayName', function() {
        const authenticator = {
          authenticatorKey: 'webauthn',
          relatesTo: {
            displayName: WEBAUTHN_DISPLAY_NAMES.PASSKEYS,
          }
        };
        const data = getAuthenticatorDataForEnroll(authenticator);
        expect(data.description).toBe('Use a passkey to sign in with biometrics or a security key.');
        expect(data.iconClassName).toBe('mfa-webauthn');
        expect(data.ariaLabel).toBe('Set up a passkey.');
      });

      it('returns correct data for custom displayName without description', function() {
        const authenticator = {
          authenticatorKey: 'webauthn',
          relatesTo: {
            displayName: 'YubiKey',
          }
        };
        const data = getAuthenticatorDataForEnroll(authenticator);
        // Falls back to DEFAULT description
        expect(data.description).toBe('Use a security key or a biometric authenticator to sign in');
        expect(data.iconClassName).toBe('mfa-webauthn');
        expect(data.ariaLabel).toBe('Set up YubiKey.');
      });

      it('returns correct data for custom displayName with description', function() {
        const authenticator = {
          authenticatorKey: 'webauthn',
          relatesTo: {
            displayName: 'YubiKey',
            description: 'Insert your YubiKey to authenticate.',
          }
        };
        const data = getAuthenticatorDataForEnroll(authenticator);
        expect(data.description).toBe('Insert your YubiKey to authenticate.');
        expect(data.iconClassName).toBe('mfa-webauthn');
        expect(data.ariaLabel).toBe('Set up YubiKey.');
      });
    });

    describe('getAuthenticatorDataForVerification - WebAuthn cases', function() {
      it('returns empty description for verify flow regardless of displayName', function() {
        const authenticator = {
          authenticatorKey: 'webauthn',
          relatesTo: {
            displayName: WEBAUTHN_DISPLAY_NAMES.DEFAULT,
          }
        };
        const data = getAuthenticatorDataForVerification(authenticator);
        expect(data.description).toBe('');
      });

      it('returns correct ariaLabel for DEFAULT displayName in verify', function() {
        const authenticator = {
          authenticatorKey: 'webauthn',
          relatesTo: {
            displayName: WEBAUTHN_DISPLAY_NAMES.DEFAULT,
          }
        };
        const data = getAuthenticatorDataForVerification(authenticator);
        expect(data.ariaLabel).toBe('Select Security Key or Biometric Authenticator.');
      });

      it('returns correct ariaLabel for PASSKEYS displayName in verify', function() {
        const authenticator = {
          authenticatorKey: 'webauthn',
          relatesTo: {
            displayName: WEBAUTHN_DISPLAY_NAMES.PASSKEYS,
          }
        };
        const data = getAuthenticatorDataForVerification(authenticator);
        expect(data.ariaLabel).toBe('Select a passkey.');
      });

      it('returns correct ariaLabel for custom displayName in verify', function() {
        const authenticator = {
          authenticatorKey: 'webauthn',
          relatesTo: {
            displayName: 'TouchID',
          }
        };
        const data = getAuthenticatorDataForVerification(authenticator);
        expect(data.ariaLabel).toBe('Select TouchID.');
      });
    });
  });
});
