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
import { IDX_STEP } from 'src/constants';
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  ButtonElement,
  ButtonType,
  FieldElement,
  FormBag,
  LinkElement,
  TitleElement,
  UISchemaElement,
  WidgetProps,
} from 'src/types';

import { overwriteAutocomplete } from './overwriteAutocomplete';

describe('overwriteAutocomplete Tests', () => {
  let transaction: IdxTransaction;
  let formBag: FormBag;
  let widgetProps: WidgetProps;

  beforeEach(() => {
    transaction = getStubTransactionWithNextStep();
    formBag = getStubFormBag();

    transaction.nextStep!.name = IDX_STEP.CHALLENGE_AUTHENTICATOR;
    formBag.uischema.elements = [
      { type: 'Title', options: { content: 'Sign in' } } as TitleElement,
      { type: 'Field', options: { inputMeta: { name: 'identifier' } } } as FieldElement,
      {
        type: 'Field',
        options: {
          inputMeta: { name: 'credentials.passcode' },
          attributes: { autocomplete: 'new-password' },
        },
      } as FieldElement,
      { type: 'Button', options: { type: ButtonType.SUBMIT } } as ButtonElement,
      { type: 'Link', options: { label: 'Forgot Password' } } as LinkElement,
    ];
    widgetProps = {};
  });

  it.each`
    disableAutocomplete
    ${undefined}
    ${false}
    ${true}
  `('should set appropriate autocomplete attribute on elements when disableAutocomplete feature is $disableAutocomplete', ({ disableAutocomplete }) => {
    widgetProps = { features: { disableAutocomplete } };
    const updatedFormBag = overwriteAutocomplete({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);
    const { elements } = <{ elements: UISchemaElement[] }>updatedFormBag.uischema;

    const expectedAutocompleteValue = disableAutocomplete ? 'off' : 'new-password';
    expect(updatedFormBag).toMatchSnapshot();
    expect((elements[2] as FieldElement).options.attributes?.autocomplete)
      .toBe(expectedAutocompleteValue);
  });

  it('should update all elements in array with appropriate autocomplete value when  disableAutocomplete feature is true', async () => {
    widgetProps = { features: { disableAutocomplete: true } };
    formBag.uischema.elements.push({
      type: 'Field',
      options: {
        inputMeta: { name: 'confirmPassword' },
        attributes: { autocomplete: 'new-password' },
      },
    } as FieldElement);
    const updatedFormBag = overwriteAutocomplete({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);
    const { elements } = <{ elements: UISchemaElement[] }>updatedFormBag.uischema;

    expect(updatedFormBag).toMatchSnapshot();
    expect((elements[2] as FieldElement).options.attributes?.autocomplete)
      .toBe('off');
    expect((elements[5] as FieldElement).options.attributes?.autocomplete)
      .toBe('off');
  });
});
