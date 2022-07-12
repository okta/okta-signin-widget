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
import {
  DescriptionElement,
  FormBag,
  TitleElement,
  UISchemaLayoutType,
  WebAuthNButtonElement,
  WidgetProps,
} from 'src/types';

import { transformWebAuthNAuthenticator } from '.';

describe('WebAuthN Transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const mockProps: WidgetProps = {};
  let formBag: FormBag;
  let mockCredentialsContainer: CredentialsContainer;

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('WebAuthN Enroll Tests', () => {
    beforeEach(() => {
      formBag = {
        schema: {},
        uischema: {
          type: UISchemaLayoutType.VERTICAL,
          elements: [],
        },
        data: {},
      };
      transaction.nextStep = {
        name: IDX_STEP.ENROLL_AUTHENTICATOR,
        action: jest.fn(),
      };
    });

    it('should only render title and description elements when WebAuthN API is not available', () => {
      const navigatorCredentials = jest.spyOn(global, 'navigator', 'get');
      navigatorCredentials.mockReturnValue(
        { credentials: {} } as unknown as Navigator,
      );
      const updatedFormBag = transformWebAuthNAuthenticator(transaction, formBag, mockProps);

      // Verify added elements
      expect(updatedFormBag.uischema.elements.length).toBe(2);
      expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('oie.enroll.webauthn.title');
      expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
      expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
        .toBe('webauthn.biometric.error.factorNotSupported');
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
      const navigatorCredentials = jest.spyOn(global, 'navigator', 'get');
      navigatorCredentials.mockReturnValue(
        { credentials: mockCredentialsContainer } as unknown as Navigator,
      );

      const updatedFormBag = transformWebAuthNAuthenticator(transaction, formBag, mockProps);

      // Verify added elements
      expect(updatedFormBag.uischema.elements.length).toBe(3);
      expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('oie.enroll.webauthn.title');
      expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
      expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
        .toBe('oie.enroll.webauthn.instructions');
      expect(updatedFormBag.uischema.elements[2]?.type).toBe('WebAuthNSubmitButton');
      expect((updatedFormBag.uischema.elements[2] as WebAuthNButtonElement).options?.onClick)
        .not.toBeUndefined();
      expect((updatedFormBag.uischema.elements[2] as WebAuthNButtonElement).options?.label)
        .toBe('oie.enroll.webauthn.save');
      expect((updatedFormBag.uischema.elements[2] as WebAuthNButtonElement).options?.submitOnLoad)
        .toBe(true);
      expect((updatedFormBag.uischema.elements[2] as WebAuthNButtonElement)
        .options?.showLoadingIndicator).toBe(true);
    });
  });

  describe('WebAuthN Challenge Tests', () => {
    beforeEach(() => {
      formBag = {
        schema: {},
        uischema: {
          type: UISchemaLayoutType.VERTICAL,
          elements: [],
        },
        data: {},
      };
      transaction.nextStep = {
        name: IDX_STEP.CHALLENGE_AUTHENTICATOR,
        action: jest.fn(),
      };
    });
    it('should only render title and description elements when WebAuthN API is not available', () => {
      const navigatorCredentials = jest.spyOn(global, 'navigator', 'get');
      navigatorCredentials.mockReturnValue(
        { credentials: {} } as unknown as Navigator,
      );
      const updatedFormBag = transformWebAuthNAuthenticator(transaction, formBag, mockProps);

      // Verify added elements
      expect(updatedFormBag.uischema.elements.length).toBe(2);
      expect((updatedFormBag.uischema.elements[0] as TitleElement).type).toBe('Title');
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('oie.enroll.webauthn.title');
      expect((updatedFormBag.uischema.elements[1] as DescriptionElement).type).toBe('Description');
      expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
        .toBe('webauthn.biometric.error.factorNotSupported');
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
      const navigatorCredentials = jest.spyOn(global, 'navigator', 'get');
      navigatorCredentials.mockReturnValue(
        { credentials: mockCredentialsContainer } as unknown as Navigator,
      );
      const updatedFormBag = transformWebAuthNAuthenticator(transaction, formBag, mockProps);

      // Verify added elements
      expect(updatedFormBag.uischema.elements.length).toBe(3);
      expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('oie.enroll.webauthn.title');
      expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
      expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
        .toBe('oie.verify.webauthn.instructions');
      expect((updatedFormBag.uischema.elements[2] as WebAuthNButtonElement).type).toBe('WebAuthNSubmitButton');
      expect((updatedFormBag.uischema.elements[2] as WebAuthNButtonElement).options?.onClick)
        .not.toBeUndefined();
      expect((updatedFormBag.uischema.elements[2] as WebAuthNButtonElement).options?.label)
        .toBe('mfa.challenge.verify');
      expect((updatedFormBag.uischema.elements[2] as WebAuthNButtonElement).options?.submitOnLoad)
        .toBe(true);
      expect((updatedFormBag.uischema.elements[2] as WebAuthNButtonElement)
        .options?.showLoadingIndicator).toBe(true);
    });
  });
});
