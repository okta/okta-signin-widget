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
  ActivationData,
  ChallengeData,
  IdxAuthenticator,
  IdxContext,
  IdxTransaction,
} from '@okta/okta-auth-js';
import { IDX_STEP } from 'src/constants';
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  AccordionLayout,
  DescriptionElement,
  FormBag,
  InfoboxElement,
  TitleElement,
  WebAuthNButtonElement,
  WidgetProps,
} from 'src/types';

import { transformWebAuthNAuthenticator } from '.';

const mockIsEdgeBrowser = jest.fn().mockReturnValue(false);
const mockIsSafariBrowser = jest.fn().mockReturnValue(false);
jest.mock('../../../../util/BrowserFeatures', () => ({
  isEdge: () => mockIsEdgeBrowser(),
  isSafari: () => mockIsSafariBrowser(),
}));

describe('WebAuthN Transformer Tests', () => {
  const widgetProps: WidgetProps = {};
  let transaction: IdxTransaction;
  let formBag: FormBag;
  let mockCredentialsContainer: CredentialsContainer;

  beforeEach(() => {
    mockIsEdgeBrowser.mockReturnValue(false);
    mockIsSafariBrowser.mockReturnValue(false);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('WebAuthN Enroll Tests', () => {
    beforeEach(() => {
      transaction = getStubTransactionWithNextStep();
      formBag = getStubFormBag(IDX_STEP.ENROLL_AUTHENTICATOR);
      transaction.nextStep = {
        name: IDX_STEP.ENROLL_AUTHENTICATOR,
        action: jest.fn(),
      };
      mockIsEdgeBrowser.mockReturnValue(false);
    });

    it('should only render title and description elements when WebAuthN API is not available', () => {
      const navigatorCredentials = jest.spyOn(global, 'navigator', 'get');
      navigatorCredentials.mockReturnValue(
        { credentials: {} } as unknown as Navigator,
      );
      const updatedFormBag = transformWebAuthNAuthenticator({ transaction, formBag, widgetProps });

      // Verify added elements
      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(2);
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('oie.enroll.webauthn.title');
      expect((updatedFormBag.uischema.elements[1] as InfoboxElement).options.message)
        .toEqual({
          class: 'ERROR',
          i18n: { key: 'oie.webauthn.error.not.supported' },
          message: 'oie.webauthn.error.not.supported',
        });
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
      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(3);
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('oie.enroll.webauthn.title');
      expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
        .toBe('oie.enroll.webauthn.instructions');
      expect(updatedFormBag.uischema.elements[2].type).toBe('WebAuthNSubmitButton');
      expect((updatedFormBag.uischema.elements[2] as WebAuthNButtonElement).options.step)
        .toBe('enroll-authenticator');
      expect((updatedFormBag.uischema.elements[2] as WebAuthNButtonElement).options.submitOnLoad)
        .toBe(false);
    });

    it('should render title, description, button and userVerification required elements when WebAuthN API is available', () => {
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
      transaction.nextStep = {
        name: IDX_STEP.ENROLL_AUTHENTICATOR,
        action: jest.fn(),
        relatesTo: {
          value: {
            contextualData: {
              activationData: {
                authenticatorSelection: {
                  userVerification: 'required',
                },
              } as unknown as ActivationData,
            },
          } as unknown as IdxAuthenticator,
        },
      };

      const updatedFormBag = transformWebAuthNAuthenticator({ transaction, formBag, widgetProps });

      // Verify added elements
      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(4);
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('oie.enroll.webauthn.title');
      expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
        .toBe('oie.enroll.webauthn.instructions');
      expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options.content)
        .toBe('oie.enroll.webauthn.uv.required.instructions');
      expect(updatedFormBag.uischema.elements[3].type).toBe('WebAuthNSubmitButton');
      expect((updatedFormBag.uischema.elements[3] as WebAuthNButtonElement).options.step)
        .toBe('enroll-authenticator');
      expect((updatedFormBag.uischema.elements[3] as WebAuthNButtonElement).options.submitOnLoad)
        .toBe(false);
    });

    it('should render title, description, button, and callout elements when WebAuthN API is available on MS Edge browser', () => {
      mockIsEdgeBrowser.mockReturnValue(true);
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
      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(4);
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('oie.enroll.webauthn.title');
      expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
        .toBe('oie.enroll.webauthn.instructions');
      expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options.content)
        .toBe('oie.enroll.webauthn.instructions.edge');
      expect(updatedFormBag.uischema.elements[3].type).toBe('WebAuthNSubmitButton');
      expect((updatedFormBag.uischema.elements[3] as WebAuthNButtonElement).options.step)
        .toBe('enroll-authenticator');
      expect((updatedFormBag.uischema.elements[3] as WebAuthNButtonElement).options.submitOnLoad)
        .toBe(false);
    });
  });

  describe('WebAuthN Challenge Tests', () => {
    beforeEach(() => {
      transaction = getStubTransactionWithNextStep();
      formBag = getStubFormBag(IDX_STEP.CHALLENGE_AUTHENTICATOR);
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
      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(3);
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('oie.verify.webauth.title');
      expect((updatedFormBag.uischema.elements[1] as InfoboxElement).options.message)
        .toEqual({
          class: 'ERROR',
          i18n: { key: 'oie.webauthn.error.not.supported' },
          message: 'oie.webauthn.error.not.supported',
        });
      expect(updatedFormBag.uischema.elements[2].type).toBe('Accordion');
      expect((updatedFormBag.uischema.elements[2] as AccordionLayout).elements.length).toBe(1);
      expect((updatedFormBag.uischema.elements[2] as AccordionLayout).elements[0].options.summary)
        .toBe('oie.verify.webauthn.cant.verify');
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
      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(4);
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('oie.verify.webauth.title');
      expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
        .toBe('oie.verify.webauthn.instructions');
      expect(updatedFormBag.uischema.elements[2].type).toBe('WebAuthNSubmitButton');
      expect((updatedFormBag.uischema.elements[2] as WebAuthNButtonElement).options.step)
        .toBe('challenge-authenticator');
      expect((updatedFormBag.uischema.elements[2] as WebAuthNButtonElement).options.submitOnLoad)
        .toBe(true);
      expect(updatedFormBag.uischema.elements[3].type).toBe('Accordion');
      expect((updatedFormBag.uischema.elements[3] as AccordionLayout).elements.length).toBe(1);
      expect((updatedFormBag.uischema.elements[3] as AccordionLayout).elements[0].options.summary)
        .toBe('oie.verify.webauthn.cant.verify');
      expect((updatedFormBag.uischema.elements[3] as AccordionLayout)
        .elements[0].options.content.elements.length).toBe(5);
    });

    it('should render title, description, button and can\'t verify link elements for appName = Okta_Authenticaotr when WebAuthN API is available', () => {
      transaction.context.app = { value: { name: 'Okta_Authenticator' } } as unknown as IdxContext['app'];
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
      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(4);
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('oie.verify.webauth.title');
      expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
        .toBe('oie.verify.webauthn.instructions');
      expect(updatedFormBag.uischema.elements[2].type).toBe('WebAuthNSubmitButton');
      expect((updatedFormBag.uischema.elements[2] as WebAuthNButtonElement).options.step)
        .toBe('challenge-authenticator');
      expect((updatedFormBag.uischema.elements[2] as WebAuthNButtonElement).options.submitOnLoad)
        .toBe(true);
      expect(updatedFormBag.uischema.elements[3].type).toBe('Accordion');
      expect((updatedFormBag.uischema.elements[3] as AccordionLayout).elements.length).toBe(1);
      expect((updatedFormBag.uischema.elements[3] as AccordionLayout).elements[0].options.summary)
        .toBe('oie.verify.webauthn.cant.verify');
      expect((updatedFormBag.uischema.elements[3] as AccordionLayout)
        .elements[0].options.content.elements.length).toBe(1);
    });

    it('should render title, description, button, and user verification elements when WebAuthN API is available in Safari Browser', () => {
      transaction.nextStep!.relatesTo = {
        value: {
          contextualData: {
            challengeData: {
              userVerification: 'required',
            } as unknown as ChallengeData,
          },
        } as unknown as IdxAuthenticator,
      };
      mockIsSafariBrowser.mockReturnValue(true);
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
      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(5);
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('oie.verify.webauth.title');
      expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
        .toBe('oie.verify.webauthn.instructions');
      expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options.content)
        .toBe('oie.verify.webauthn.uv.required.instructions');
      expect(updatedFormBag.uischema.elements[3].type).toBe('WebAuthNSubmitButton');
      expect((updatedFormBag.uischema.elements[3] as WebAuthNButtonElement).options.step)
        .toBe('challenge-authenticator');
      expect((updatedFormBag.uischema.elements[3] as WebAuthNButtonElement).options.submitOnLoad)
        .toBe(false);
      expect(updatedFormBag.uischema.elements[4].type).toBe('Accordion');
      expect((updatedFormBag.uischema.elements[4] as AccordionLayout).elements.length).toBe(1);
      expect((updatedFormBag.uischema.elements[4] as AccordionLayout).elements[0].options.summary)
        .toBe('oie.verify.webauthn.cant.verify');
      expect((updatedFormBag.uischema.elements[4] as AccordionLayout)
        .elements[0].options.content.elements.length).toBe(5);
    });
  });
});
