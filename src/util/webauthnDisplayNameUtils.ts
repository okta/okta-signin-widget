/*!
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

/**
 * WebAuthn displayName constants for passkeys rebranding
 */
export const WEBAUTHN_DISPLAY_NAMES = {
  DEFAULT: 'Security Key or Biometric',
  PASSKEYS: 'Passkeys',
} as const;

/**
 * Variant key mapping for i18n keys with DEFAULT/PASSKEYS/CUSTOM variants
 */
interface VariantKeyMap {
  DEFAULT: string;
  PASSKEYS: string;
  CUSTOM: string;
}

/**
 * i18n key mappings based on context and displayName
 * Organized by keys that have variants vs static keys
 */
interface WebAuthnI18nKeys {
  // Keys with displayName variants (DEFAULT, PASSKEYS, CUSTOM)
  ENROLL_TITLE: VariantKeyMap;
  VERIFY_TITLE: VariantKeyMap;
  DESCRIPTION: VariantKeyMap;
  SELECT_ENROLL_LABEL: VariantKeyMap;
  SELECT_VERIFY_LABEL: VariantKeyMap;
  LABEL: VariantKeyMap;
  // Static keys that don't vary by displayName
  ENROLL_INSTRUCTIONS: string;
  VERIFY_INSTRUCTIONS: string;
}

export const WEBAUTHN_I18N_KEYS: WebAuthnI18nKeys = {
  // Keys with displayName variants (DEFAULT, PASSKEYS, CUSTOM)
  ENROLL_TITLE: {
    DEFAULT: 'oie.enroll.webauthn.title',
    PASSKEYS: 'oie.enroll.webauthn.passkeysRebrand.passkeys.title',
    CUSTOM: 'oie.enroll.webauthn.passkeysRebrand.custom.title',
  },
  VERIFY_TITLE: {
    DEFAULT: 'oie.verify.webauth.title',
    PASSKEYS: 'oie.verify.webauth.passkeysRebrand.passkeys.title',
    CUSTOM: 'oie.verify.webauth.passkeysRebrand.custom.title',
  },
  DESCRIPTION: {
    DEFAULT: 'oie.webauthn.description',
    PASSKEYS: 'oie.webauthn.passkeysRebrand.passkeys.description',
    CUSTOM: 'oie.webauthn.description', // Falls back to DEFAULT for custom
  },
  SELECT_ENROLL_LABEL: {
    DEFAULT: 'oie.select.authenticator.enroll.webauthn.label',
    PASSKEYS: 'oie.select.authenticator.enroll.webauthn.passkeysRebrand.passkeys.label',
    CUSTOM: 'oie.select.authenticator.enroll.webauthn.passkeysRebrand.custom.label',
  },
  SELECT_VERIFY_LABEL: {
    DEFAULT: 'oie.select.authenticator.verify.webauthn.label',
    PASSKEYS: 'oie.select.authenticator.verify.webauthn.passkeysRebrand.passkeys.label',
    CUSTOM: 'oie.select.authenticator.verify.webauthn.passkeysRebrand.custom.label',
  },
  LABEL: {
    DEFAULT: 'oie.webauthn.label',
    PASSKEYS: 'oie.webauthn.passkeysRebrand.passkeys.label',
    CUSTOM: 'oie.webauthn.label', // Falls back to DEFAULT for custom
  },
  // Static keys that don't vary by displayName
  ENROLL_INSTRUCTIONS: 'oie.enroll.webauthn.instructions',
  VERIFY_INSTRUCTIONS: 'oie.verify.webauthn.instructions',
};

/**
 * Checks if displayName is a custom value (not DEFAULT, not PASSKEYS)
 */
export const isCustomDisplayName = (displayName?: string): boolean => {
  return Boolean(
    displayName &&
    displayName !== WEBAUTHN_DISPLAY_NAMES.DEFAULT &&
    displayName !== WEBAUTHN_DISPLAY_NAMES.PASSKEYS
  );
};

/**
 * Determines which i18n key to use based on displayName
 * Handles both variant key maps (objects with DEFAULT/PASSKEYS/CUSTOM)
 * and static keys (strings)
 */
export const getWebAuthnI18nKey = (
  keyMap: VariantKeyMap | string,
  displayName?: string
): string | null => {
  // Handle static string keys (no variant)
  if (typeof keyMap === 'string') {
    return keyMap;
  }
  
  // Validate keyMap is an object
  if (!keyMap || typeof keyMap !== 'object') {
    return null;
  }
  
  // Check for exact PASSKEYS match
  if (displayName === WEBAUTHN_DISPLAY_NAMES.PASSKEYS && keyMap.PASSKEYS) {
    return keyMap.PASSKEYS;
  }
  
  // Check for CUSTOM displayName
  if (isCustomDisplayName(displayName) && keyMap.CUSTOM) {
    return keyMap.CUSTOM;
  }
  
  // Fallback to DEFAULT
  return keyMap.DEFAULT || null;
};

/**
 * Gets parameters for i18n string replacement (for CUSTOM case)
 */
export const getWebAuthnI18nParams = (displayName?: string): string[] => {
  if (isCustomDisplayName(displayName) && displayName) {
    return [displayName];
  }
  return [];
};

/**
 * Checks if additional instructions should be shown for custom authenticators
 */
export const shouldShowWebAuthnAdditionalInstructions = (
  displayName?: string,
  description?: string
): boolean => {
  return Boolean(isCustomDisplayName(displayName) && description);
};
