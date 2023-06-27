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

import { Input } from '@okta/okta-auth-js';

import { AutoCompleteValue, InputAttributes, InputModeValue } from '../../types';
import { isAndroidOrIOS } from '../../util';

type Result = {
  attributes: InputAttributes;
};

const autocompleteValueMap = new Map<string, AutoCompleteValue>([
  ['identifier', 'username'],
  ['password', 'current-password'],
  ['newPassword', 'current-password'],
  ['passcode', 'one-time-code'],
  ['totp', 'one-time-code'],
  ['phoneNumber', 'tel-national'],
  ['firstName', 'given-name'],
  ['lastName', 'family-name'],
  ['email', 'email'],
  ['question', 'off'],
  ['answer', 'off'],
]);

const inputModeValueMap = new Map<string, InputModeValue>([
  ['passcode', 'numeric'],
  ['totp', 'numeric'],
  ['email', 'email'],
  ['phoneNumber', 'tel'],
]);

const getKeyFromMap = (
  map: Map<string, unknown>,
  inputName: string,
): string | undefined => {
  let isMatch: string | undefined;
  map.forEach((_, key: string) => {
    if (inputName.match(key)?.length) {
      isMatch = key;
    }
  });
  return isMatch;
};

const autocompleteValueTransformer = (input: Input): AutoCompleteValue | null => {
  // passcode name is shared with password + totp code types, only differ by secret
  if (input.name === 'credentials.passcode' && input.secret) {
    return autocompleteValueMap.get('password') ?? null;
  }
  const key = getKeyFromMap(autocompleteValueMap, input.name);
  const autocompleteValue = key ? autocompleteValueMap.get(key) ?? null : null;
  // If not on iOS or Android, disable autocomplete for otp
  return autocompleteValue === 'one-time-code' && !isAndroidOrIOS() ? 'off' : autocompleteValue;
};

const inputModeValueTransformer = (input: Input): InputModeValue | null => {
  // passcode name is shared with password + totp code types, only differ by secret
  if (input.name === 'credentials.passcode' && input.secret) {
    return null;
  }
  const key = getKeyFromMap(inputModeValueMap, input.name);
  return key ? inputModeValueMap.get(key) ?? null : null;
};

export const transformer = (input: Input): Result | null => {
  const attributes: InputAttributes = {};
  const autocompleteValue = autocompleteValueTransformer(input);
  if (autocompleteValue) {
    attributes.autocomplete = autocompleteValue;
  }

  // Inputmode is used to optimize the mobile virtual keyboard based on the type of content entered
  // See https://web.dev/sms-otp-form/#inputmode=numeric
  const inputModeValue = inputModeValueTransformer(input);
  if (inputModeValue) {
    attributes.inputmode = inputModeValue;
  }
  // Can add additional attributes here when/if necessary
  return Object.keys(attributes).length ? { attributes } : null;
};
