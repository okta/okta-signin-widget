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
import { IdxAuthenticator, IdxOption } from '@okta/okta-auth-js/types/lib/idx/types/idx-js';
import { AUTHENTICATOR_ENROLLMENT_DESCR_KEY_MAP, AUTHENTICATOR_KEY, IDX_STEP } from 'src/constants';
import { ButtonType } from 'src/types';

import {
  getAppAuthenticatorMethodButtonElements,
  getAuthenticatorEnrollButtonElements,
  getAuthenticatorVerifyButtonElements,
  isOnlyPushWithAutoChallenge,
} from './utils';

describe('Select Authenticator Utility Tests', () => {
  const stepName = IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE;
  describe('getAppAuthenticatorMethodButtonElements Tests', () => {
    it('should return an empty array when an empty array of options is provided', () => {
      expect(getAppAuthenticatorMethodButtonElements({ name: 'authenticator' }, stepName)).toEqual([]);
    });

    it('should return formatted Authenticator Option Values '
      + 'when OV methodTypes are provided', () => {
      const options = [
        { label: 'Enter a code', value: 'totp' } as IdxOption,
        { label: 'Get a push notification', value: 'push' } as IdxOption,
      ];
      const authenticator: Input = {
        name: 'authenticator',
        value: [
          { name: 'id', value: 'abcde1234' },
          { name: 'methodType', options },
        ],
      };
      expect(getAppAuthenticatorMethodButtonElements(authenticator, stepName)).toEqual([
        {
          type: 'AuthenticatorButton',
          label: 'oie.okta_verify.label',
          id: 'auth_btn_okta_verify_totp',
          options: {
            key: AUTHENTICATOR_KEY.OV,
            ctaLabel: 'oie.verify.authenticator.button.text',
            includeData: true,
            includeImmutableData: false,
            step: 'select-authenticator-authenticate',
            type: ButtonType.BUTTON,
            actionParams: {
              'authenticator.id': 'abcde1234',
              'authenticator.methodType': options[0].value,
            },
            ariaLabel: 'oie.select.authenticator.okta_verify.totp.label',
            description: options[0].label,
            dataSe: `okta_verify-${options[0].value}`,
            iconName: 'okta_verify_0',
          },
        },
        {
          type: 'AuthenticatorButton',
          label: 'oie.okta_verify.label',
          id: 'auth_btn_okta_verify_push',
          options: {
            key: AUTHENTICATOR_KEY.OV,
            ctaLabel: 'oie.verify.authenticator.button.text',
            includeData: true,
            includeImmutableData: false,
            step: 'select-authenticator-authenticate',
            type: ButtonType.BUTTON,
            actionParams: {
              'authenticator.id': 'abcde1234',
              'authenticator.methodType': options[1].value,
            },
            ariaLabel: 'oie.select.authenticator.okta_verify.push.label',
            description: options[1].label,
            dataSe: `okta_verify-${options[1].value}`,
            iconName: 'okta_verify_1',
          },
        },
      ]);
    });

    it('should return ordered formatted Authenticator Option Values '
      + 'when OV methodTypes contain okta fastpass signed_nonce and deviceKnown=true', () => {
      const options = [
        { label: 'Enter a code', value: 'totp' } as IdxOption,
        { label: 'Get a push notification', value: 'push' } as IdxOption,
        { label: 'Okta Fastpass', value: 'signed_nonce' } as IdxOption,
      ];
      const authenticator: Input = {
        name: 'authenticator',
        value: [
          { name: 'id', value: 'abcde1234' },
          { name: 'methodType', options },
        ],
      };
      expect(getAppAuthenticatorMethodButtonElements(
        authenticator,
        stepName,
        AUTHENTICATOR_KEY.OV,
        true,
      )).toEqual([
        {
          type: 'AuthenticatorButton',
          label: 'oie.okta_verify.label',
          id: 'auth_btn_okta_verify_signed_nonce',
          options: {
            key: AUTHENTICATOR_KEY.OV,
            ctaLabel: 'oie.verify.authenticator.button.text',
            includeData: true,
            includeImmutableData: false,
            step: 'select-authenticator-authenticate',
            type: ButtonType.BUTTON,
            actionParams: {
              'authenticator.id': 'abcde1234',
              'authenticator.methodType': options[2].value,
            },
            ariaLabel: 'oie.select.authenticator.okta_verify.signed_nonce.label',
            description: options[2].label,
            dataSe: `okta_verify-${options[2].value}`,
            iconName: 'okta_verify_2',
          },
        },
        {
          type: 'AuthenticatorButton',
          label: 'oie.okta_verify.label',
          id: 'auth_btn_okta_verify_totp',
          options: {
            key: AUTHENTICATOR_KEY.OV,
            ctaLabel: 'oie.verify.authenticator.button.text',
            includeData: true,
            includeImmutableData: false,
            step: 'select-authenticator-authenticate',
            type: ButtonType.BUTTON,
            actionParams: {
              'authenticator.id': 'abcde1234',
              'authenticator.methodType': options[0].value,
            },
            ariaLabel: 'oie.select.authenticator.okta_verify.totp.label',
            description: options[0].label,
            dataSe: `okta_verify-${options[0].value}`,
            iconName: 'okta_verify_0',
          },
        },
        {
          type: 'AuthenticatorButton',
          label: 'oie.okta_verify.label',
          id: 'auth_btn_okta_verify_push',
          options: {
            key: AUTHENTICATOR_KEY.OV,
            ctaLabel: 'oie.verify.authenticator.button.text',
            includeData: true,
            includeImmutableData: false,
            step: 'select-authenticator-authenticate',
            type: ButtonType.BUTTON,
            actionParams: {
              'authenticator.id': 'abcde1234',
              'authenticator.methodType': options[1].value,
            },
            ariaLabel: 'oie.select.authenticator.okta_verify.push.label',
            description: options[1].label,
            dataSe: `okta_verify-${options[1].value}`,
            iconName: 'okta_verify_1',
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
      const mockNickname = 'ph-nn';
      const mockEmail = 't***r@okta.com';
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
              displayName: 'DisplayName',
              key: AUTHENTICATOR_KEY[key],
              profile: {},
            },
          };
          if (AUTHENTICATOR_KEY[key] === AUTHENTICATOR_KEY.PHONE) {
            option.relatesTo.profile = { phoneNumber: mockPhoneNumber };
            // @ts-expect-error OKTA-661650 nickname missing from IdxAuthenticator
            option.relatesTo.nickname = mockNickname;
          } else if (AUTHENTICATOR_KEY[key] === AUTHENTICATOR_KEY.EMAIL) {
            option.relatesTo.profile = { email: mockEmail };
          }
          return option;
        });
      const authenticatorOptionValues = getAuthenticatorVerifyButtonElements(options, stepName);

      expect(authenticatorOptionValues.length).toBe(15);
      options.forEach((option) => {
        const currentOption = authenticatorOptionValues
          .find(({ options: { key: authKey } }) => authKey === option.relatesTo?.key);
        expect(currentOption?.options.key).toBe(option.relatesTo?.key);
        let expectedLabel;
        if (option.relatesTo?.key === AUTHENTICATOR_KEY.CUSTOM_APP) {
          expectedLabel = 'DisplayName';
        } else if (option.relatesTo?.key === AUTHENTICATOR_KEY.OV) {
          expectedLabel = 'oie.okta_verify.label';
        } else {
          expectedLabel = option.label;
        }
        expect(currentOption?.label).toBe(expectedLabel);
        expect(currentOption?.options.ctaLabel)
          .toBe('oie.verify.authenticator.button.text');
      });

      options.filter((option) => option.relatesTo?.key === AUTHENTICATOR_KEY.PHONE)
        .forEach((option) => {
          const currentOption = authenticatorOptionValues
            .find(({ options: { key: authKey } }) => authKey === option.relatesTo?.key);
          expect(currentOption?.options.description).toBe(mockPhoneNumber);
          expect(currentOption?.options.nickname).toBe(mockNickname);
        });

      options.filter((option) => option.relatesTo?.key === AUTHENTICATOR_KEY.EMAIL)
        .forEach((option) => {
          const currentOption = authenticatorOptionValues
            .find(({ options: { key: authKey } }) => authKey === option.relatesTo?.key);
          expect(currentOption?.options.description).toBe(mockEmail);
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
      expect(authenticatorOptionValues[0].label).toBe('oie.okta_verify.label');
      expect(authenticatorOptionValues[0].options.description).toBe('Code');
      expect(authenticatorOptionValues[0].options.ctaLabel).toBe('oie.verify.authenticator.button.text');
      expect(authenticatorOptionValues[0].options.actionParams?.['authenticator.methodType']).toBe('totp');
      expect(authenticatorOptionValues[1].options.key).toBe(AUTHENTICATOR_KEY.OV);
      expect(authenticatorOptionValues[1].label).toBe('oie.okta_verify.label');
      expect(authenticatorOptionValues[1].options.description).toBe('Push');
      expect(authenticatorOptionValues[1].options.ctaLabel).toBe('oie.verify.authenticator.button.text');
      expect(authenticatorOptionValues[1].options.actionParams?.['authenticator.methodType']).toBe('push');
    });

    it('should only create one webauthn and custom_app Authenticator buttons when duplicate options exists in IDX response', () => {
      const options: IdxOption[] = [
        { key: AUTHENTICATOR_KEY.WEBAUTHN, id: 'abc123' },
        { key: AUTHENTICATOR_KEY.WEBAUTHN, id: 'abc123' },
        { key: AUTHENTICATOR_KEY.CUSTOM_APP, id: '123abc456' },
        { key: AUTHENTICATOR_KEY.CUSTOM_APP, id: '123abc456' },
      ]
        .map((obj) => {
          const option = {
            label: obj.key,
            value: [{ name: 'methodType', value: obj.key }, { name: 'id', value: obj.id }],
            relatesTo: {
              id: '',
              type: '',
              methods: [{ type: '' }],
              displayName: '',
              key: obj.key,
              profile: {},
            },
          };
          return option;
        });
      const authenticatorOptionValues = getAuthenticatorVerifyButtonElements(options, stepName);

      expect(authenticatorOptionValues.length).toBe(2);
      expect(authenticatorOptionValues[0].options.key).toBe(AUTHENTICATOR_KEY.WEBAUTHN);
      expect(authenticatorOptionValues[1].options.key).toBe(AUTHENTICATOR_KEY.CUSTOM_APP);
    });

    it('should set fastpass at beginning of array when deviceKnown = true with multiple OV method types', () => {
      const options: IdxOption[] = [
        {
          label: 'Okta Verify',
          value: [
            {
              name: 'methodType',
              options: [
                { label: 'Code', value: 'totp' },
                { label: 'Push', value: 'push' },
                { label: 'Fastpass', value: 'signed_nonce' },
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
            // @ts-ignore OKTA-541266 - deviceKnown missing from type
            deviceKnown: true,
          },
        },
        {
          label: AUTHENTICATOR_KEY.PHONE,
          value: [{ name: 'methodType', value: AUTHENTICATOR_KEY.PHONE }],
          relatesTo: {
            id: '',
            type: '',
            methods: [{ type: '' }],
            displayName: '',
            key: AUTHENTICATOR_KEY.PHONE,
            profile: { phoneNumber: '216XXXXX43' },
          },
        },
      ];

      const authenticatorOptionValues = getAuthenticatorVerifyButtonElements(options, stepName);

      expect(authenticatorOptionValues).toMatchSnapshot();
      expect(authenticatorOptionValues.length).toBe(4);
      expect(authenticatorOptionValues[0].options.key).toBe(AUTHENTICATOR_KEY.OV);
      expect(authenticatorOptionValues[0].label).toBe('oie.okta_verify.label');
      expect(authenticatorOptionValues[0].options.description).toBe('Fastpass');
      expect(authenticatorOptionValues[0].options.ctaLabel).toBe('oie.verify.authenticator.button.text');
      expect(authenticatorOptionValues[0].options.actionParams?.['authenticator.methodType']).toBe('signed_nonce');
      expect(authenticatorOptionValues[1].options.key).toBe(AUTHENTICATOR_KEY.OV);
      expect(authenticatorOptionValues[1].label).toBe('oie.okta_verify.label');
      expect(authenticatorOptionValues[1].options.description).toBe('Code');
      expect(authenticatorOptionValues[1].options.ctaLabel).toBe('oie.verify.authenticator.button.text');
      expect(authenticatorOptionValues[1].options.actionParams?.['authenticator.methodType']).toBe('totp');
      expect(authenticatorOptionValues[2].options.key).toBe(AUTHENTICATOR_KEY.OV);
      expect(authenticatorOptionValues[2].label).toBe('oie.okta_verify.label');
      expect(authenticatorOptionValues[2].options.description).toBe('Push');
      expect(authenticatorOptionValues[2].options.ctaLabel).toBe('oie.verify.authenticator.button.text');
      expect(authenticatorOptionValues[2].options.actionParams?.['authenticator.methodType']).toBe('push');

      expect(authenticatorOptionValues[3].options.key).toBe(AUTHENTICATOR_KEY.PHONE);
      expect(authenticatorOptionValues[3].label).toBe(AUTHENTICATOR_KEY.PHONE);
      expect(authenticatorOptionValues[3].options.ctaLabel)
        .toBe('oie.verify.authenticator.button.text');
      expect(authenticatorOptionValues[3].options.description).toBe('216XXXXX43');
    });

    it('should set fastpass at end of array when deviceKnown is not set with multiple OV method types', () => {
      const options: IdxOption[] = [
        {
          label: 'Okta Verify',
          value: [
            {
              name: 'methodType',
              options: [
                { label: 'Code', value: 'totp' },
                { label: 'Push', value: 'push' },
                { label: 'Fastpass', value: 'signed_nonce' },
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
        },
        {
          label: AUTHENTICATOR_KEY.PHONE,
          value: [{ name: 'methodType', value: AUTHENTICATOR_KEY.PHONE }],
          relatesTo: {
            id: '',
            type: '',
            methods: [{ type: '' }],
            displayName: '',
            key: AUTHENTICATOR_KEY.PHONE,
            profile: { phoneNumber: '216XXXXX43' },
          },
        },
      ];

      const authenticatorOptionValues = getAuthenticatorVerifyButtonElements(options, stepName);

      expect(authenticatorOptionValues).toMatchSnapshot();
      expect(authenticatorOptionValues.length).toBe(4);
      expect(authenticatorOptionValues[0].options.key).toBe(AUTHENTICATOR_KEY.OV);
      expect(authenticatorOptionValues[0].label).toBe('oie.okta_verify.label');
      expect(authenticatorOptionValues[0].options.description).toBe('Code');
      expect(authenticatorOptionValues[0].options.ctaLabel).toBe('oie.verify.authenticator.button.text');
      expect(authenticatorOptionValues[0].options.actionParams?.['authenticator.methodType']).toBe('totp');
      expect(authenticatorOptionValues[1].options.key).toBe(AUTHENTICATOR_KEY.OV);
      expect(authenticatorOptionValues[1].label).toBe('oie.okta_verify.label');
      expect(authenticatorOptionValues[1].options.description).toBe('Push');
      expect(authenticatorOptionValues[1].options.ctaLabel).toBe('oie.verify.authenticator.button.text');
      expect(authenticatorOptionValues[1].options.actionParams?.['authenticator.methodType']).toBe('push');

      expect(authenticatorOptionValues[2].options.key).toBe(AUTHENTICATOR_KEY.PHONE);
      expect(authenticatorOptionValues[2].label).toBe(AUTHENTICATOR_KEY.PHONE);
      expect(authenticatorOptionValues[2].options.ctaLabel)
        .toBe('oie.verify.authenticator.button.text');
      expect(authenticatorOptionValues[2].options.description).toBe('216XXXXX43');
      expect(authenticatorOptionValues[3].options.key).toBe(AUTHENTICATOR_KEY.OV);
      expect(authenticatorOptionValues[3].label).toBe('oie.okta_verify.label');
      expect(authenticatorOptionValues[3].options.description).toBe('Fastpass');
      expect(authenticatorOptionValues[3].options.ctaLabel).toBe('oie.verify.authenticator.button.text');
      expect(authenticatorOptionValues[3].options.actionParams?.['authenticator.methodType']).toBe('signed_nonce');
    });

    it('should not reorder OV option when method types are not set in IDX response', () => {
      const options: IdxOption[] = [
        {
          label: 'Okta Verify',
          value: [
            { name: 'id', value: 'abc234' },
            { name: 'methodType', value: 'signed_nonce' },
          ],
          relatesTo: {
            id: '',
            type: '',
            methods: [{ type: '' }],
            displayName: '',
            key: AUTHENTICATOR_KEY.OV,
          },
        },
        {
          label: AUTHENTICATOR_KEY.PHONE,
          value: [{ name: 'methodType', value: AUTHENTICATOR_KEY.PHONE }],
          relatesTo: {
            id: '',
            type: '',
            methods: [{ type: '' }],
            displayName: '',
            key: AUTHENTICATOR_KEY.PHONE,
            profile: { phoneNumber: '216XXXXX43' },
          },
        },
      ];

      const authenticatorOptionValues = getAuthenticatorVerifyButtonElements(options, stepName);

      expect(authenticatorOptionValues).toMatchSnapshot();
      expect(authenticatorOptionValues.length).toBe(2);
      expect(authenticatorOptionValues[0].options.key).toBe(AUTHENTICATOR_KEY.OV);
      expect(authenticatorOptionValues[0].label).toBe('oie.okta_verify.label');
      expect(authenticatorOptionValues[0].options.ctaLabel).toBe('oie.verify.authenticator.button.text');
      expect(authenticatorOptionValues[0].options.actionParams?.['authenticator.methodType']).toBe('signed_nonce');
      expect(authenticatorOptionValues[1].options.key).toBe(AUTHENTICATOR_KEY.PHONE);
      expect(authenticatorOptionValues[1].label).toBe(AUTHENTICATOR_KEY.PHONE);
      expect(authenticatorOptionValues[1].options.ctaLabel)
        .toBe('oie.verify.authenticator.button.text');
      expect(authenticatorOptionValues[1].options.description).toBe('216XXXXX43');
    });

    it('should not reorder OV option when fastpass is not an option', () => {
      const options: IdxOption[] = [
        {
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
        },
        {
          label: AUTHENTICATOR_KEY.PHONE,
          value: [{ name: 'methodType', value: AUTHENTICATOR_KEY.PHONE }],
          relatesTo: {
            id: '',
            type: '',
            methods: [{ type: '' }],
            displayName: '',
            key: AUTHENTICATOR_KEY.PHONE,
            profile: { phoneNumber: '216XXXXX43' },
          },
        },
      ];

      const authenticatorOptionValues = getAuthenticatorVerifyButtonElements(options, stepName);

      expect(authenticatorOptionValues).toMatchSnapshot();
      expect(authenticatorOptionValues.length).toBe(3);
      expect(authenticatorOptionValues[0].options.key).toBe(AUTHENTICATOR_KEY.OV);
      expect(authenticatorOptionValues[0].label).toBe('oie.okta_verify.label');
      expect(authenticatorOptionValues[0].options.description).toBe('Code');
      expect(authenticatorOptionValues[0].options.ctaLabel).toBe('oie.verify.authenticator.button.text');
      expect(authenticatorOptionValues[0].options.actionParams?.['authenticator.methodType']).toBe('totp');
      expect(authenticatorOptionValues[1].options.key).toBe(AUTHENTICATOR_KEY.OV);
      expect(authenticatorOptionValues[1].label).toBe('oie.okta_verify.label');
      expect(authenticatorOptionValues[1].options.description).toBe('Push');
      expect(authenticatorOptionValues[1].options.ctaLabel).toBe('oie.verify.authenticator.button.text');
      expect(authenticatorOptionValues[1].options.actionParams?.['authenticator.methodType']).toBe('push');

      expect(authenticatorOptionValues[2].options.key).toBe(AUTHENTICATOR_KEY.PHONE);
      expect(authenticatorOptionValues[2].label).toBe(AUTHENTICATOR_KEY.PHONE);
      expect(authenticatorOptionValues[2].options.ctaLabel)
        .toBe('oie.verify.authenticator.button.text');
      expect(authenticatorOptionValues[2].options.description).toBe('216XXXXX43');
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
              displayName: 'DisplayName',
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

      expect(authenticatorOptionValues.length).toBe(15);
      options.forEach((option) => {
        const currentOption = authenticatorOptionValues
          .find(({ options: { key: authKey } }) => authKey === option.relatesTo?.key);
        expect(currentOption?.options.key).toBe(option.relatesTo?.key);
        let expectedLabel;
        if (option.relatesTo?.key === AUTHENTICATOR_KEY.CUSTOM_APP) {
          expectedLabel = 'DisplayName';
        } else if (option.relatesTo?.key === AUTHENTICATOR_KEY.OV) {
          expectedLabel = 'oie.okta_verify.label';
        } else {
          expectedLabel = option.label;
        }
        expect(currentOption?.label).toBe(expectedLabel);
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
      expect(authenticatorOptionValues[0].label).toBe('oie.okta_verify.label');
      expect(authenticatorOptionValues[0].options.description).toBe('oie.okta_verify.authenticator.description');
      expect(authenticatorOptionValues[0].options.ctaLabel).toBe('oie.enroll.authenticator.button.text');
      expect(authenticatorOptionValues[0].options.actionParams!['authenticator.methodType']).toBe('totp');
      expect(authenticatorOptionValues[1].label).toBe('oie.okta_verify.label');
      expect(authenticatorOptionValues[1].options.description).toBe('oie.okta_verify.authenticator.description');
      expect(authenticatorOptionValues[1].options.ctaLabel).toBe('oie.enroll.authenticator.button.text');
      expect(authenticatorOptionValues[1].options.actionParams!['authenticator.methodType']).toBe('push');
    });

    it('should detect authenticator options for additional enroll', () => {
      const authenticatorEnrollments: IdxAuthenticator[] = [
        {
          id: 'enrolled-email-1',
          type: 'email',
          key: AUTHENTICATOR_KEY.EMAIL,
          methods: [{ type: 'email' }],
          displayName: 'Enrolled email',
        },
      ];
      const options: IdxOption[] = [
        {
          label: 'Password',
          value: [
            { name: 'methodType', value: 'password' },
            { name: 'id', value: '1234abc' },
          ],
          relatesTo: {
            id: '',
            type: 'password',
            methods: [{ type: 'password' }],
            displayName: 'Okta Password',
            key: AUTHENTICATOR_KEY.PASSWORD,
          },
        },
        {
          label: 'Email',
          value: [
            { name: 'methodType', value: 'email' },
            { name: 'id', value: '1235abc' },
          ],
          relatesTo: {
            id: '',
            type: 'email',
            methods: [{ type: 'email' }],
            displayName: 'Okta Email',
            key: AUTHENTICATOR_KEY.EMAIL,
          },
        },
      ];

      const authenticatorOptionValues = getAuthenticatorEnrollButtonElements(
        options, stepName, authenticatorEnrollments,
      );

      expect(authenticatorOptionValues).toMatchSnapshot();
      expect(authenticatorOptionValues.length).toBe(2);
      expect(authenticatorOptionValues[0].options.key).toBe(AUTHENTICATOR_KEY.PASSWORD);
      expect(authenticatorOptionValues[0].label).toBe('Password');
      expect(authenticatorOptionValues[0].options.ctaLabel).toBe('oie.enroll.authenticator.button.text');
      expect(authenticatorOptionValues[1].options.key).toBe(AUTHENTICATOR_KEY.EMAIL);
      expect(authenticatorOptionValues[1].label).toBe('Email');
      expect(authenticatorOptionValues[1].options.ctaLabel).toBe('enroll.choices.setup.another');
    });
  });
});
