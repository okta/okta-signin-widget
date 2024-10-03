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

import { IDX_STEP } from '../../constants';
import { getStubFormBag, getStubTransactionWithNextStep } from '../../mocks/utils/utils';
import {
  ButtonElement,
  ButtonType,
  FieldElement,
  FormBag,
  IdxAuthenticatorWithChallengeData,
  LinkElement,
  TitleElement,
  WebAuthNAutofillElement,
  WidgetProps,
} from '../../types';
import { getUIElementWithName } from '../utils';
import { addWebAuthNAutofillHandler } from './addWebAuthNAutofillHandler';

// as the transformer is mutating the object, we are using a lazy clone
// approach in order to compare the results
const lazyCloneObj = (obj) => JSON.parse(JSON.stringify(obj));

jest.mock('../../util', () => ({
  isConditionalMediationAvailable: () => true,
}));

describe('addWebAuthNAutofillHandler Tests', () => {
  let transaction: IdxTransaction;
  let formBag: FormBag;
  let widgetProps: WidgetProps;

  beforeEach(() => {
    transaction = getStubTransactionWithNextStep();
    formBag = getStubFormBag();

    transaction.nextStep!.name = IDX_STEP.IDENTIFY;

    transaction.availableSteps = [
      { name: IDX_STEP.IDENTIFY },
      {
        name: IDX_STEP.CHALLENGE_WEBAUTHN_AUTOFILLUI_AUTHENTICATOR,
        relatesTo: { value: { challengeData: {} } as IdxAuthenticatorWithChallengeData },
      },
    ];

    formBag.uischema.elements = [
      { type: 'Title', options: { content: 'Sign in' } } as TitleElement,
      { type: 'Field', options: { inputMeta: { name: 'identifier' }, attributes: {} } } as FieldElement,
      {
        type: 'Button',
        options: {
          type: ButtonType.SUBMIT,
          step: IDX_STEP.CHALLENGE_WEBAUTHN_AUTOFILLUI_AUTHENTICATOR,
          key: `${IDX_STEP.CHALLENGE_WEBAUTHN_AUTOFILLUI_AUTHENTICATOR}_Button`,
        },
      } as ButtonElement,
      { type: 'Link', options: { label: 'Forgot Password' } } as LinkElement,
    ];
    widgetProps = {};
  });

  it('should not do any transformation if disableAutocomplete is true', async () => {
    const beforeBag = lazyCloneObj(formBag);
    widgetProps = { features: { disableAutocomplete: true } };
    addWebAuthNAutofillHandler({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);
    const afterBag = lazyCloneObj(formBag);
    expect(afterBag).toEqual(beforeBag);
  });

  it('should not do any transformation if webauthn autofill step is not present', async () => {
    const beforeBag = lazyCloneObj(formBag);
    widgetProps = { features: { disableAutocomplete: false } };
    transaction.availableSteps = transaction.availableSteps
      ?.filter((t) => t.name !== IDX_STEP.CHALLENGE_WEBAUTHN_AUTOFILLUI_AUTHENTICATOR);
    addWebAuthNAutofillHandler({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);
    const afterBag = lazyCloneObj(formBag);
    expect(afterBag).toEqual(beforeBag);
  });

  it('should attach the "username webauthn" autocomplete attribute to the identifier input', async () => {
    widgetProps = { features: { disableAutocomplete: false } };
    addWebAuthNAutofillHandler({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);
    const identifier = getUIElementWithName('identifier', formBag.uischema.elements) as FieldElement;
    expect(identifier?.options?.attributes?.autocomplete).toBe('username webauthn');
  });

  it('should append the WebAuthNAutofill element', async () => {
    widgetProps = { features: { disableAutocomplete: false } };
    addWebAuthNAutofillHandler({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);
    const len = formBag.uischema.elements.length;
    const webAuthNAutofillEl = formBag.uischema.elements[len - 1] as WebAuthNAutofillElement;
    expect(webAuthNAutofillEl.type).toBe('WebAuthNAutofill');
    expect(webAuthNAutofillEl.options.step)
      .toBe(IDX_STEP.CHALLENGE_WEBAUTHN_AUTOFILLUI_AUTHENTICATOR);
    expect(typeof webAuthNAutofillEl.options.getCredentials).toBe('function');
  });
});
