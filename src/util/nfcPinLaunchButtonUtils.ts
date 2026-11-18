/*!
 * Copyright (c) 2026-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

// IDX form/step name for the "Sign in with NFC" remediation. Defined here (rather than only in the
// engine-specific RemediationConstants / IDX_STEP) so v2 and v3 can share it without cross-engine imports.
export const LAUNCH_NFC_AUTHENTICATOR_STEP = 'launch-nfc-authenticator';

export const NFC_PIN_LAUNCH_BUTTON_I18N_KEYS = {
  DEFAULT: 'oie.nfc_pin.launch.button',
  CUSTOM: 'oie.nfc_pin.launch.button.custom',
} as const;

interface NfcPinLaunchButtonLabel {
  i18nKey: string;
  params?: string[];
}

/**
 * Resolves the i18n key and params for the "Sign in with NFC" button.
 *
 * The backend sets `customAuthenticatorName` on the `launch-nfc-authenticator` remediation only when the
 * admin has renamed the NFC authenticator (behind NFC_POST_EA_ENHANCEMENTS), since the identify page has
 * no authenticator object to read the name from. Without it, the default "Sign in with NFC" label is used.
 */
export const getNfcPinLaunchButtonLabel = (
  remediations: Array<{ name: string; customAuthenticatorName?: unknown }> = [],
): NfcPinLaunchButtonLabel => {
  const customName = remediations.find(({ name }) => name === LAUNCH_NFC_AUTHENTICATOR_STEP)
    ?.customAuthenticatorName;

  if (typeof customName === 'string' && customName.trim()) {
    return { i18nKey: NFC_PIN_LAUNCH_BUTTON_I18N_KEYS.CUSTOM, params: [customName.trim()] };
  }
  return { i18nKey: NFC_PIN_LAUNCH_BUTTON_I18N_KEYS.DEFAULT };
};
