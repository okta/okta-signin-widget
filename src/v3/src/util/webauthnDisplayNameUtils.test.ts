/*
 * Copyright (c) 2022-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import {
  getWebAuthnI18nKey,
  getWebAuthnI18nParams,
  shouldShowWebAuthnAdditionalInstructions,
  WEBAUTHN_DISPLAY_NAMES,
  WEBAUTHN_I18N_KEYS,
} from './webauthnDisplayNameUtils';

describe('webauthnDisplayNameUtils', () => {
  describe('getWebAuthnI18nKey', () => {
    const mockKeyMap = {
      DEFAULT: 'default.key',
      PASSKEYS: 'passkeys.key',
      CUSTOM: 'custom.key',
    };

    it('should return DEFAULT key when displayName is undefined', () => {
      expect(getWebAuthnI18nKey(mockKeyMap, undefined)).toBe('default.key');
    });

    it('should return DEFAULT key when displayName matches DEFAULT constant', () => {
      expect(getWebAuthnI18nKey(mockKeyMap, WEBAUTHN_DISPLAY_NAMES.DEFAULT)).toBe('default.key');
    });

    it('should return PASSKEYS key when displayName matches PASSKEYS constant', () => {
      expect(getWebAuthnI18nKey(mockKeyMap, WEBAUTHN_DISPLAY_NAMES.PASSKEYS)).toBe('passkeys.key');
    });

    it('should return CUSTOM key when displayName is a custom value', () => {
      expect(getWebAuthnI18nKey(mockKeyMap, 'YubiKey')).toBe('custom.key');
    });

    it('should return CUSTOM key when displayName is TouchID', () => {
      expect(getWebAuthnI18nKey(mockKeyMap, 'TouchID')).toBe('custom.key');
    });
  });

  describe('getWebAuthnI18nParams', () => {
    it('should return empty array for DEFAULT displayName', () => {
      expect(getWebAuthnI18nParams(WEBAUTHN_DISPLAY_NAMES.DEFAULT)).toEqual([]);
    });

    it('should return empty array for PASSKEYS displayName', () => {
      expect(getWebAuthnI18nParams(WEBAUTHN_DISPLAY_NAMES.PASSKEYS)).toEqual([]);
    });

    it('should return empty array when displayName is undefined', () => {
      expect(getWebAuthnI18nParams(undefined)).toEqual([]);
    });

    it('should return array with displayName for custom value', () => {
      expect(getWebAuthnI18nParams('YubiKey')).toEqual(['YubiKey']);
    });

    it('should return array with displayName for TouchID', () => {
      expect(getWebAuthnI18nParams('TouchID')).toEqual(['TouchID']);
    });
  });

  describe('shouldShowWebAuthnAdditionalInstructions', () => {
    it('should return false for DEFAULT displayName with description', () => {
      expect(shouldShowWebAuthnAdditionalInstructions(
        WEBAUTHN_DISPLAY_NAMES.DEFAULT,
        'Some description',
      )).toBe(false);
    });

    it('should return false for PASSKEYS displayName with description', () => {
      expect(shouldShowWebAuthnAdditionalInstructions(
        WEBAUTHN_DISPLAY_NAMES.PASSKEYS,
        'Some description',
      )).toBe(false);
    });

    it('should return true for custom displayName with description', () => {
      expect(shouldShowWebAuthnAdditionalInstructions(
        'YubiKey',
        'Insert your YubiKey and tap.',
      )).toBe(true);
    });

    it('should return false for custom displayName without description', () => {
      expect(shouldShowWebAuthnAdditionalInstructions('YubiKey', undefined)).toBe(false);
    });

    it('should return false when displayName is undefined', () => {
      expect(shouldShowWebAuthnAdditionalInstructions(undefined, 'Some description')).toBe(false);
    });

    it('should return false when both displayName and description are undefined', () => {
      expect(shouldShowWebAuthnAdditionalInstructions(undefined, undefined)).toBe(false);
    });

    it('should return false for empty string displayName', () => {
      expect(shouldShowWebAuthnAdditionalInstructions('', 'Some description')).toBe(false);
    });

    it('should return false for empty string description', () => {
      expect(shouldShowWebAuthnAdditionalInstructions('YubiKey', '')).toBe(false);
    });
  });

  describe('WEBAUTHN_I18N_KEYS constants', () => {
    it('should have correct ENROLL_TITLE keys', () => {
      expect(WEBAUTHN_I18N_KEYS.ENROLL_TITLE.DEFAULT).toBe('oie.enroll.webauthn.title');
      expect(WEBAUTHN_I18N_KEYS.ENROLL_TITLE.PASSKEYS).toBe('oie.enroll.webauthn.passkeysRebrand.passkeys.title');
      expect(WEBAUTHN_I18N_KEYS.ENROLL_TITLE.CUSTOM).toBe('oie.enroll.webauthn.passkeysRebrand.custom.title');
    });

    it('should have correct VERIFY_TITLE keys', () => {
      expect(WEBAUTHN_I18N_KEYS.VERIFY_TITLE.DEFAULT).toBe('oie.verify.webauth.title');
      expect(WEBAUTHN_I18N_KEYS.VERIFY_TITLE.PASSKEYS).toBe('oie.verify.webauth.passkeysRebrand.passkeys.title');
      expect(WEBAUTHN_I18N_KEYS.VERIFY_TITLE.CUSTOM).toBe('oie.verify.webauth.passkeysRebrand.custom.title');
    });

    it('should have correct SELECT_ENROLL_LABEL keys', () => {
      expect(WEBAUTHN_I18N_KEYS.SELECT_ENROLL_LABEL.DEFAULT).toBe('oie.select.authenticator.enroll.webauthn.label');
      expect(WEBAUTHN_I18N_KEYS.SELECT_ENROLL_LABEL.PASSKEYS).toBe('oie.select.authenticator.enroll.webauthn.passkeysRebrand.passkeys.label');
      expect(WEBAUTHN_I18N_KEYS.SELECT_ENROLL_LABEL.CUSTOM).toBe('oie.select.authenticator.enroll.webauthn.passkeysRebrand.custom.label');
    });

    it('should have correct SELECT_VERIFY_LABEL keys', () => {
      expect(WEBAUTHN_I18N_KEYS.SELECT_VERIFY_LABEL.DEFAULT).toBe('oie.select.authenticator.verify.webauthn.label');
      expect(WEBAUTHN_I18N_KEYS.SELECT_VERIFY_LABEL.PASSKEYS).toBe('oie.select.authenticator.verify.webauthn.passkeysRebrand.passkeys.label');
      expect(WEBAUTHN_I18N_KEYS.SELECT_VERIFY_LABEL.CUSTOM).toBe('oie.select.authenticator.verify.webauthn.passkeysRebrand.custom.label');
    });
  });
});
