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
  ButtonElement,
  FieldElement,
  LinkElement,
  TitleElement,
  WidgetProps,
} from 'src/types';

import * as idxUtils from '../../util/idxUtils';
import { transformNfcPinVerify } from './transformNfcPinVerify';

describe('transformNfcPinVerify', () => {
  const transaction = getStubTransactionWithNextStep();
  const formBag = getStubFormBag();
  const widgetProps: WidgetProps = {};

  beforeEach(() => {
    formBag.uischema.elements = [
      {
        type: 'Field',
        label: 'NFC',
        key: 'credentials.passcode',
        options: { inputMeta: { name: 'credentials.passcode', secret: true } },
      } as FieldElement,
    ];
    transaction.nextStep = {
      name: 'challenge-authenticator',
    };
    transaction.availableSteps = [
      { name: 'currentAuthenticatorEnrollment-recover' },
      { name: IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE },
    ];
    jest.spyOn(idxUtils, 'hasMinAuthenticatorOptions').mockReturnValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should show "Verify with your PIN" title', () => {
    const result = transformNfcPinVerify({ transaction, formBag, widgetProps });

    // Element order: [Title, Field, Button, ForgotPinLink, SwitchAuthLink, CancelLink]
    const titleEl = result.uischema.elements[0] as TitleElement;
    expect(titleEl.type).toBe('Title');
    expect(titleEl.options.content).toBe('oie.nfc_pin.verify.title');
  });

  it('should override passcode label to "Enter PIN"', () => {
    const result = transformNfcPinVerify({ transaction, formBag, widgetProps });

    const fieldEl = result.uischema.elements[1] as FieldElement;
    expect(fieldEl.type).toBe('Field');
    expect(fieldEl.label).toBe('oie.nfc_pin.verify.pinLabel');
  });

  it('should add inputmode numeric to passcode field', () => {
    const result = transformNfcPinVerify({ transaction, formBag, widgetProps });

    const fieldEl = result.uischema.elements[1] as FieldElement;
    expect(fieldEl.options.attributes?.inputmode).toBe('numeric');
  });

  it('should include Verify submit button', () => {
    const result = transformNfcPinVerify({ transaction, formBag, widgetProps });

    const buttonEl = result.uischema.elements[2] as ButtonElement;
    expect(buttonEl.type).toBe('Button');
    expect(buttonEl.label).toBe('mfa.challenge.verify');
  });

  it('should include "Forgot PIN?" link when recover step available', () => {
    const result = transformNfcPinVerify({ transaction, formBag, widgetProps });

    const forgotLink = result.uischema.elements[3] as LinkElement;
    expect(forgotLink.type).toBe('Link');
    expect(forgotLink.options.label).toBe('oie.nfc_pin.forgot.pin');
    expect(forgotLink.options.step).toBe('currentAuthenticatorEnrollment-recover');
  });

  it('should NOT include "Forgot PIN?" when recover step not available', () => {
    transaction.availableSteps = [{ name: IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE }];

    const result = transformNfcPinVerify({ transaction, formBag, widgetProps });

    // Without recover step: [Title, Field, Button, SwitchAuthLink, CancelLink]
    const linkAfterButton = result.uischema.elements[3] as LinkElement;
    expect(linkAfterButton.type).toBe('Link');
    expect(linkAfterButton.options.label).not.toBe('oie.nfc_pin.forgot.pin');
  });

  it('should include "Verify with something else" link', () => {
    const result = transformNfcPinVerify({ transaction, formBag, widgetProps });

    // With recover step: [Title, Field, Button, ForgotPinLink, SwitchAuthLink, CancelLink]
    const switchLink = result.uischema.elements[4] as LinkElement;
    expect(switchLink.type).toBe('Link');
    expect(switchLink.options.label).toBe('oie.verification.switch.authenticator');
  });

  it('should include "Back to sign in" cancel link', () => {
    const result = transformNfcPinVerify({ transaction, formBag, widgetProps });

    const lastEl = result.uischema.elements[result.uischema.elements.length - 1] as LinkElement;
    expect(lastEl.type).toBe('Link');
    expect(lastEl.options.step).toBe('cancel');
    expect(lastEl.options.label).toBe('goback');
  });
});
