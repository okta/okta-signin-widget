/*
 * Copyright (c) 2026-present, Okta, Inc. and/or its affiliates. All rights reserved.
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
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  DescriptionElement,
  FieldElement,
  LinkElement,
  OpenOktaVerifyFPButtonElement,
  TitleElement,
  WidgetProps,
} from 'src/types';

import * as idxUtils from '../../util/idxUtils';
import { transformNfcPinEnroll } from './transformNfcPinEnroll';

describe('transformNfcPinEnroll', () => {
  const widgetProps: WidgetProps = {};

  describe('Device Challenge Phase (no passcode field)', () => {
    let transaction: ReturnType<typeof getStubTransactionWithNextStep>;
    let formBag: ReturnType<typeof getStubFormBag>;

    beforeEach(() => {
      transaction = getStubTransactionWithNextStep();
      formBag = getStubFormBag();
      formBag.uischema.elements = [];
      transaction.nextStep = { name: 'enroll-poll' };
      transaction.rawIdxState = {
        ...transaction.rawIdxState,
        currentAuthenticator: {
          type: 'object',
          value: {
            // @ts-expect-error contextualData not fully typed
            contextualData: {
              setupNfcUrl: 'com-okta-authenticator:/actions/enroll?authenticator_key=nfc&nonce=mock',
            },
            type: 'proximity',
            key: 'nfc_pin',
            id: 'aut123',
            displayName: 'NFC',
            methods: [{ type: 'nfc_pin' }],
          },
        },
      };
      transaction.availableSteps = [{ name: IDX_STEP.SELECT_AUTHENTICATOR_ENROLL }];
      jest.spyOn(idxUtils, 'hasMinAuthenticatorOptions').mockReturnValue(true);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should show "Set up NFC" title', () => {
      const result = transformNfcPinEnroll({ transaction, formBag, widgetProps });

      const titleEl = result.uischema.elements[0] as TitleElement;
      expect(titleEl.type).toBe('Title');
      expect(titleEl.options.content).toBe('oie.enroll.nfc_pin.title');
    });

    it('should show NFC enrollment description', () => {
      const result = transformNfcPinEnroll({ transaction, formBag, widgetProps });

      const descEl = result.uischema.elements[1] as DescriptionElement;
      expect(descEl.type).toBe('Description');
      expect(descEl.options.content).toBe('oie.enroll.nfc_pin.instructions');
    });

    it('should include OpenOktaVerifyFPButton with setupNfcUrl', () => {
      const result = transformNfcPinEnroll({ transaction, formBag, widgetProps });

      const buttonEl = result.uischema.elements[2] as OpenOktaVerifyFPButtonElement;
      expect(buttonEl.type).toBe('OpenOktaVerifyFPButton');
      expect(buttonEl.options.href).toBe('com-okta-authenticator:/actions/enroll?authenticator_key=nfc&nonce=mock');
      expect(buttonEl.options.challengeMethod).toBe('CUSTOM_URI');
    });

    it('should include "Return to authenticator list" link', () => {
      const result = transformNfcPinEnroll({ transaction, formBag, widgetProps });

      // Element order: [Title, Description, OpenOktaVerifyFPButton, ReturnLink, CancelLink]
      const returnLink = result.uischema.elements[3] as LinkElement;
      expect(returnLink.type).toBe('Link');
      expect(returnLink.options.label).toBe('oie.enroll.switch.authenticator');
    });

    it('should include "Back to sign in" cancel link', () => {
      const result = transformNfcPinEnroll({ transaction, formBag, widgetProps });

      const lastEl = result.uischema.elements[result.uischema.elements.length - 1] as LinkElement;
      expect(lastEl.type).toBe('Link');
      expect(lastEl.options.step).toBe('cancel');
      expect(lastEl.options.label).toBe('goback');
    });

    it('should NOT include download link', () => {
      const result = transformNfcPinEnroll({ transaction, formBag, widgetProps });

      // Only 5 elements: [Title, Description, OpenOktaVerifyFPButton, ReturnLink, CancelLink]
      expect(result.uischema.elements.length).toBe(5);
      const hasDownloadLink = result.uischema.elements.some(
        (el) => (el as LinkElement).options?.href?.includes('apple.com'),
      );
      expect(hasDownloadLink).toBe(false);
    });
  });

  describe('PIN Creation Phase (has passcode field)', () => {
    let transaction: ReturnType<typeof getStubTransactionWithNextStep>;
    let formBag: ReturnType<typeof getStubFormBag>;

    beforeEach(() => {
      transaction = getStubTransactionWithNextStep();
      formBag = getStubFormBag();
      formBag.uischema.elements = [
        {
          type: 'Field',
          label: 'NFC',
          key: 'credentials.passcode',
          options: { inputMeta: { name: 'credentials.passcode', secret: true } },
        } as FieldElement,
      ];
      transaction.nextStep = {
        name: 'enroll-authenticator',
        relatesTo: {
          value: {
            type: 'proximity',
            key: 'nfc_pin',
            id: 'aut123',
            displayName: 'NFC',
            methods: [{ type: 'nfc_pin' }],
            // @ts-expect-error settings not fully typed
            settings: { minLength: 4, maxLength: 4 },
          },
        },
      };
      transaction.availableSteps = [{ name: IDX_STEP.SELECT_AUTHENTICATOR_ENROLL }];
    });

    it('should delegate to transformNfcPinCreate when passcode field exists', () => {
      const result = transformNfcPinEnroll({ transaction, formBag, widgetProps });

      // transformNfcPinCreate adds Title as first element
      const titleEl = result.uischema.elements[0] as TitleElement;
      expect(titleEl.type).toBe('Title');
      expect(titleEl.options.content).toBe('oie.enroll.nfc_pin.create.title');
    });
  });
});
