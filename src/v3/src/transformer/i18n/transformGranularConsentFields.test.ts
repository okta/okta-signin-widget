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

import { IdxTransaction, Input } from '@okta/okta-auth-js';

import { IDX_STEP } from '../../constants';
import { getStubFormBag, getStubTransactionWithNextStep } from '../../mocks/utils/utils';
import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  FieldElement,
  FormBag,
  LinkElement,
  TitleElement,
  WidgetProps,
} from '../../types';
import { transformGranularConsentFields } from './transformGranularConsentFields';

describe('Granular Consent field transformer tests', () => {
  let transaction: IdxTransaction;
  let formBag: FormBag;
  let widgetProps: WidgetProps;

  beforeEach(() => {
    transaction = getStubTransactionWithNextStep();
    formBag = getStubFormBag();
    formBag.uischema.elements = [
      { type: 'Description', options: { content: 'Allowing access will share' } } as DescriptionElement,
      {
        type: 'Field',
        options: {
          inputMeta: {
            name: 'optedScopes.custom.custom1',
            label: 'Custom 1 label',
            // TODO: Input type is missing desc as a property
            desc: 'This is a custom description for the custom field.',
            type: 'boolean',
            required: true,
            visible: true,
            mutable: true,
            // TODO: Input value type does not specify boolean as an option
            value: true,
          } as unknown as Input,
        },
      } as FieldElement,
      {
        type: 'Field',
        options: {
          inputMeta: {
            name: 'optedScopes.custom.custom2',
            label: 'Custom 2 label',
            type: 'boolean',
            required: true,
            visible: true,
            mutable: true,
            // TODO: Input value type does not specify boolean as an option
            value: true,
          } as unknown as Input,
        },
      } as FieldElement,
      {
        type: 'Field',
        options: {
          inputMeta: {
            name: 'optedScopes.openid',
            type: 'boolean',
            required: true,
            visible: true,
            mutable: false,
            // TODO: Input value type does not specify boolean as an option
            value: true,
          } as unknown as Input,
        },
      } as FieldElement,
      {
        type: 'Field',
        options: {
          inputMeta: {
            name: 'optedScopes.email',
            label: 'Label for email field',
            type: 'boolean',
            required: true,
            visible: true,
            mutable: false,
            // TODO: Input value type does not specify boolean as an option
            value: true,
          } as unknown as Input,
        },
      } as FieldElement,
      { type: 'Link', options: { label: 'Terms of Service' } } as LinkElement,
      { type: 'Link', options: { label: 'Privacy Policy' } } as LinkElement,
      { type: 'Button', label: 'Allow access', options: { type: ButtonType.BUTTON } } as ButtonElement,
      { type: 'Button', label: 'Cancel', options: { type: ButtonType.BUTTON } } as ButtonElement,
    ];
    widgetProps = {};
  });

  it('should not perform an update on field elements when step is not granular consent', () => {
    formBag.uischema.elements = [
      { type: 'Title', options: { content: 'Sign in' } } as TitleElement,
      {
        type: 'Field',
        options: { inputMeta: { name: 'consent', label: 'Consent given', type: 'boolean' } },
      } as FieldElement,
    ];
    transaction.nextStep = {
      name: IDX_STEP.IDENTIFY,
    };
    const updatedFormBag = transformGranularConsentFields({
      transaction,
      widgetProps,
      step: IDX_STEP.IDENTIFY,
      isClientTransaction: false,
      setMessage: () => {},
    })(formBag);

    expect(updatedFormBag.uischema.elements.length).toBe(2);
    expect((updatedFormBag.uischema.elements[1] as FieldElement).translations).toBeUndefined();
  });

  it('should update translations array with label and description for granular consent field elements', () => {
    transaction.nextStep = {
      name: IDX_STEP.CONSENT_GRANULAR,
    };
    const updatedFormBag = transformGranularConsentFields({
      transaction,
      widgetProps,
      step: IDX_STEP.CONSENT_GRANULAR,
      isClientTransaction: false,
      setMessage: () => {},
    })(formBag);

    expect(updatedFormBag).toMatchSnapshot();
    expect((updatedFormBag.uischema.elements[1] as FieldElement).translations?.length).toBe(2);
    expect((updatedFormBag.uischema.elements[1] as FieldElement).translations)
      .toEqual([
        {
          name: 'label',
          i18nKey: '',
          value: 'Custom 1 label',
          noTranslate: true,
        },
        {
          name: 'description',
          i18nKey: '',
          value: 'This is a custom description for the custom field.',
          noTranslate: true,
        },
      ]);
    expect((updatedFormBag.uischema.elements[2] as FieldElement).translations?.length).toBe(1);
    expect((updatedFormBag.uischema.elements[2] as FieldElement).translations)
      .toEqual([
        {
          name: 'label',
          i18nKey: '',
          value: 'Custom 2 label',
          noTranslate: true,
        },
      ]);
    expect((updatedFormBag.uischema.elements[3] as FieldElement).translations?.length).toBe(2);
    expect((updatedFormBag.uischema.elements[3] as FieldElement).translations)
      .toEqual([
        {
          name: 'label',
          i18nKey: '',
          value: 'openid',
          noTranslate: true,
        },
        {
          name: 'description',
          i18nKey: 'consent.scopes.openid.desc',
          value: 'consent.scopes.openid.desc',
          noTranslate: true,
        },
      ]);
    expect((updatedFormBag.uischema.elements[4] as FieldElement).translations?.length).toBe(2);
    expect((updatedFormBag.uischema.elements[4] as FieldElement).translations)
      .toEqual([
        {
          name: 'label',
          i18nKey: 'consent.scopes.email.label',
          value: 'consent.scopes.email.label',
          noTranslate: false,
        },
        {
          name: 'description',
          i18nKey: 'consent.scopes.email.desc',
          value: 'consent.scopes.email.desc',
          noTranslate: false,
        },
      ]);
  });
});
