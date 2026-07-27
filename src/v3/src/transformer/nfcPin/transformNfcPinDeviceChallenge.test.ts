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
  LinkElement,
  OpenOktaVerifyFPButtonElement,
  TitleElement,
  WidgetProps,
} from 'src/types';

import * as idxUtils from '../../util/idxUtils';
import { transformNfcPinDeviceChallenge } from './transformNfcPinDeviceChallenge';

describe('transformNfcPinDeviceChallenge', () => {
  const transaction = getStubTransactionWithNextStep();
  const formBag = getStubFormBag();
  const widgetProps: WidgetProps = {};

  beforeEach(() => {
    formBag.uischema.elements = [];
    transaction.nextStep = {
      name: 'challenge-poll',
      relatesTo: {
        value: {
          // @ts-expect-error contextualData not fully typed
          contextualData: {
            challenge: {
              value: {
                challengeMethod: 'CUSTOM_URI',
                href: 'com-okta-authenticator:/deviceChallenge?challengeRequest=mock-jwt',
                downloadHref: 'https://apps.apple.com/us/app/okta-verify/id490179405',
              },
            },
          },
          type: 'proximity',
          key: 'nfc_pin',
          id: 'npc123',
          displayName: 'NFC',
          methods: [{ type: 'nfc_pin' }],
        },
      },
    };
    transaction.availableSteps = [{ name: IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE }];
    jest.spyOn(idxUtils, 'hasMinAuthenticatorOptions').mockReturnValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should show NFC-specific title "Verify with NFC"', () => {
    const result = transformNfcPinDeviceChallenge({ transaction, formBag, widgetProps });

    const titleEl = result.uischema.elements[0] as TitleElement;
    expect(titleEl.type).toBe('Title');
    expect(titleEl.options.content).toBe('oie.nfc_pin.challenge.verify.title');
  });

  it('should show NFC-specific description', () => {
    const result = transformNfcPinDeviceChallenge({ transaction, formBag, widgetProps });

    const descEl = result.uischema.elements[1] as DescriptionElement;
    expect(descEl.type).toBe('Description');
    expect(descEl.options.content).toBe('oie.nfc_pin.challenge.verify.description');
  });

  it('should include OpenOktaVerifyFPButton with correct href', () => {
    const result = transformNfcPinDeviceChallenge({ transaction, formBag, widgetProps });

    const buttonEl = result.uischema.elements[2] as OpenOktaVerifyFPButtonElement;
    expect(buttonEl.type).toBe('OpenOktaVerifyFPButton');
    expect(buttonEl.options.href).toBe('com-okta-authenticator:/deviceChallenge?challengeRequest=mock-jwt');
    expect(buttonEl.options.challengeMethod).toBe('CUSTOM_URI');
  });

  it('should include "Verify with something else" link when multiple authenticators available', () => {
    const result = transformNfcPinDeviceChallenge({ transaction, formBag, widgetProps });

    const selectLink = result.uischema.elements[3] as LinkElement;
    expect(selectLink.type).toBe('Link');
    expect(selectLink.options.label).toBe('oie.verification.switch.authenticator');
  });

  it('should NOT include "Verify with something else" when only one authenticator', () => {
    jest.spyOn(idxUtils, 'hasMinAuthenticatorOptions').mockReturnValue(false);

    const result = transformNfcPinDeviceChallenge({ transaction, formBag, widgetProps });

    // Without switch link: [Title, Description, OpenOktaVerifyFPButton, CancelLink]
    expect(result.uischema.elements.length).toBe(4);
    const lastEl = result.uischema.elements[3] as LinkElement;
    expect(lastEl.options.label).toBe('goback');
  });

  it('should include "Back to sign in" cancel link', () => {
    const result = transformNfcPinDeviceChallenge({ transaction, formBag, widgetProps });

    const lastEl = result.uischema.elements[result.uischema.elements.length - 1] as LinkElement;
    expect(lastEl.type).toBe('Link');
    expect(lastEl.options.step).toBe('cancel');
    expect(lastEl.options.label).toBe('goback');
  });

  it('should NOT include download link (not relevant for NFC)', () => {
    const result = transformNfcPinDeviceChallenge({ transaction, formBag, widgetProps });

    // With switch link: [Title, Description, OpenOktaVerifyFPButton, SwitchAuthLink, CancelLink]
    expect(result.uischema.elements.length).toBe(5);
    // No element should have a download href
    const hasDownloadLink = result.uischema.elements.some(
      (el) => (el as LinkElement).options?.href?.includes('apple.com'),
    );
    expect(hasDownloadLink).toBe(false);
  });
});
