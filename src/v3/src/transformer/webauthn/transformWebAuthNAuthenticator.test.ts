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

import { ActivationData, ChallengeData, IdxAuthenticator } from '@okta/okta-auth-js';
import { IDX_STEP } from 'src/constants';
import { getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  FormBag,
  UISchemaLayoutType,
  WidgetProps,
} from 'src/types';

import { transformWebAuthNAuthenticator } from '.';

let mockIsEdgeBrowser = false;
let mockIsSafariBrowser = false;
jest.mock('../../../../util/BrowserFeatures', () => ({
  isEdge: () => jest.fn().mockReturnValue(mockIsEdgeBrowser),
  isSafari: () => jest.fn().mockReturnValue(mockIsSafariBrowser),
}));

describe('WebAuthN Transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const widgetProps: WidgetProps = {};
  let formBag: FormBag;
  let mockCredentialsContainer: CredentialsContainer;

  beforeEach(() => {
    mockIsEdgeBrowser = false;
    mockIsSafariBrowser = false;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('WebAuthN Enroll Tests', () => {
    beforeEach(() => {
      formBag = {
        dataSchema: {} as any,
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
      const updatedFormBag = transformWebAuthNAuthenticator({ transaction, formBag, widgetProps });

      // Verify added elements
      expect(updatedFormBag.uischema.elements.length).toBe(2);
      expect(updatedFormBag).toMatchSnapshot();
    });

    it('should render title, description and button elements when WebAuthN API is available', () => {
      mockCredentialsContainer = {
        create: jest.fn().mockResolvedValue({}),
        get: jest.fn().mockResolvedValue({}),
        preventSilentAccess: jest.fn(),
        store: jest.fn(),
      };
      const navigatorCredentials = jest.spyOn(global, 'navigator', 'get');
      navigatorCredentials.mockReturnValue(
        { credentials: mockCredentialsContainer } as unknown as Navigator,
      );

      const updatedFormBag = transformWebAuthNAuthenticator({ transaction, formBag, widgetProps });

      // Verify added elements
      expect(updatedFormBag.uischema.elements.length).toBe(4);
      expect(updatedFormBag).toMatchSnapshot();
    });

    it('should render title, description, button, and callout elements when WebAuthN API is available on MS Edge browser', () => {
      transaction.nextStep!.relatesTo = {
        value: {
          contextualData: {
            activationData: {
              authenticatorSelection: { userVerification: 'required' },
            } as unknown as ActivationData,
          },
        } as unknown as IdxAuthenticator,
      };
      mockIsEdgeBrowser = true;
      mockCredentialsContainer = {
        create: jest.fn().mockResolvedValue({}),
        get: jest.fn().mockResolvedValue({}),
        preventSilentAccess: jest.fn(),
        store: jest.fn(),
      };
      const navigatorCredentials = jest.spyOn(global, 'navigator', 'get');
      navigatorCredentials.mockReturnValue(
        { credentials: mockCredentialsContainer } as unknown as Navigator,
      );

      const updatedFormBag = transformWebAuthNAuthenticator({ transaction, formBag, widgetProps });

      // Verify added elements
      expect(updatedFormBag.uischema.elements.length).toBe(5);
      expect(updatedFormBag).toMatchSnapshot();
    });
  });

  describe('WebAuthN Challenge Tests', () => {
    beforeEach(() => {
      formBag = {
        dataSchema: {} as any,
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
      const updatedFormBag = transformWebAuthNAuthenticator({ transaction, formBag, widgetProps });

      // Verify added elements
      expect(updatedFormBag.uischema.elements.length).toBe(3);
      expect(updatedFormBag).toMatchSnapshot();
    });

    it('should render title, description and button elements when WebAuthN API is available', () => {
      mockCredentialsContainer = {
        create: jest.fn().mockResolvedValue({}),
        get: jest.fn().mockResolvedValue({}),
        preventSilentAccess: jest.fn(),
        store: jest.fn(),
      };
      const navigatorCredentials = jest.spyOn(global, 'navigator', 'get');
      navigatorCredentials.mockReturnValue(
        { credentials: mockCredentialsContainer } as unknown as Navigator,
      );
      const updatedFormBag = transformWebAuthNAuthenticator({ transaction, formBag, widgetProps });

      // Verify added elements
      expect(updatedFormBag.uischema.elements.length).toBe(4);
      expect(updatedFormBag).toMatchSnapshot();
    });

    it('should render title, description, button, and callout elements when WebAuthN API is available in Safari Browser', () => {
      transaction.nextStep!.relatesTo = {
        value: {
          contextualData: {
            challengeData: {
              userVerification: 'required',
            } as unknown as ChallengeData,
          },
        } as unknown as IdxAuthenticator,
      };
      mockIsSafariBrowser = true;
      mockCredentialsContainer = {
        create: jest.fn().mockResolvedValue({}),
        get: jest.fn().mockResolvedValue({}),
        preventSilentAccess: jest.fn(),
        store: jest.fn(),
      };
      const navigatorCredentials = jest.spyOn(global, 'navigator', 'get');
      navigatorCredentials.mockReturnValue(
        { credentials: mockCredentialsContainer } as unknown as Navigator,
      );

      const updatedFormBag = transformWebAuthNAuthenticator({ transaction, formBag, widgetProps });

      // Verify added elements
      expect(updatedFormBag.uischema.elements.length).toBe(5);
      expect(updatedFormBag).toMatchSnapshot();
    });
  });
});
