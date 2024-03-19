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

import { APIError, IdxTransaction, Input } from '@okta/okta-auth-js';
import { AUTHENTICATOR_KEY, TERMINAL_KEY } from 'src/constants';
import { getStubTransaction } from 'src/mocks/utils/utils';

import { RegistrationElementSchema, WidgetProps } from '../types';
import {
  buildAuthCoinProps,
  convertIdxInputsToRegistrationSchema,
  convertRegistrationSchemaToIdxInputs,
  getUserInfo,
  triggerEmailVerifyCallback,
  triggerRegistrationErrorMessages,
} from '.';

const mockIsAndroidOVEnrollment = jest.fn();
jest.mock('../../../util/Util', () => ({
  isAndroidOVEnrollment: jest.fn().mockImplementation(() => mockIsAndroidOVEnrollment()),
}));

describe('IdxUtils Tests', () => {
  const TEST_USERNAME = 'tester@test.com';
  const TEST_FIRSTNAME = 'Tester';
  const TEST_LASTNAME = 'McTesterson';
  let transaction: IdxTransaction;

  beforeEach(() => {
    transaction = getStubTransaction();
    transaction.context.user = {
      type: 'object',
      value: {
        id: '12345',
        identifier: TEST_USERNAME,
        profile: {
          firstName: TEST_FIRSTNAME,
          lastName: TEST_LASTNAME,
          locale: 'en_US',
        },
      },
    };
  });

  it('should return empty object when user object is not defined', () => {
    transaction = {
      ...transaction,
      context: {
        ...transaction.context,
        user: undefined,
      },
    };
    const user = getUserInfo(transaction);

    expect(user).toEqual({});
  });

  it('should create UserInfo object from Idx transaction response', () => {
    const user = getUserInfo(transaction);

    expect(user.identifier).toBe(TEST_USERNAME);
    expect(user.profile?.firstName).toBe(TEST_FIRSTNAME);
    expect(user.profile?.lastName).toBe(TEST_LASTNAME);
  });

  it('should not build AuthCoin data when Idx transaction is undefined', () => {
    expect(buildAuthCoinProps()).toBeUndefined();
  });

  it('should not build AuthCoin data when nextStep & messages props '
    + 'are missing from Idx transaction', () => {
    expect(buildAuthCoinProps(transaction)).toBeUndefined();
  });

  it('should not build AuthCoin data when Idx transaction does not '
    + 'have an email related terminal key', () => {
    transaction = {
      ...transaction,
      messages: [
        {
          message: 'Some unknown message.',
          i18n: {
            key: 'some.unknown.key',
          },
          class: 'INFO',
        },
      ],
    };
    expect(buildAuthCoinProps(transaction)).toBeUndefined();
  });

  it('should not build AuthCoin data when Idx transaction is not terminal '
    + 'and does not have an authenticator defined', () => {
    transaction = {
      ...transaction,
      nextStep: {
        name: '',
      },
    };
    expect(buildAuthCoinProps(transaction)).toBeUndefined();
  });

  it('should build AuthCoin data when Idx transaction denotes Google OTP authenticator', () => {
    transaction = {
      ...transaction,
      nextStep: {
        name: '',
        relatesTo: {
          value: {
            displayName: '',
            id: '',
            key: AUTHENTICATOR_KEY.GOOGLE_OTP,
            methods: [],
            type: '',
          },
        },
      },
    };
    expect(buildAuthCoinProps(transaction)?.authenticatorKey).toBe(AUTHENTICATOR_KEY.GOOGLE_OTP);
  });

  it('should build AuthCoin data when Idx transaction denotes expired email link', () => {
    transaction = {
      ...transaction,
      messages: [
        {
          message: 'Email link expired.',
          i18n: {
            key: TERMINAL_KEY.RETURN_LINK_EXPIRED_KEY,
          },
          class: 'INFO',
        },
      ],
    };
    expect(buildAuthCoinProps(transaction)?.authenticatorKey).toBe(AUTHENTICATOR_KEY.EMAIL);
  });

  it('should build AuthCoin data when isAndroidOVEnrollment is true and is success redirect transaction', () => {
    transaction = {
      ...transaction,
      context: {
        ...transaction.context,
        success: {
          name: 'success-redirect',
          href: 'http://localhost:3000/success_redirect',
        },
      },
    };
    mockIsAndroidOVEnrollment.mockReturnValue(true);
    expect(buildAuthCoinProps(transaction)?.authenticatorKey).toBe(AUTHENTICATOR_KEY.OV);
  });

  it('should not perform conversion of Idx Inputs into Registration schema elements when input array is empty', () => {
    expect(convertIdxInputsToRegistrationSchema([])).toEqual([]);
  });

  it('should convert array of Idx Input objects into an array of Registration schema objects', () => {
    const inputs: Input[] = [
      {
        name: 'userProfile',
        value: [
          { name: 'firstName', label: 'First name', required: true },
          { name: 'lastName', label: 'Last name', required: true },
          { name: 'email', label: 'Email', required: true },
        ],
      },
      {
        name: 'credentials',
        value: [{
          name: 'passcode',
          label: 'Password',
          required: false,
          secret: true,
        }],
      },
    ];
    const schemaElements: RegistrationElementSchema[] = convertIdxInputsToRegistrationSchema(
      inputs,
    );

    expect(schemaElements.length).toBe(4);
    expect(schemaElements).toMatchSnapshot();
    expect(schemaElements[0].name).toBe('userProfile.firstName');
    expect(schemaElements[1].name).toBe('userProfile.lastName');
    expect(schemaElements[2].name).toBe('userProfile.email');
    expect(schemaElements[3].name).toBe('credentials.passcode');
  });

  it('should update Idx Inputs array with modified registration schema elements when adding new field and updating existing', () => {
    const inputs: Input[] = [
      {
        name: 'userProfile',
        value: [
          { name: 'firstName', label: 'First name', required: true },
          { name: 'lastName', label: 'Last name', required: true },
          { name: 'email', label: 'Email', required: true },
        ],
      },
      {
        name: 'credentials',
        value: [{
          name: 'passcode',
          label: 'Password',
          required: false,
          secret: true,
        }],
      },
    ];
    const schema: RegistrationElementSchema[] = [
      {
        name: 'userProfile.firstName',
        label: 'Given name',
        required: false,
        'label-top': true,
        'data-se': 'userProfile.firstName',
        wide: true,
      },
      {
        name: 'userProfile.lastName',
        label: 'Family name',
        required: false,
        'label-top': true,
        'data-se': 'userProfile.lastName',
        wide: true,
      },
      {
        name: 'userProfile.email',
        label: 'Company login',
        required: false,
        'label-top': true,
        'data-se': 'userProfile.email',
        wide: true,
      },
      {
        name: 'userProfile.favoriteCar',
        label: 'Favorite car',
        required: true,
        'label-top': true,
        'data-se': 'userProfile.favoriteCar',
        wide: true,
      },
      {
        name: 'credentials.passcode',
        label: 'Password',
        required: true,
        'label-top': true,
        'data-se': 'credentials.passcode',
        wide: true,
      },
    ];

    convertRegistrationSchemaToIdxInputs(schema, inputs);

    expect(inputs.length).toBe(2);
    expect((inputs[0].value as Input[]).length).toBe(4);
    expect((inputs[1].value as Input[]).length).toBe(1);
    expect(inputs).toMatchSnapshot();
    expect((inputs[0].value as Input[])[0].name).toBe('firstName');
    expect((inputs[0].value as Input[])[1].name).toBe('lastName');
    expect((inputs[0].value as Input[])[2].name).toBe('email');
    expect((inputs[0].value as Input[])[3].name).toBe('favoriteCar');
  });

  it('should trigger default global registration error message when triggering error without errorSummary', () => {
    const mockSetMessageFn = jest.fn();
    const inputs: Input[] = [
      {
        name: 'userProfile',
        value: [
          { name: 'firstName', label: 'First name', required: true },
          { name: 'lastName', label: 'Last name', required: true },
          { name: 'email', label: 'Email', required: true },
        ],
      },
      {
        name: 'credentials',
        value: [{
          name: 'passcode',
          label: 'Password',
          required: false,
          secret: true,
        }],
      },
    ];
    triggerRegistrationErrorMessages({ errorCode: 'E0047' } as APIError, inputs, mockSetMessageFn);

    expect(mockSetMessageFn).toHaveBeenCalledWith({
      class: 'ERROR',
      i18n: { key: '' },
      message: 'oform.errorbanner.title',
    });
  });

  it('should trigger custom global registration error message when triggering error with errorSummary', () => {
    const mockSetMessageFn = jest.fn();
    const inputs: Input[] = [
      {
        name: 'userProfile',
        value: [
          { name: 'firstName', label: 'First name', required: true },
          { name: 'lastName', label: 'Last name', required: true },
          { name: 'email', label: 'Email', required: true },
        ],
      },
      {
        name: 'credentials',
        value: [{
          name: 'passcode',
          label: 'Password',
          required: false,
          secret: true,
        }],
      },
    ];
    triggerRegistrationErrorMessages({ errorSummary: 'This is a custom global error message' }, inputs, mockSetMessageFn);

    expect(mockSetMessageFn).toHaveBeenCalledWith({
      class: 'ERROR',
      i18n: { key: '' },
      message: 'This is a custom global error message',
    });
  });

  it('should trigger field level registration error messages when triggering error with errorCauses', () => {
    const mockSetMessageFn = jest.fn();
    const inputs: Input[] = [
      {
        name: 'userProfile',
        value: [
          { name: 'firstName', label: 'First name', required: true },
          { name: 'lastName', label: 'Last name', required: true },
          { name: 'email', label: 'Email', required: true },
        ],
      },
      {
        name: 'credentials',
        value: [{
          name: 'passcode',
          label: 'Password',
          required: false,
          secret: true,
        }],
      },
    ];
    triggerRegistrationErrorMessages(
      // @ts-expect-error property is expected in SIW but not defined in auth-js type
      { errorCauses: [{ property: 'userProfile.lastName', errorSummary: 'Custom field level error' }] },
      inputs,
      mockSetMessageFn,
    );

    // @ts-expect-error OKTA-539834 - messages missing from type
    expect((inputs[0].value as Input[])[1].messages?.value).toEqual([{
      class: 'ERROR', message: 'Custom field level error',
    }]);
    expect(mockSetMessageFn).toHaveBeenCalledWith({
      class: 'ERROR',
      i18n: { key: '' },
      message: 'oform.errorbanner.title',
    });
  });

  describe('triggerEmailVerifyCallback Tests', () => {
    let widgetProps: WidgetProps;
    let mockAuthClient: any;
    const otp = 'fake-otp';

    beforeEach(() => {
      mockAuthClient = {
        idx: {
          proceed: jest.fn(),
          getSavedTransactionMeta: jest.fn(),
        },
      };
      widgetProps = {
        authClient: mockAuthClient,
        otp,
      } as unknown as WidgetProps;
    });

    describe('if there is an interactionHandle in storage', () => {
      beforeEach(() => {
        const interactionHandle = 'fake-interactionHandle';
        jest.spyOn(mockAuthClient.idx, 'getSavedTransactionMeta').mockResolvedValue({ interactionHandle });
      });

      it('should pass the otp from settings to idx.proceed()', async () => {
        jest.spyOn(mockAuthClient.idx, 'proceed');
        await triggerEmailVerifyCallback(widgetProps);
        expect(mockAuthClient.idx.proceed).toHaveBeenCalledWith({
          exchangeCodeForTokens: false,
          otp,
        });
      });
      it('should return an idx response from idx.proceed', async () => {
        const idxResponse = { fake: true };
        jest.spyOn(mockAuthClient.idx, 'proceed').mockResolvedValue(idxResponse);
        const res = await triggerEmailVerifyCallback(widgetProps);
        expect(mockAuthClient.idx.proceed).toHaveBeenCalledWith({
          exchangeCodeForTokens: false,
          otp,
        });
        expect(res).toBe(idxResponse);
      });
    });

    it('should return an idx response with a terminal message if there is no interactionHandle in storage', async () => {
      jest.spyOn(mockAuthClient.idx, 'getSavedTransactionMeta').mockResolvedValue({});
      jest.spyOn(mockAuthClient.idx, 'proceed');
      const { messages } = await triggerEmailVerifyCallback(widgetProps);
      expect(mockAuthClient.idx.proceed).not.toHaveBeenCalled();
      expect(messages).toBeInstanceOf(Array);
      expect(messages).toHaveLength(1);
      expect(messages![0].i18n.key).toEqual('idx.enter.otp.in.original.tab');
    });

    it('should return an idx response with a terminal message if storage is null', async () => {
      jest.spyOn(mockAuthClient.idx, 'getSavedTransactionMeta').mockResolvedValue(null);
      jest.spyOn(mockAuthClient.idx, 'proceed');
      const { messages } = await triggerEmailVerifyCallback(widgetProps);
      expect(mockAuthClient.idx.proceed).not.toHaveBeenCalled();
      expect(messages).toBeInstanceOf(Array);
      expect(messages).toHaveLength(1);
      expect(messages![0].i18n.key).toEqual('idx.enter.otp.in.original.tab');
    });
  });
});
