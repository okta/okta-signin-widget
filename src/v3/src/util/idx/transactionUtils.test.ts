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

import { IdxTransaction } from '@okta/okta-auth-js';

import { getStubTransaction } from '../../mocks/utils/utils';
import { getUserInfo } from '.';

describe('idx/transactionUtils', () => {
  describe('getUserInfo', () => {
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
  });
});
