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
import {
  ButtonElement, DescriptionElement, FieldElement, FormBag, LinkElement, WidgetProps,
} from 'src/types';

import { getStubFormBag, getStubTransactionWithNextStep } from '../../../mocks/utils/utils';
import { transformEnduserConsent } from './transformEnduserConsent';

describe('transformEnduserConsent tests', () => {
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
    transaction.nextStep = {
      name: 'enduser-consent',
      // @ts-expect-error OKTA-599472 scopes array missing from NextStep type
      scopes: [
        {
          name: 'email',
          label: 'View your email',
          value: 'email',
          desc: 'This will allow the app to view your email',
        },
        {
          name: 'phone',
          label: 'View your phone',
          value: 'phone',
          desc: 'This will allow the app to view your phone number',
        },
      ],
    };

    formBag.uischema.elements = [
      {
        type: 'Field',
        options: {
          inputMeta: {
            name: 'consent',
            type: 'boolean',
            required: true,
          } as Input,
        },
      } as FieldElement,
    ];
  });

  it('should not add scopes when none exist in the transaction', () => {
    transaction.nextStep = {
      name: 'enduser-consent',
    };

    const updatedFormBag = transformEnduserConsent({ formBag, transaction, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(5);
    expect((updatedFormBag.uischema.elements[0] as DescriptionElement).options.content)
      .toBe('oie.consent.scopes.granular.description');
    expect((updatedFormBag.uischema.elements[1] as LinkElement).options.label)
      .toBe('consent.required.termsOfService');
    expect((updatedFormBag.uischema.elements[2] as LinkElement).options.label)
      .toBe('consent.required.privacyPolicy');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).label)
      .toBe('consent.required.consentButton');
    expect((updatedFormBag.uischema.elements[4] as ButtonElement).label)
      .toBe('oform.cancel');
  });

  it('should add non-customized scope elements to formbag', () => {
    const updatedFormBag = transformEnduserConsent({ formBag, transaction, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(7);
    expect((updatedFormBag.uischema.elements[0] as DescriptionElement).options.content)
      .toBe('oie.consent.scopes.granular.description');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).translations)
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
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.inputMeta.mutable)
      .toBe(false);
    expect((updatedFormBag.uischema.elements[2] as FieldElement).translations)
      .toEqual([
        {
          name: 'label',
          i18nKey: 'consent.scopes.phone.label',
          value: 'consent.scopes.phone.label',
          noTranslate: false,
        },
        {
          name: 'description',
          i18nKey: 'consent.scopes.phone.desc',
          value: 'consent.scopes.phone.desc',
          noTranslate: false,
        },
      ]);
    expect((updatedFormBag.uischema.elements[2] as FieldElement).options.inputMeta.mutable)
      .toBe(false);
    expect((updatedFormBag.uischema.elements[3] as LinkElement).options.label)
      .toBe('consent.required.termsOfService');
    expect((updatedFormBag.uischema.elements[4] as LinkElement).options.label)
      .toBe('consent.required.privacyPolicy');
    expect((updatedFormBag.uischema.elements[5] as ButtonElement).label)
      .toBe('consent.required.consentButton');
    expect((updatedFormBag.uischema.elements[6] as ButtonElement).label)
      .toBe('oform.cancel');
  });

  it('should add customized scope elements to formbag', () => {
    transaction.nextStep = {
      name: 'enduser-consent',
      // @ts-expect-error OKTA-599472 scopes array missing from NextStep type
      scopes: [
        {
          name: 'custom1',
          label: 'View your custom info',
          value: 'custom1',
          desc: 'This will allow the app to view your custom info',
        },
        {
          name: 'custom2',
          label: 'View your custom 2',
          value: 'custom2',
        },
      ],
    };
    const updatedFormBag = transformEnduserConsent({ formBag, transaction, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(7);
    expect((updatedFormBag.uischema.elements[0] as DescriptionElement).options.content)
      .toBe('oie.consent.scopes.granular.description');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).translations)
      .toEqual([
        {
          name: 'label',
          i18nKey: 'consent.scopes.custom1.label',
          value: 'View your custom info',
          noTranslate: true,
        },
        {
          name: 'description',
          i18nKey: 'consent.scopes.custom1.desc',
          value: 'This will allow the app to view your custom info',
          noTranslate: true,
        },
      ]);
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.inputMeta.mutable)
      .toBe(false);
    expect((updatedFormBag.uischema.elements[2] as FieldElement).translations)
      .toEqual([
        {
          name: 'label',
          i18nKey: 'consent.scopes.custom2.label',
          value: 'View your custom 2',
          noTranslate: true,
        },
        {
          name: 'description',
          i18nKey: 'consent.scopes.custom2.desc',
          value: undefined,
          noTranslate: true,
        },
      ]);
    expect((updatedFormBag.uischema.elements[2] as FieldElement).options.inputMeta.mutable)
      .toBe(false);
    expect((updatedFormBag.uischema.elements[3] as LinkElement).options.label)
      .toBe('consent.required.termsOfService');
    expect((updatedFormBag.uischema.elements[4] as LinkElement).options.label)
      .toBe('consent.required.privacyPolicy');
    expect((updatedFormBag.uischema.elements[5] as ButtonElement).label)
      .toBe('consent.required.consentButton');
    expect((updatedFormBag.uischema.elements[6] as ButtonElement).label)
      .toBe('oform.cancel');
  });
});
