/*
 * Copyright (c) 2025-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { IdxTransaction } from '@okta/okta-auth-js';

import { AUTHENTICATOR_KEY, TERMINAL_KEY } from '../constants';
import { getStubTransaction } from '../mocks/utils/utils';
import { buildAuthCoinProps } from './buildAuthCoinProps';

describe('buildAuthCoinProps', () => {
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

  it('should build AuthCoin data when Idx transaction denotes IDV Persona', () => {
    transaction = {
      ...transaction,
      nextStep: {
        name: 'redirect-idverify',
        type: 'ID_PROOFING',
        href:
          'http://localhost:3000/idp/identity-verification?stateTokenExternalId=bzJOSnhodWVNZjZuVEsrUj',
        method: 'GET',
        idp: {
          id: 'IDV_PERSONA',
          name: 'Persona',
        },
      },
    };
    expect(buildAuthCoinProps(transaction)?.authenticatorKey).toBe('IDV_PERSONA');
  });

  it('should build AuthCoin data when Idx transaction denotes IDV Clear', () => {
    transaction = {
      ...transaction,
      nextStep: {
        name: 'redirect-idverify',
        type: 'ID_PROOFING',
        href:
          'http://localhost:3000/idp/identity-verification?stateTokenExternalId=bzJOSnhodWVNZjZuVEsrUj',
        method: 'GET',
        idp: {
          id: 'IDV_CLEAR',
          name: 'Clear',
        },
      },
    };
    expect(buildAuthCoinProps(transaction)?.authenticatorKey).toBe('IDV_CLEAR');
  });

  it('should build AuthCoin data when Idx transaction denotes IDV Incode', () => {
    transaction = {
      ...transaction,
      nextStep: {
        name: 'redirect-idverify',
        type: 'ID_PROOFING',
        href:
          'http://localhost:3000/idp/identity-verification?stateTokenExternalId=bzJOSnhodWVNZjZuVEsrUj',
        method: 'GET',
        idp: {
          id: 'IDV_INCODE',
          name: 'Incode',
        },
      },
    };
    expect(buildAuthCoinProps(transaction)?.authenticatorKey).toBe('IDV_INCODE');
  });

  it('should build AuthCoin data as undefined when Idx transaction does not have idp id', () => {
    transaction = {
      ...transaction,
      nextStep: {
        name: 'redirect-idverify',
        type: 'ID_PROOFING',
        href:
          'http://localhost:3000/idp/identity-verification?stateTokenExternalId=bzJOSnhodWVNZjZuVEsrUj',
        method: 'GET',
        idp: {
          name: 'Persona',
        },
      },
    };
    expect(buildAuthCoinProps(transaction)?.authenticatorKey).toBe(undefined);
  });
});
