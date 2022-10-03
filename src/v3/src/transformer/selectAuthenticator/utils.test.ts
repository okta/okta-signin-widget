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
import { IdxOption } from '@okta/okta-auth-js/lib/idx/types/idx-js';
import { AUTHENTICATOR_ENROLLMENT_DESCR_KEY_MAP, AUTHENTICATOR_KEY, IDX_STEP } from 'src/constants';
import { ButtonType } from 'src/types';

import {
  getAuthenticatorEnrollButtonElements,
  getAuthenticatorVerifyButtonElements,
  getOVMethodTypeAuthenticatorButtonElements,
  isOnlyPushWithAutoChallenge,
} from './utils';

describe('Select Authenticator Utility Tests', () => {
  const stepName = IDX_STEP.SELECT_AUTHENTICATOR_ENROLL;
  describe('getOVMethodTypeAuthenticatorButtonElements Tests', () => {
    it('should return an empty array when an empty array of options is provided', () => {
      expect(getOVMethodTypeAuthenticatorButtonElements([], stepName)).toEqual([]);
    });

    it('should return formatted Authenticator Option Values '
      + 'when OV methodTypes are provided', () => {
      const options = [
        { label: 'Enter a code', value: 'totp' } as IdxOption,
        { label: 'Get a push notification', value: 'push' } as IdxOption,
      ];
      expect(getOVMethodTypeAuthenticatorButtonElements(options, stepName)).toEqual([
        {
          type: 'AuthenticatorButton',
          label: options[0].label,
          options: {
            key: AUTHENTICATOR_KEY.OV,
            ctaLabel: 'oie.verify.authenticator.button.text',
            includeData: true,
            includeImmutableData: false,
            step: 'select-authenticator-enroll',
            type: ButtonType.BUTTON,
            actionParams: {
              'authenticator.methodType': options[0].value,
            },
          },
        },
        {
          type: 'AuthenticatorButton',
          label: options[1].label,
          options: {
            key: AUTHENTICATOR_KEY.OV,
            ctaLabel: 'oie.verify.authenticator.button.text',
            includeData: true,
            includeImmutableData: false,
            step: 'select-authenticator-enroll',
            type: ButtonType.BUTTON,
            actionParams: {
              'authenticator.methodType': options[1].value,
            },
          },
        },
      ]);
    });
  });

  describe('isOnlyPushWithAutoChallenge Tests', () => {
    it('should return false when authenticator inputs are not provided', () => {
      expect(isOnlyPushWithAutoChallenge(undefined)).toBe(false);
    });

    it('should return false when authenticator input values do not contain methodType', () => {
      const authenticatorInputs: Input[] = [{ name: 'autoChallenge' }];
      expect(isOnlyPushWithAutoChallenge(authenticatorInputs)).toBe(false);
    });

    it('should return false when authenticator input values do not contain autoChallenge', () => {
      const authenticatorInputs: Input[] = [{ name: 'methodType' }];
      expect(isOnlyPushWithAutoChallenge(authenticatorInputs)).toBe(false);
    });

    it('should return false when authenticator input values contains multiple methodType options', () => {
      const authenticatorInputs: Input[] = [
        {
          name: 'methodType',
          options: [{ label: 'Code', value: 'totp' }, { label: 'Push', value: 'push' }],
        },
        { name: 'autoChallenge' },
      ];
      expect(isOnlyPushWithAutoChallenge(authenticatorInputs)).toBe(false);
    });

    it('should return false when authenticator input values contain only totp methodType', () => {
      const authenticatorInputs: Input[] = [
        {
          name: 'methodType',
          options: [{ label: 'Code', value: 'totp' }],
        },
        { name: 'autoChallenge' },
      ];
      expect(isOnlyPushWithAutoChallenge(authenticatorInputs)).toBe(false);
    });

    it('should return true when authenticator input values contain only "push" methodType '
      + 'and has autoChallenge input', () => {
      const authenticatorInputs: Input[] = [
        {
          name: 'methodType',
          options: [{ label: 'Push', value: 'push' }],
        },
        { name: 'autoChallenge' },
      ];
      expect(isOnlyPushWithAutoChallenge(authenticatorInputs)).toBe(true);
    });
  });

  describe('getAuthenticatorVerifyButtonElements Tests', () => {
    it('should return empty array when no authenticator options are provided', () => {
      expect(getAuthenticatorVerifyButtonElements([], stepName)).toEqual([]);
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
          if (AUTHENTICATOR_KEY[key] === AUTHENTICATOR_KEY.PHONE) {
            option.relatesTo.profile = { phoneNumber: mockPhoneNumber };
          }
          return option;
        });
      const authenticatorOptionValues = getAuthenticatorVerifyButtonElements(options, stepName);

      expect(authenticatorOptionValues.length).toBe(14);
      options.forEach((option) => {
        const currentOption = authenticatorOptionValues
          .find(({ options: { key: authKey } }) => authKey === option.relatesTo?.key);
        expect(currentOption?.options.key).toBe(option.relatesTo?.key);
        expect(currentOption?.label).toBe(option.label);
        expect(currentOption?.options.ctaLabel)
          .toBe('oie.verify.authenticator.button.text');
        expect(currentOption?.options.description)
          .toBe(option.relatesTo?.key === AUTHENTICATOR_KEY.PHONE ? mockPhoneNumber : undefined);
      });
    });

    it('should return authenticator buttons with multiple enrolled phone number security methods with correct description', () => {
      const options: IdxOption[] = [
        { key: AUTHENTICATOR_KEY.PHONE, phoneNumber: '2XXXXXX123' },
        { key: AUTHENTICATOR_KEY.PHONE, phoneNumber: '2XXXXXX321' },
      ]
        .map((obj) => {
          const option = {
            label: obj.key,
            value: [{ name: 'methodType', value: obj.key }],
            relatesTo: {
              id: '',
              type: '',
              methods: [{ type: '' }],
              displayName: '',
              key: obj.key,
              profile: { phoneNumber: obj.phoneNumber },
            },
          };
          return option;
        });
      const authenticatorOptionValues = getAuthenticatorVerifyButtonElements(options, stepName);

      options.forEach((option, index) => {
        const currentOption = authenticatorOptionValues[index];
        expect(currentOption?.options.key).toBe(option.relatesTo?.key);
        expect(currentOption?.label).toBe(option.label);
        expect(currentOption?.options.ctaLabel)
          .toBe('oie.verify.authenticator.button.text');
        expect(currentOption?.options.description).toBe(option.relatesTo?.profile?.phoneNumber);
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

      const authenticatorOptionValues = getAuthenticatorVerifyButtonElements(options, stepName);

      expect(authenticatorOptionValues).toMatchSnapshot();
      expect(authenticatorOptionValues.length).toBe(2);
      expect(authenticatorOptionValues[0].options.key).toBe(AUTHENTICATOR_KEY.OV);
      expect(authenticatorOptionValues[0].label).toBe('Code');
      expect(authenticatorOptionValues[0].options.ctaLabel).toBe('oie.verify.authenticator.button.text');
      expect(authenticatorOptionValues[0].options.actionParams!['authenticator.methodType']).toBe('totp');
      expect(authenticatorOptionValues[1].options.key).toBe(AUTHENTICATOR_KEY.OV);
      expect(authenticatorOptionValues[1].label).toBe('Push');
      expect(authenticatorOptionValues[1].options.ctaLabel).toBe('oie.verify.authenticator.button.text');
      expect(authenticatorOptionValues[1].options.actionParams!['authenticator.methodType']).toBe('push');
    });
  });

  describe('getAuthenticatorEnrollButtonElements Tests', () => {
    it('should return empty array when no authenticator options are provided', () => {
      expect(getAuthenticatorEnrollButtonElements([], stepName)).toEqual([]);
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
          if (AUTHENTICATOR_KEY[key] === AUTHENTICATOR_KEY.PHONE) {
            option.relatesTo.profile = { phoneNumber: mockPhoneNumber };
          }
          return option;
        });
      const authenticatorOptionValues = getAuthenticatorEnrollButtonElements(options, stepName);

      expect(authenticatorOptionValues.length).toBe(14);
      options.forEach((option) => {
        const currentOption = authenticatorOptionValues
          .find(({ options: { key: authKey } }) => authKey === option.relatesTo?.key);
        expect(currentOption?.options.key).toBe(option.relatesTo?.key);
        expect(currentOption?.label).toBe(option.label);
        expect(currentOption?.options.ctaLabel)
          .toBe('oie.enroll.authenticator.button.text');
        expect(currentOption?.options.description)
          .toBe(AUTHENTICATOR_ENROLLMENT_DESCR_KEY_MAP[option.relatesTo?.key as string]);
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
      const authenticatorOptionValues = getAuthenticatorEnrollButtonElements(options, stepName);

      expect(authenticatorOptionValues).toMatchSnapshot();
      expect(authenticatorOptionValues.length).toBe(1);
      expect(authenticatorOptionValues[0].options.key).toBe(AUTHENTICATOR_KEY.ON_PREM);
      expect(authenticatorOptionValues[0].label).toBe('On Prem');
      expect(authenticatorOptionValues[0].options.ctaLabel)
        .toBe('oie.enroll.authenticator.button.text');
      expect(authenticatorOptionValues[0].options.description)
        .toBe(AUTHENTICATOR_ENROLLMENT_DESCR_KEY_MAP[AUTHENTICATOR_KEY.ON_PREM]);
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

      const authenticatorOptionValues = getAuthenticatorEnrollButtonElements(options, stepName);

      expect(authenticatorOptionValues).toMatchSnapshot();
      expect(authenticatorOptionValues.length).toBe(2);
      expect(authenticatorOptionValues[0].options.key).toBe(AUTHENTICATOR_KEY.OV);
      expect(authenticatorOptionValues[0].label).toBe('Code');
      expect(authenticatorOptionValues[0].options.ctaLabel).toBe('oie.enroll.authenticator.button.text');
      expect(authenticatorOptionValues[0].options.actionParams!['authenticator.methodType']).toBe('totp');
      expect(authenticatorOptionValues[1].label).toBe('Push');
      expect(authenticatorOptionValues[1].options.ctaLabel).toBe('oie.enroll.authenticator.button.text');
      expect(authenticatorOptionValues[1].options.actionParams!['authenticator.methodType']).toBe('push');
    });
  });
});
