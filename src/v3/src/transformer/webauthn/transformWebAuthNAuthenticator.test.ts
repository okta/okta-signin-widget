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

  describe('WebAuthN displayName variations', () => {
    beforeEach(() => {
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
    });

    it('should render DEFAULT title for enroll when displayName is "Security Key or Biometric"', () => {
      transaction = getStubTransactionWithNextStep();
      formBag = getStubFormBag(IDX_STEP.ENROLL_AUTHENTICATOR);
      transaction.nextStep = {
        name: IDX_STEP.ENROLL_AUTHENTICATOR,
        action: jest.fn(),
        relatesTo: {
          value: {
            displayName: 'Security Key or Biometric',
          } as unknown as IdxAuthenticator,
        },
      };

      const updatedFormBag = transformWebAuthNAuthenticator({ transaction, formBag, widgetProps });

      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('oie.enroll.webauthn.title');
    });

    it('should render PASSKEYS title for enroll when displayName is "Passkeys"', () => {
      transaction = getStubTransactionWithNextStep();
      formBag = getStubFormBag(IDX_STEP.ENROLL_AUTHENTICATOR);
      transaction.nextStep = {
        name: IDX_STEP.ENROLL_AUTHENTICATOR,
        action: jest.fn(),
        relatesTo: {
          value: {
            displayName: 'Passkeys',
          } as unknown as IdxAuthenticator,
        },
      };

      const updatedFormBag = transformWebAuthNAuthenticator({ transaction, formBag, widgetProps });

      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('oie.enroll.webauthn.passkeysRebrand.passkeys.title');
    });

    it('should render CUSTOM title for enroll with displayName parameter', () => {
      transaction = getStubTransactionWithNextStep();
      formBag = getStubFormBag(IDX_STEP.ENROLL_AUTHENTICATOR);
      transaction.nextStep = {
        name: IDX_STEP.ENROLL_AUTHENTICATOR,
        action: jest.fn(),
        relatesTo: {
          value: {
            displayName: 'YubiKey',
          } as unknown as IdxAuthenticator,
        },
      };

      const updatedFormBag = transformWebAuthNAuthenticator({ transaction, formBag, widgetProps });

      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('oie.enroll.webauthn.passkeysRebrand.custom.title');
    });

    it('should render DEFAULT title for verify when displayName is "Security Key or Biometric"', () => {
      transaction = getStubTransactionWithNextStep();
      formBag = getStubFormBag(IDX_STEP.CHALLENGE_AUTHENTICATOR);
      transaction.nextStep = {
        name: IDX_STEP.CHALLENGE_AUTHENTICATOR,
        action: jest.fn(),
        relatesTo: {
          value: {
            displayName: 'Security Key or Biometric',
          } as unknown as IdxAuthenticator,
        },
      };

      const updatedFormBag = transformWebAuthNAuthenticator({ transaction, formBag, widgetProps });

      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('oie.verify.webauth.title');
    });

    it('should render PASSKEYS title for verify when displayName is "Passkeys"', () => {
      transaction = getStubTransactionWithNextStep();
      formBag = getStubFormBag(IDX_STEP.CHALLENGE_AUTHENTICATOR);
      transaction.nextStep = {
        name: IDX_STEP.CHALLENGE_AUTHENTICATOR,
        action: jest.fn(),
        relatesTo: {
          value: {
            displayName: 'Passkeys',
          } as unknown as IdxAuthenticator,
        },
      };

      const updatedFormBag = transformWebAuthNAuthenticator({ transaction, formBag, widgetProps });

      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('oie.verify.webauth.passkeysRebrand.passkeys.title');
    });

    it('should render CUSTOM title for verify with displayName parameter', () => {
      transaction = getStubTransactionWithNextStep();
      formBag = getStubFormBag(IDX_STEP.CHALLENGE_AUTHENTICATOR);
      transaction.nextStep = {
        name: IDX_STEP.CHALLENGE_AUTHENTICATOR,
        action: jest.fn(),
        relatesTo: {
          value: {
            displayName: 'TouchID',
          } as unknown as IdxAuthenticator,
        },
      };

      const updatedFormBag = transformWebAuthNAuthenticator({ transaction, formBag, widgetProps });

      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('oie.verify.webauth.passkeysRebrand.custom.title');
    });

    it('should render additional instructions heading and InfoBox for custom displayName with description during ENROLL', () => {
      transaction = getStubTransactionWithNextStep();
      formBag = getStubFormBag(IDX_STEP.ENROLL_AUTHENTICATOR);
      transaction.nextStep = {
        name: IDX_STEP.ENROLL_AUTHENTICATOR,
        action: jest.fn(),
        relatesTo: {
          value: {
            displayName: 'YubiKey',
            description: 'Insert your YubiKey and tap to authenticate.',
          } as unknown as IdxAuthenticator,
        },
      };

      const updatedFormBag = transformWebAuthNAuthenticator({ transaction, formBag, widgetProps });

      // Should have: Title, Description (instructions), Description (additional instructions heading with <strong>), InfoBox (custom description), Button
      expect(updatedFormBag.uischema.elements.length).toBe(5);
      expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('oie.enroll.webauthn.passkeysRebrand.custom.title');

      // Main instructions
      expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
      expect((updatedFormBag.uischema.elements[1] as DescriptionElement).contentType).toBe('subtitle');
      expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
        .toBe('oie.enroll.webauthn.instructions');

      // Additional instructions heading (as Description with <strong>)
      expect(updatedFormBag.uischema.elements[2].type).toBe('Description');
      expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options.content)
        .toContain('<strong>');
      expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options.content)
        .toContain('oie.verify.webauthn.instructions.additional');

      // InfoBox with custom description
      expect(updatedFormBag.uischema.elements[3].type).toBe('InfoBox');
      expect((updatedFormBag.uischema.elements[3] as InfoboxElement).options.class).toBe('INFO');
      expect((updatedFormBag.uischema.elements[3] as InfoboxElement).options.message)
        .toEqual({
          class: 'INFO',
          message: 'Insert your YubiKey and tap to authenticate.',
        });

      // Submit button
      expect(updatedFormBag.uischema.elements[4].type).toBe('WebAuthNSubmitButton');
    });

    it('should render additional instructions heading and InfoBox for custom displayName with description during VERIFY', () => {
      transaction = getStubTransactionWithNextStep();
      formBag = getStubFormBag(IDX_STEP.CHALLENGE_AUTHENTICATOR);
      transaction.nextStep = {
        name: IDX_STEP.CHALLENGE_AUTHENTICATOR,
        action: jest.fn(),
        relatesTo: {
          value: {
            displayName: 'Passkeys Rebrand Super Cool Company Passkeys',
            description: 'Use your company-issued passkey to sign in.',
          } as unknown as IdxAuthenticator,
        },
      };

      const updatedFormBag = transformWebAuthNAuthenticator({ transaction, formBag, widgetProps });

      // Should have: Title, Description (instructions), Description (additional instructions heading), InfoBox (custom description), Button, Accordion
      expect(updatedFormBag.uischema.elements.length).toBe(6);
      expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('oie.verify.webauth.passkeysRebrand.custom.title');

      // Main instructions
      expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
      expect((updatedFormBag.uischema.elements[1] as DescriptionElement).contentType).toBe('subtitle');
      expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
        .toBe('oie.verify.webauthn.instructions');

      // Additional instructions heading
      expect(updatedFormBag.uischema.elements[2].type).toBe('Description');
      expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options.content)
        .toContain('<strong>');
      expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options.content)
        .toContain('oie.verify.webauthn.instructions.additional');

      // InfoBox with custom description
      expect(updatedFormBag.uischema.elements[3].type).toBe('InfoBox');
      expect((updatedFormBag.uischema.elements[3] as InfoboxElement).options.class).toBe('INFO');
      expect((updatedFormBag.uischema.elements[3] as InfoboxElement).options.message)
        .toEqual({
          class: 'INFO',
          message: 'Use your company-issued passkey to sign in.',
        });

      // Submit button
      expect(updatedFormBag.uischema.elements[4].type).toBe('WebAuthNSubmitButton');

      // Accordion (for CHALLENGE_AUTHENTICATOR)
      expect(updatedFormBag.uischema.elements[5].type).toBe('Accordion');
    });

    it('should NOT render additional instructions for DEFAULT displayName even with description', () => {
      transaction = getStubTransactionWithNextStep();
      formBag = getStubFormBag(IDX_STEP.ENROLL_AUTHENTICATOR);
      transaction.nextStep = {
        name: IDX_STEP.ENROLL_AUTHENTICATOR,
        action: jest.fn(),
        relatesTo: {
          value: {
            displayName: 'Security Key or Biometric',
            description: 'Some description',
          } as unknown as IdxAuthenticator,
        },
      };

      const updatedFormBag = transformWebAuthNAuthenticator({ transaction, formBag, widgetProps });

      // Should NOT have additional instructions Description or InfoBox
      const hasAdditionalInstructions = updatedFormBag.uischema.elements.some(
        (el: any) => el.type === 'Description' && el.options?.content?.includes('oie.verify.webauthn.instructions.additional'),
      );
      expect(hasAdditionalInstructions).toBe(false);

      const hasInfoBox = updatedFormBag.uischema.elements.some(
        (el: any) => el.type === 'InfoBox',
      );
      expect(hasInfoBox).toBe(false);
    });

    it('should NOT render additional instructions for PASSKEYS displayName even with description', () => {
      transaction = getStubTransactionWithNextStep();
      formBag = getStubFormBag(IDX_STEP.ENROLL_AUTHENTICATOR);
      transaction.nextStep = {
        name: IDX_STEP.ENROLL_AUTHENTICATOR,
        action: jest.fn(),
        relatesTo: {
          value: {
            displayName: 'Passkeys',
            description: 'Some description',
          } as unknown as IdxAuthenticator,
        },
      };

      const updatedFormBag = transformWebAuthNAuthenticator({ transaction, formBag, widgetProps });

      // Should NOT have additional instructions Description or InfoBox
      const hasAdditionalInstructions = updatedFormBag.uischema.elements.some(
        (el: any) => el.type === 'Description' && el.options?.content?.includes('oie.verify.webauthn.instructions.additional'),
      );
      expect(hasAdditionalInstructions).toBe(false);

      const hasInfoBox = updatedFormBag.uischema.elements.some(
        (el: any) => el.type === 'InfoBox',
      );
      expect(hasInfoBox).toBe(false);
    });

    it('should NOT render additional instructions for custom displayName without description', () => {
      transaction = getStubTransactionWithNextStep();
      formBag = getStubFormBag(IDX_STEP.ENROLL_AUTHENTICATOR);
      transaction.nextStep = {
        name: IDX_STEP.ENROLL_AUTHENTICATOR,
        action: jest.fn(),
        relatesTo: {
          value: {
            displayName: 'YubiKey',
          } as unknown as IdxAuthenticator,
        },
      };

      const updatedFormBag = transformWebAuthNAuthenticator({ transaction, formBag, widgetProps });

      // Should NOT have additional instructions Description or InfoBox
      const hasAdditionalInstructions = updatedFormBag.uischema.elements.some(
        (el: any) => el.type === 'Description' && el.options?.content?.includes('oie.verify.webauthn.instructions.additional'),
      );
      expect(hasAdditionalInstructions).toBe(false);

      const hasInfoBox = updatedFormBag.uischema.elements.some(
        (el: any) => el.type === 'InfoBox',
      );
      expect(hasInfoBox).toBe(false);
    });

    it('should use same instructions key for all displayName types (no parameters for instructions)', () => {
      // Test DEFAULT
      transaction = getStubTransactionWithNextStep();
      formBag = getStubFormBag(IDX_STEP.ENROLL_AUTHENTICATOR);
      transaction.nextStep = {
        name: IDX_STEP.ENROLL_AUTHENTICATOR,
        action: jest.fn(),
        relatesTo: {
          value: {
            displayName: 'Security Key or Biometric',
          } as unknown as IdxAuthenticator,
        },
      };
      let updatedFormBag = transformWebAuthNAuthenticator({ transaction, formBag, widgetProps });
      let instructionsElement = updatedFormBag.uischema.elements.find(
        (el: any) => el.type === 'Description' && el.contentType === 'subtitle',
      ) as DescriptionElement;
      expect(instructionsElement.options.content).toBe('oie.enroll.webauthn.instructions');

      // Test PASSKEYS
      transaction = getStubTransactionWithNextStep();
      formBag = getStubFormBag(IDX_STEP.ENROLL_AUTHENTICATOR);
      transaction.nextStep = {
        name: IDX_STEP.ENROLL_AUTHENTICATOR,
        action: jest.fn(),
        relatesTo: {
          value: {
            displayName: 'Passkeys',
          } as unknown as IdxAuthenticator,
        },
      };
      updatedFormBag = transformWebAuthNAuthenticator({ transaction, formBag, widgetProps });
      instructionsElement = updatedFormBag.uischema.elements.find(
        (el: any) => el.type === 'Description' && el.contentType === 'subtitle',
      ) as DescriptionElement;
      expect(instructionsElement.options.content).toBe('oie.enroll.webauthn.instructions');

      // Test CUSTOM
      transaction = getStubTransactionWithNextStep();
      formBag = getStubFormBag(IDX_STEP.ENROLL_AUTHENTICATOR);
      transaction.nextStep = {
        name: IDX_STEP.ENROLL_AUTHENTICATOR,
        action: jest.fn(),
        relatesTo: {
          value: {
            displayName: 'Company Passkeys',
          } as unknown as IdxAuthenticator,
        },
      };
      updatedFormBag = transformWebAuthNAuthenticator({ transaction, formBag, widgetProps });
      instructionsElement = updatedFormBag.uischema.elements.find(
        (el: any) => el.type === 'Description' && el.contentType === 'subtitle',
      ) as DescriptionElement;
      // Instructions should be the same key, no parameters
      expect(instructionsElement.options.content).toBe('oie.enroll.webauthn.instructions');
    });

    it('should render title with displayName for CUSTOM authenticator during enroll', () => {
      transaction = getStubTransactionWithNextStep();
      formBag = getStubFormBag(IDX_STEP.ENROLL_AUTHENTICATOR);
      transaction.nextStep = {
        name: IDX_STEP.ENROLL_AUTHENTICATOR,
        action: jest.fn(),
        relatesTo: {
          value: {
            displayName: 'Passkeys Rebrand Super Cool Company Passkeys',
          } as unknown as IdxAuthenticator,
        },
      };

      const updatedFormBag = transformWebAuthNAuthenticator({ transaction, formBag, widgetProps });

      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('oie.enroll.webauthn.passkeysRebrand.custom.title');
    });

    it('should render title with displayName for CUSTOM authenticator during verify', () => {
      transaction = getStubTransactionWithNextStep();
      formBag = getStubFormBag(IDX_STEP.CHALLENGE_AUTHENTICATOR);
      transaction.nextStep = {
        name: IDX_STEP.CHALLENGE_AUTHENTICATOR,
        action: jest.fn(),
        relatesTo: {
          value: {
            displayName: 'Company YubiKey',
          } as unknown as IdxAuthenticator,
        },
      };

      const updatedFormBag = transformWebAuthNAuthenticator({ transaction, formBag, widgetProps });

      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('oie.verify.webauth.passkeysRebrand.custom.title');
    });

    it('should handle empty string displayName as DEFAULT', () => {
      transaction = getStubTransactionWithNextStep();
      formBag = getStubFormBag(IDX_STEP.ENROLL_AUTHENTICATOR);
      transaction.nextStep = {
        name: IDX_STEP.ENROLL_AUTHENTICATOR,
        action: jest.fn(),
        relatesTo: {
          value: {
            displayName: '',
          } as unknown as IdxAuthenticator,
        },
      };

      const updatedFormBag = transformWebAuthNAuthenticator({ transaction, formBag, widgetProps });

      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('oie.enroll.webauthn.title');
    });

    it('should render multiple custom displayName authenticators with different descriptions', () => {
      // First custom authenticator
      transaction = getStubTransactionWithNextStep();
      formBag = getStubFormBag(IDX_STEP.CHALLENGE_AUTHENTICATOR);
      transaction.nextStep = {
        name: IDX_STEP.CHALLENGE_AUTHENTICATOR,
        action: jest.fn(),
        relatesTo: {
          value: {
            displayName: 'Hardware Security Key',
            description: 'Insert and tap your hardware key.',
          } as unknown as IdxAuthenticator,
        },
      };

      const updatedFormBag1 = transformWebAuthNAuthenticator({ transaction, formBag, widgetProps });

      expect((updatedFormBag1.uischema.elements[0] as TitleElement).options.content)
        .toBe('oie.verify.webauth.passkeysRebrand.custom.title');
      const infoBox1 = updatedFormBag1.uischema.elements.find(
        (el: any) => el.type === 'InfoBox',
      ) as InfoboxElement;
      expect(infoBox1.options.message).toEqual({
        class: 'INFO',
        message: 'Insert and tap your hardware key.',
      });

      // Second custom authenticator with different description
      transaction = getStubTransactionWithNextStep();
      formBag = getStubFormBag(IDX_STEP.CHALLENGE_AUTHENTICATOR);
      transaction.nextStep = {
        name: IDX_STEP.CHALLENGE_AUTHENTICATOR,
        action: jest.fn(),
        relatesTo: {
          value: {
            displayName: 'Biometric Auth',
            description: 'Use your fingerprint or face to authenticate.',
          } as unknown as IdxAuthenticator,
        },
      };

      const updatedFormBag2 = transformWebAuthNAuthenticator({ transaction, formBag, widgetProps });

      const infoBox2 = updatedFormBag2.uischema.elements.find(
        (el: any) => el.type === 'InfoBox',
      ) as InfoboxElement;
      expect(infoBox2.options.message).toEqual({
        class: 'INFO',
        message: 'Use your fingerprint or face to authenticate.',
      });
    });
  });
});
