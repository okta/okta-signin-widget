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

import { getUniqueCountryCodes, isPhoneNumberSet } from './addPhoneValidation';

describe('Required Phonenumber validation tests', () => {
  const countryCodes = getUniqueCountryCodes();

  it('should return false when phone number only contains country code for all countries', () => {
    countryCodes.forEach((code) => {
      const phoneNumberWithOnlyCountryCode = `+${code}`;
      expect(isPhoneNumberSet(phoneNumberWithOnlyCountryCode)).toBe(false);
    });
  });

  it('should return false when phone number only contains country code and extension for all countries', () => {
    countryCodes.forEach((code) => {
      const phoneNumberWithOnlyCountryCode = `+${code}x3456`;
      expect(isPhoneNumberSet(phoneNumberWithOnlyCountryCode)).toBe(false);
    });
  });

  it('should return true when phone number contains country code and one additional number for all countries', () => {
    Array(10).forEach((num) => {
      countryCodes.forEach((code) => {
        const phoneNumberWithOnlyCountryCode = `+${code}${num}`;
        expect(isPhoneNumberSet(phoneNumberWithOnlyCountryCode)).toBe(true);
      });
    });
  });
});
