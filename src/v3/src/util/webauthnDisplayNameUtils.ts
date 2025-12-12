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

/**
 * WebAuthn displayName constants for passkeys rebranding
 */
export const WEBAUTHN_DISPLAY_NAMES = {
  DEFAULT: 'Security Key or Biometric',
  PASSKEYS: 'Passkeys',
} as const;

/**
 * i18n key mappings based on context and displayName
 */
export const WEBAUTHN_I18N_KEYS = {
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
  ENROLL_INSTRUCTIONS: {
    DEFAULT: 'oie.enroll.webauthn.instructions',
    PASSKEYS: 'oie.enroll.webauthn.instructions',
    CUSTOM: 'oie.enroll.webauthn.instructions',
  },
  VERIFY_INSTRUCTIONS: {
    DEFAULT: 'oie.verify.webauthn.instructions',
    PASSKEYS: 'oie.verify.webauthn.instructions',
    CUSTOM: 'oie.verify.webauthn.instructions',
  },
  DESCRIPTION: {
    DEFAULT: 'oie.webauthn.description',
    PASSKEYS: 'oie.webauthn.passkeysRebrand.passkeys.description',
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
  },
} as const;

/**
 * Determines which i18n key to use based on displayName
 * @param keyMap - The key mapping object (e.g., WEBAUTHN_I18N_KEYS.ENROLL_TITLE)
 * @param displayName - The displayName from IDX response
 * @returns The complete i18n key
 */
export const getWebAuthnI18nKey = (
  keyMap: Record<string, string>,
  displayName?: string,
): string => {
  if (!displayName || displayName === WEBAUTHN_DISPLAY_NAMES.DEFAULT) {
    return keyMap.DEFAULT;
  }
  if (displayName === WEBAUTHN_DISPLAY_NAMES.PASSKEYS) {
    return keyMap.PASSKEYS;
  }
  return keyMap.CUSTOM;
};

/**
 * Gets parameters for i18n string replacement (for CUSTOM case)
 * @param displayName - The displayName from IDX response
 * @returns Array of parameters for loc() function
 */
export const getWebAuthnI18nParams = (displayName?: string): string[] => {
  const isCustom = displayName &&
    displayName !== WEBAUTHN_DISPLAY_NAMES.DEFAULT &&
    displayName !== WEBAUTHN_DISPLAY_NAMES.PASSKEYS;
  return isCustom ? [displayName] : [];
};

/**
 * Checks if additional instructions should be shown for custom authenticators
 * @param displayName - The displayName from IDX response
 * @param description - The description from IDX response
 * @returns true if custom instructions should be displayed
 */
export const shouldShowWebAuthnAdditionalInstructions = (
  displayName?: string,
  description?: string,
): boolean => {
  return !!(
    displayName &&
    displayName !== WEBAUTHN_DISPLAY_NAMES.DEFAULT &&
    displayName !== WEBAUTHN_DISPLAY_NAMES.PASSKEYS &&
    description
  );
};
