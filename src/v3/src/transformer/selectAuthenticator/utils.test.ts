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
  IdxOption,
  IdxRemediationValue,
} from '@okta/okta-auth-js/lib/idx/types/idx-js';
import { AUTHENTICATOR_ENROLLMENT_DESCR_KEY_MAP, AUTHENTICATOR_KEY } from 'src/constants';

import {
  getAuthenticatorEnrollOptions,
  getAuthenticatorVerifyOptions,
  getOVMethodTypeAuthenticatorOptions,
  isOnlyPushWithAutoChallenge,
} from './utils';

describe('Select Authenticator Utility Tests', () => {
  describe('getOVMethodTypeAuthenticatorOptions Tests', () => {
    it('should return an empty array when no options are provided', () => {
      expect(getOVMethodTypeAuthenticatorOptions()).toEqual([]);
    });

    it('should return an empty array when an empty array of options is provided', () => {
      expect(getOVMethodTypeAuthenticatorOptions([])).toEqual([]);
    });

    it('should return formatted Authenticator Option Values '
      + 'when OV methodTypes are provided', () => {
      const options = [
        { label: 'Enter a code', value: 'totp' } as IdxOption,
        { label: 'Get a push notification', value: 'push' } as IdxOption,
      ];
      expect(getOVMethodTypeAuthenticatorOptions(options)).toEqual([
        {
          key: AUTHENTICATOR_KEY.OV,
          label: options[0].label,
          value: {
            label: 'oie.verify.authenticator.button.text',
            methodType: options[0].value,
          },
        },
        {
          key: AUTHENTICATOR_KEY.OV,
          label: options[1].label,
          value: {
            label: 'oie.verify.authenticator.button.text',
            methodType: options[1].value,
          },
        },
      ]);
    });
  });

  describe('isOnlyPushWithAutoChallenge Tests', () => {
    it('should return false when remediation value is not provided', () => {
      expect(isOnlyPushWithAutoChallenge()).toBe(false);
    });

    it('should return false when remediation value does not contain methodType', () => {
      const authenticator: IdxRemediationValue = {
        name: 'authenticator',
        form: { value: [{ name: 'autoChallenge' }] },
      };
      expect(isOnlyPushWithAutoChallenge(authenticator)).toBe(false);
    });

    it('should return false when remediation value does not contain autoChallenge', () => {
      const authenticator: IdxRemediationValue = {
        name: 'authenticator',
        form: { value: [{ name: 'methodType' }] },
      };
      expect(isOnlyPushWithAutoChallenge(authenticator)).toBe(false);
    });

    it('should return false when remediation value contains multiple methodType options', () => {
      const authenticator: IdxRemediationValue = {
        name: 'authenticator',
        form: {
          value: [
            {
              name: 'methodType',
              options: [{ label: 'Code', value: 'totp' }, { label: 'Push', value: 'push' }],
            },
            { name: 'autoChallenge' },
          ],
        },
      };
      expect(isOnlyPushWithAutoChallenge(authenticator)).toBe(false);
    });

    it('should return false when remediation value contains only totp methodType', () => {
      const authenticator: IdxRemediationValue = {
        name: 'authenticator',
        form: {
          value: [
            {
              name: 'methodType',
              options: [{ label: 'Code', value: 'totp' }],
            },
            { name: 'autoChallenge' },
          ],
        },
      };
      expect(isOnlyPushWithAutoChallenge(authenticator)).toBe(false);
    });

    it('should return true when remediation value contains only push methodType '
      + 'and has autoChallenge input', () => {
      const authenticator: IdxRemediationValue = {
        name: 'authenticator',
        form: {
          value: [
            {
              name: 'methodType',
              options: [{ label: 'Push', value: 'push' }],
            },
            { name: 'autoChallenge' },
          ],
        },
      };
      expect(isOnlyPushWithAutoChallenge(authenticator)).toBe(true);
    });
  });

  describe('getAuthenticatorVerifyOptions Tests', () => {
    it('should return empty array when no authenticator options are provided', () => {
      expect(getAuthenticatorVerifyOptions([])).toEqual([]);
    });

    it('should return formatted authenticator options when raw options are provided', () => {
      const mockPhoneNumber = '2XXXXXX123';
      const options: IdxOption[] = Object.entries(AUTHENTICATOR_KEY)
        .filter(([, value]) => value !== AUTHENTICATOR_KEY.OV
          && value !== AUTHENTICATOR_KEY.DEFAULT)
        .map(([key]) => {
          const option = {
            label: key,
            value: [{ name: 'methodType', value: AUTHENTICATOR_KEY[key] }],
            relatesTo: {
              id: '',
              type: '',
              methods: [{ type: '' }],
              displayName: '',
              key: AUTHENTICATOR_KEY[key],
              profile: {},
            },
          };
          if (key === AUTHENTICATOR_KEY.PHONE) {
            option.relatesTo.profile = { phoneNumber: mockPhoneNumber };
          }
          return option;
        });
      const authenticatorOptionValues = getAuthenticatorVerifyOptions(options);

      expect(authenticatorOptionValues.length).toBe(15);
      options.forEach((option) => {
        const currentOption = authenticatorOptionValues
          .find(({ key: authKey }) => authKey === option.relatesTo?.key);
        expect(currentOption?.key).toBe(option.relatesTo?.key);
        expect(currentOption?.label).toBe(option.label);
        expect(currentOption?.value.key).toBe(option.relatesTo?.key);
        expect(currentOption?.value.label)
          .toBe('oie.verify.authenticator.button.text');
        expect(currentOption?.description)
          .toBe(option.value === AUTHENTICATOR_KEY.PHONE ? mockPhoneNumber : undefined);
        expect(currentOption?.descriptionParams).toBeUndefined();
      });
    });

    it('should return formatted Okta Verify method type options '
      + 'when raw options are provided', () => {
      const options: IdxOption[] = [{
        label: 'Okta Verify',
        value: [
          {
            name: 'methodType',
            options: [
              { label: 'Code', value: 'totp' },
              { label: 'Push', value: 'push' },
            ],
          },
          { name: 'id', value: '1234abc' },
        ],
        relatesTo: {
          id: '',
          type: '',
          methods: [{ type: '' }],
          displayName: '',
          key: AUTHENTICATOR_KEY.OV,
        },
      }];

      const authenticatorOptionValues = getAuthenticatorVerifyOptions(options);

      expect(authenticatorOptionValues.length).toBe(2);
      expect(authenticatorOptionValues[0].key).toBe(AUTHENTICATOR_KEY.OV);
      expect(authenticatorOptionValues[0].label).toBe('Code');
      expect(authenticatorOptionValues[0].value.label).toBe('oie.verify.authenticator.button.text');
      expect(authenticatorOptionValues[0].value.methodType).toBe('totp');
      expect(authenticatorOptionValues[1].key).toBe(AUTHENTICATOR_KEY.OV);
      expect(authenticatorOptionValues[1].label).toBe('Push');
      expect(authenticatorOptionValues[1].value.label).toBe('oie.verify.authenticator.button.text');
      expect(authenticatorOptionValues[1].value.methodType).toBe('push');
    });
  });

  describe('getAuthenticatorEnrollOptions Tests', () => {
    it('should return empty array when no authenticator options are provided', () => {
      expect(getAuthenticatorEnrollOptions([])).toEqual([]);
    });

    it('should return formatted authenticator options when raw options are provided', () => {
      const mockPhoneNumber = '2XXXXXX123';
      const options: IdxOption[] = Object.entries(AUTHENTICATOR_KEY)
        .filter(([, value]) => value !== AUTHENTICATOR_KEY.OV
          && value !== AUTHENTICATOR_KEY.DEFAULT)
        .map(([key]) => {
          const option = {
            label: key,
            value: [{ name: 'methodType', value: AUTHENTICATOR_KEY[key] }],
            relatesTo: {
              id: '',
              type: '',
              methods: [{ type: '' }],
              displayName: '',
              key: AUTHENTICATOR_KEY[key],
              profile: {},
            },
          };
          if (key === AUTHENTICATOR_KEY.PHONE) {
            option.relatesTo.profile = { phoneNumber: mockPhoneNumber };
          }
          return option;
        });
      const authenticatorOptionValues = getAuthenticatorEnrollOptions(options);

      expect(authenticatorOptionValues.length).toBe(15);
      options.forEach((option) => {
        const currentOption = authenticatorOptionValues
          .find(({ key: authKey }) => authKey === option.relatesTo?.key);
        expect(currentOption?.key).toBe(option.relatesTo?.key);
        expect(currentOption?.label).toBe(option.label);
        expect(currentOption?.value.key).toBe(option.relatesTo?.key);
        expect(currentOption?.value.label)
          .toBe('oie.enroll.authenticator.button.text');
        expect(currentOption?.description)
          .toBe(AUTHENTICATOR_ENROLLMENT_DESCR_KEY_MAP[option.relatesTo?.key as string]);
        expect(currentOption?.descriptionParams)
          .toEqual(
            option.relatesTo?.key === AUTHENTICATOR_KEY.ON_PREM
              ? ['oie.on_prem.authenticator.default.vendorName']
              : undefined,
          );
      });
    });

    it('should format on_prem authenticator option when display name exists', () => {
      const displayName = 'Some Company Name';
      const options: IdxOption[] = [{
        label: 'On Prem',
        value: [{ name: 'methodType', value: AUTHENTICATOR_KEY.ON_PREM }],
        relatesTo: {
          id: '',
          type: '',
          methods: [{ type: '' }],
          displayName,
          key: AUTHENTICATOR_KEY.ON_PREM,
        },
      }];
      const authenticatorOptionValues = getAuthenticatorEnrollOptions(options);

      expect(authenticatorOptionValues.length).toBe(1);
      expect(authenticatorOptionValues[0].key).toBe(AUTHENTICATOR_KEY.ON_PREM);
      expect(authenticatorOptionValues[0].label).toBe('On Prem');
      expect(authenticatorOptionValues[0].value.key).toBe(AUTHENTICATOR_KEY.ON_PREM);
      expect(authenticatorOptionValues[0].value.label)
        .toBe('oie.enroll.authenticator.button.text');
      expect(authenticatorOptionValues[0].description)
        .toBe(AUTHENTICATOR_ENROLLMENT_DESCR_KEY_MAP[AUTHENTICATOR_KEY.ON_PREM]);
      expect(authenticatorOptionValues[0].descriptionParams).toEqual([displayName]);
    });

    it('should return formatted Okta Verify method type options '
      + 'when raw options are provided', () => {
      const options: IdxOption[] = [{
        label: 'Okta Verify',
        value: [
          {
            name: 'methodType',
            options: [
              { label: 'Code', value: 'totp' },
              { label: 'Push', value: 'push' },
            ],
          },
          { name: 'id', value: '1234abc' },
        ],
        relatesTo: {
          id: '',
          type: '',
          methods: [{ type: '' }],
          displayName: '',
          key: AUTHENTICATOR_KEY.OV,
        },
      }];

      const authenticatorOptionValues = getAuthenticatorEnrollOptions(options);

      expect(authenticatorOptionValues.length).toBe(2);
      expect(authenticatorOptionValues[0].key).toBe(AUTHENTICATOR_KEY.OV);
      expect(authenticatorOptionValues[0].label).toBe('Code');
      expect(authenticatorOptionValues[0].value.label).toBe('oie.enroll.authenticator.button.text');
      expect(authenticatorOptionValues[0].value.methodType).toBe('totp');
      expect(authenticatorOptionValues[1].key).toBe(AUTHENTICATOR_KEY.OV);
      expect(authenticatorOptionValues[1].label).toBe('Push');
      expect(authenticatorOptionValues[1].value.label).toBe('oie.enroll.authenticator.button.text');
      expect(authenticatorOptionValues[1].value.methodType).toBe('push');
    });
  });
});
