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

import { AutoCompleteValue, InputAttributes, Nullable } from '../../types';

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

const getKeyFromMap = (
  map: Map<string, AutoCompleteValue>,
  inputName: string,
): string | undefined => {
  let isMatch;
  map.forEach((value: AutoCompleteValue, key: string) => {
    if (inputName.match(key)?.length) {
      isMatch = key;
    }
  });
  return isMatch;
};

const autocompleteValueTransformer = (input: Input): Nullable<AutoCompleteValue> => {
  // passcode name is shared with password + totp code types, only differ by secret
  if (input.name === 'credentials.passcode' && input.secret) {
    return autocompleteValueMap.get('password') ?? null;
  }
  const key = getKeyFromMap(autocompleteValueMap, input.name);
  if (key) {
    return autocompleteValueMap.get(key) ?? null;
  }
  return null;
};

export const transformer = (input: Input): Nullable<Result> => {
  const attributes: InputAttributes = {};
  const autocompleteValue = autocompleteValueTransformer(input);
  if (autocompleteValue) {
    attributes.autocomplete = autocompleteValue;
  }
  // Can add additional attributes here when/if necessary
  return Object.keys(attributes).length ? { attributes } : null;
};
