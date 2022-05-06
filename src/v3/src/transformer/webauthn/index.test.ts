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

import { IDX_STEP } from 'src/constants';
import { getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import { FormBag } from 'src/types';

import { transformWebAuthNAuthenticator } from '.';

describe('WebAuthN Transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  let formBag: FormBag;
  let mockCredentialsContainer: CredentialsContainer;

  afterEach(() => {
    Object.defineProperty(global.navigator, 'credentials', {
      value: {},
      configurable: true,
    });
  });

  describe('WebAuthN Enroll Tests', () => {
    beforeEach(() => {
      formBag = {
        envelope: {},
        data: {},
        schema: {},
        uischema: {
          type: 'VerticalLayout',
          elements: [],
        },
      };
      transaction.nextStep = {
        name: IDX_STEP.ENROLL_AUTHENTICATOR,
      };
    });

    it('should only render title and description elements when WebAuthN API is not available', () => {
      const updatedFormBag = transformWebAuthNAuthenticator(transaction, formBag);

      // Verify added elements
      expect(updatedFormBag.uischema.elements.length).toBe(2);
      expect(updatedFormBag.uischema.elements[0]?.type).toBe('Title');
      expect(updatedFormBag.uischema.elements[1]?.type).toBe('Description');
    });

    it('should render title, description and button elements when WebAuthN API is available', () => {
      mockCredentialsContainer = {
        create: jest.fn().mockImplementationOnce(
          () => Promise.resolve({}),
        ),
        get: jest.fn().mockImplementationOnce(
          () => Promise.resolve({}),
        ),
        preventSilentAccess: jest.fn(),
        store: jest.fn(),
      };
      Object.defineProperty(global.navigator, 'credentials', {
        value: mockCredentialsContainer,
        configurable: true,
      });

      const updatedFormBag = transformWebAuthNAuthenticator(transaction, formBag);

      // Verify added elements
      expect(updatedFormBag.uischema.elements.length).toBe(3);
      expect(updatedFormBag.uischema.elements[0]?.type).toBe('Title');
      expect(updatedFormBag.uischema.elements[1]?.type).toBe('Description');
      expect(updatedFormBag.uischema.elements[2]?.type).toBe('Button');
      expect(updatedFormBag.uischema.elements[2]?.options?.nextStep).toBe(transaction.nextStep);
    });
  });

  describe('WebAuthN Challenge Tests', () => {
    beforeEach(() => {
      formBag = {
        envelope: {},
        data: {},
        schema: {},
        uischema: {
          type: 'VerticalLayout',
          elements: [],
        },
      };
      transaction.nextStep = {
        name: IDX_STEP.CHALLENGE_AUTHENTICATOR,
      };
    });
    it('should only render title and description elements when WebAuthN API is not available', () => {
      const updatedFormBag = transformWebAuthNAuthenticator(transaction, formBag);

      // Verify added elements
      expect(updatedFormBag.uischema.elements.length).toBe(2);
      expect(updatedFormBag.uischema.elements[0]?.type).toBe('Title');
      expect(updatedFormBag.uischema.elements[1]?.type).toBe('Description');
    });

    it('should render title, description and button elements when WebAuthN API is available', () => {
      mockCredentialsContainer = {
        create: jest.fn().mockImplementationOnce(
          () => Promise.resolve({}),
        ),
        get: jest.fn().mockImplementationOnce(
          () => Promise.resolve({}),
        ),
        preventSilentAccess: jest.fn(),
        store: jest.fn(),
      };
      Object.defineProperty(global.navigator, 'credentials', {
        value: mockCredentialsContainer,
        configurable: true,
      });
      const updatedFormBag = transformWebAuthNAuthenticator(transaction, formBag);

      // Verify added elements
      expect(updatedFormBag.uischema.elements.length).toBe(3);
      expect(updatedFormBag.uischema.elements[0]?.type).toBe('Title');
      expect(updatedFormBag.uischema.elements[1]?.type).toBe('Description');
      expect(updatedFormBag.uischema.elements[2]?.type).toBe('Button');
      expect(updatedFormBag.uischema.elements[2]?.options?.nextStep).toBe(transaction.nextStep);
    });
  });
});
