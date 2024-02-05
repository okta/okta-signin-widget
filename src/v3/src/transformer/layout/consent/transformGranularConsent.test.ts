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

import { getStubFormBag, getStubTransactionWithNextStep } from '../../../mocks/utils/utils';
import {
  ButtonElement, DescriptionElement, FieldElement, FormBag, LinkElement, WidgetProps,
} from '../../../types';
import { transformGranularConsent } from './transformGranularConsent';

describe('transformGranularConsent tests', () => {
  const widgetProps: WidgetProps = {};
  let transaction: IdxTransaction;
  let formBag: FormBag;

  beforeEach(() => {
    transaction = getStubTransactionWithNextStep();
    formBag = getStubFormBag();

    // @ts-expect-error OKTA-598868 app is missing from rawIdxState type
    transaction.rawIdxState.app = {
      type: 'object',
      value: {
        label: 'Native client',
        id: 'abcd1234',
        termsOfService: { href: 'https://okta1.com/tos' },
        privacyPolicy: { href: 'https://okta1.com/privacypolicy' },
        logo: { alt: 'Logo for the app' },
        clientUri: { href: 'https://okta1.acme.com' },
      },
    };

    formBag.uischema.elements = [
      {
        type: 'Field',
        options: {
          inputMeta: {
            name: 'optedScopes.openid',
            type: 'boolean',
            required: true,
            visible: true,
            mutable: false,
            // TODO: OKTA-598870 Input value type does not specify boolean as an option
            value: true,
          } as unknown as Input,
        },
      } as FieldElement,
      {
        type: 'Field',
        options: {
          inputMeta: {
            name: 'optedScopes.custom.custom1',
            label: 'Custom 1 label',
            // TODO: OKTA-598864 Input type is missing desc as a property
            desc: 'This is a custom description for the custom field.',
            type: 'boolean',
            required: true,
            visible: true,
            mutable: true,
            // TODO: OKTA-598870 Input value type does not specify boolean as an option
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
            // TODO: OKTA-598864 Input type is missing desc as a property
            desc: 'This is a custom description for the custom 2 field.',
            type: 'boolean',
            required: true,
            visible: true,
            mutable: true,
            // TODO: OKTA-598870 Input value type does not specify boolean as an option
            value: true,
          } as unknown as Input,
        },
      } as FieldElement,
      {
        type: 'Field',
        options: {
          inputMeta: {
            name: 'optedScopes.profile',
            label: 'Label for profile field',
            // TODO: OKTA-598864 Input type is missing desc as a property
            desc: 'This is a description for the profile field.',
            type: 'boolean',
            required: true,
            visible: true,
            mutable: false,
            // TODO: OKTA-598870 Input value type does not specify boolean as an option
            value: true,
          } as unknown as Input,
        },
      } as FieldElement,
    ];
  });

  it('should reorder existing field elements and add additional granular consent elements to formbag', () => {
    const updatedFormBag = transformGranularConsent({ transaction, widgetProps, formBag });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(9);
    expect((updatedFormBag.uischema.elements[0] as DescriptionElement).options.content)
      .toBe('oie.consent.scopes.granular.description');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.inputMeta.name)
      .toBe('optedScopes.custom.custom1');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).options.inputMeta.name)
      .toBe('optedScopes.custom.custom2');
    expect((updatedFormBag.uischema.elements[3] as FieldElement).options.inputMeta.name)
      .toBe('optedScopes.openid');
    expect((updatedFormBag.uischema.elements[4] as FieldElement).options.inputMeta.name)
      .toBe('optedScopes.profile');
    expect((updatedFormBag.uischema.elements[5] as LinkElement).options.label)
      .toBe('consent.required.termsOfService');
    expect((updatedFormBag.uischema.elements[6] as LinkElement).options.label)
      .toBe('consent.required.privacyPolicy');
    expect((updatedFormBag.uischema.elements[7] as ButtonElement).label)
      .toBe('consent.required.consentButton');
    expect((updatedFormBag.uischema.elements[8] as ButtonElement).label)
      .toBe('oform.cancel');
  });

  it('should not reorder existing field elements when all are mutable and should add additional granular consent elements to formbag', () => {
    formBag.uischema.elements = [
      {
        type: 'Field',
        options: {
          inputMeta: {
            name: 'optedScopes.custom.custom1',
            label: 'Custom 1 label',
            // TODO: OKTA-598864 Input type is missing desc as a property
            desc: 'This is a custom description for the custom field.',
            type: 'boolean',
            required: true,
            visible: true,
            mutable: true,
            // TODO: OKTA-598870 Input value type does not specify boolean as an option
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
            // TODO: OKTA-598864 Input type is missing desc as a property
            desc: 'This is a custom description for the custom 2 field.',
            type: 'boolean',
            required: true,
            visible: true,
            mutable: true,
            // TODO: OKTA-598870 Input value type does not specify boolean as an option
            value: true,
          } as unknown as Input,
        },
      } as FieldElement,
    ];

    const updatedFormBag = transformGranularConsent({ transaction, widgetProps, formBag });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(7);
    expect((updatedFormBag.uischema.elements[0] as DescriptionElement).options.content)
      .toBe('oie.consent.scopes.granular.description');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.inputMeta.name)
      .toBe('optedScopes.custom.custom1');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).options.inputMeta.name)
      .toBe('optedScopes.custom.custom2');
    expect((updatedFormBag.uischema.elements[3] as LinkElement).options.label)
      .toBe('consent.required.termsOfService');
    expect((updatedFormBag.uischema.elements[4] as LinkElement).options.label)
      .toBe('consent.required.privacyPolicy');
    expect((updatedFormBag.uischema.elements[5] as ButtonElement).label)
      .toBe('consent.required.consentButton');
    expect((updatedFormBag.uischema.elements[6] as ButtonElement).label)
      .toBe('oform.cancel');
  });

  it('should not add privacy policy or terms of service links when they do not exist in transaction', () => {
    // @ts-expect-error OKTA-598868 app is missing from rawIdxState type
    transaction.rawIdxState.app = {
      type: 'object',
      value: {
        label: 'Native client',
        id: 'abcd1234',
        termsOfService: {},
        privacyPolicy: {},
        logo: { alt: 'Logo for the app' },
        clientUri: { href: 'https://okta1.acme.com' },
      },
    };

    const updatedFormBag = transformGranularConsent({ transaction, widgetProps, formBag });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(7);
    expect((updatedFormBag.uischema.elements[0] as DescriptionElement).options.content)
      .toBe('oie.consent.scopes.granular.description');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.inputMeta.name)
      .toBe('optedScopes.custom.custom1');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).options.inputMeta.name)
      .toBe('optedScopes.custom.custom2');
    expect((updatedFormBag.uischema.elements[3] as FieldElement).options.inputMeta.name)
      .toBe('optedScopes.openid');
    expect((updatedFormBag.uischema.elements[4] as FieldElement).options.inputMeta.name)
      .toBe('optedScopes.profile');
    expect((updatedFormBag.uischema.elements[5] as ButtonElement).label)
      .toBe('consent.required.consentButton');
    expect((updatedFormBag.uischema.elements[6] as ButtonElement).label)
      .toBe('oform.cancel');
  });
});
