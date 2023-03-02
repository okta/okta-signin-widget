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

import { IdxStatus, IdxTransaction } from '@okta/okta-auth-js';
import { AUTHENTICATOR_KEY, TERMINAL_KEY } from 'src/constants';

import { buildAuthCoinProps, getUserInfo } from './index';

describe('IdxUtils Tests', () => {
  const TEST_USERNAME = 'tester@test.com';
  const TEST_FIRSTNAME = 'Tester';
  const TEST_LASTNAME = 'McTesterson';
  let transaction: IdxTransaction;

  beforeEach(() => {
    transaction = {
      status: IdxStatus.PENDING,
      proceed: jest.fn(),
      neededToProceed: [],
      rawIdxState: {
        version: '',
        stateHandle: '',
      },
      actions: {},
      context: {
        version: '',
        stateHandle: '',
        expiresAt: '',
        intent: '',
        currentAuthenticator: {
          type: '',
          value: {
            displayName: '',
            id: '',
            key: '',
            methods: [],
            type: '',
          },
        },
        authenticators: {
          type: '',
          value: [],
        },
        authenticatorEnrollments: {
          type: 'string',
          value: [],
        },
        enrollmentAuthenticator: {
          type: '',
          value: {
            displayName: '',
            id: '',
            key: '',
            methods: [],
            type: '',
          },
        },
        user: {
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
        },
        app: {
          type: '',
          value: {},
        },
      },
    };
  });

  it('should return empty object when user object is not defined', () => {
    transaction = {
      ...transaction,
      context: {
        ...transaction.context,
        // @ts-ignore AuthJS-Missing-Optional
        user: null,
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
});
