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
  ButtonElement,
  DescriptionElement,
  FieldElement,
  FormBag,
  HeadingElement,
  WidgetProps,
} from '../../../types';
import { transformAdminConsent } from './transformAdminConsent';

describe('transformAdminConsent tests', () => {
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
      name: 'admin-consent',
      // @ts-expect-error OKTA-599472 scopes array missing from NextStep type
      scopes: [
        {
          name: 'okta.clients.manage',
          label: 'okta.clients.manage',
          value: 'okta.clients.manage',
          desc: 'Allows the app to manage clients in your Okta organization.',
        },
        {
          name: 'okta.authenticators.manage',
          label: 'okta.authenticators.manage',
          value: 'okta.authenticators.manage',
          desc: 'Allows the app to manage all authenticators (e.g. enrollments, reset).',
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
      name: 'admin-consent',
    };

    const updatedFormBag = transformAdminConsent({ formBag, transaction, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect((updatedFormBag.uischema.elements[0] as DescriptionElement).options.content)
      .toBe('oie.consent.scopes.granular.description');
    expect((updatedFormBag.uischema.elements[1] as ButtonElement).label)
      .toBe('consent.required.consentButton');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).label)
      .toBe('oform.cancel');
  });

  it('should add non-customized scope elements to formbag', () => {
    const updatedFormBag = transformAdminConsent({ formBag, transaction, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(6);
    expect((updatedFormBag.uischema.elements[0] as DescriptionElement).options.content)
      .toBe('oie.consent.scopes.granular.description');
    expect((updatedFormBag.uischema.elements[1] as HeadingElement).options.content)
      .toBe('admin.consent.group.resource.policy');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).options.inputMeta.type)
      .toBe('boolean');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).translations)
      .toEqual([
        {
          name: 'label',
          i18nKey: 'consent.scopes.okta.clients.manage.label',
          value: 'okta.clients.manage',
          noTranslate: true,
        },
        {
          name: 'description',
          i18nKey: 'consent.scopes.okta.clients.manage.desc',
          value: 'consent.scopes.okta.clients.manage.desc',
          noTranslate: false,
        },
      ]);
    expect((updatedFormBag.uischema.elements[3] as FieldElement).options.inputMeta.type)
      .toBe('boolean');
    expect((updatedFormBag.uischema.elements[3] as FieldElement).translations)
      .toEqual([
        {
          name: 'label',
          i18nKey: 'consent.scopes.okta.authenticators.manage.label',
          value: 'okta.authenticators.manage',
          noTranslate: true,
        },
        {
          name: 'description',
          i18nKey: 'consent.scopes.okta.authenticators.manage.desc',
          value: 'consent.scopes.okta.authenticators.manage.desc',
          noTranslate: false,
        },
      ]);
    expect((updatedFormBag.uischema.elements[4] as ButtonElement).label)
      .toBe('consent.required.consentButton');
    expect((updatedFormBag.uischema.elements[5] as ButtonElement).label)
      .toBe('oform.cancel');
  });

  it('should add customized scope elements to formbag', () => {
    transaction.nextStep = {
      name: 'admin-consent',
      // @ts-expect-error OKTA-599472 scopes array missing from NextStep type
      scopes: [
        {
          name: 'okta.clients.manage',
          label: 'okta.clients.manage',
          value: 'okta.clients.manage',
          desc: 'Allows the app to manage clients in your Okta organization.',
        },
        {
          name: 'okta.authenticators.manage',
          label: 'okta.authenticators.manage',
          value: 'okta.authenticators.manage',
          desc: 'Allows the app to manage all authenticators (e.g. enrollments, reset).',
        },
        {
          name: 'custom1.custom2.custom3',
          label: 'custom1.custom2.custom3',
          value: 'custom1.custom2.custom3',
          desc: 'This will allow the app to view your custom info',
        },
        {
          name: 'custom4.custom5.custom6',
          label: 'custom4.custom5.custom6',
          value: 'custom4.custom5.custom6',
        },
      ],
    };
    const updatedFormBag = transformAdminConsent({ formBag, transaction, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(9);
    expect((updatedFormBag.uischema.elements[0] as DescriptionElement).options.content)
      .toBe('oie.consent.scopes.granular.description');
    expect((updatedFormBag.uischema.elements[1] as HeadingElement).options.content)
      .toBe('admin.consent.group.resource.policy');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).options.inputMeta.type)
      .toBe('boolean');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).translations)
      .toEqual([
        {
          name: 'label',
          i18nKey: 'consent.scopes.okta.clients.manage.label',
          value: 'okta.clients.manage',
          noTranslate: true,
        },
        {
          name: 'description',
          i18nKey: 'consent.scopes.okta.clients.manage.desc',
          value: 'consent.scopes.okta.clients.manage.desc',
          noTranslate: false,
        },
      ]);
    expect((updatedFormBag.uischema.elements[3] as FieldElement).options.inputMeta.type)
      .toBe('boolean');
    expect((updatedFormBag.uischema.elements[3] as FieldElement).translations)
      .toEqual([
        {
          name: 'label',
          i18nKey: 'consent.scopes.okta.authenticators.manage.label',
          value: 'okta.authenticators.manage',
          noTranslate: true,
        },
        {
          name: 'description',
          i18nKey: 'consent.scopes.okta.authenticators.manage.desc',
          value: 'consent.scopes.okta.authenticators.manage.desc',
          noTranslate: false,
        },
      ]);
    expect((updatedFormBag.uischema.elements[4] as HeadingElement).options.content)
      .toBe('admin.consent.group.system');
    expect((updatedFormBag.uischema.elements[5] as FieldElement).options.inputMeta.type)
      .toBe('boolean');
    expect((updatedFormBag.uischema.elements[5] as FieldElement).translations)
      .toEqual([
        {
          name: 'label',
          i18nKey: 'consent.scopes.custom1.custom2.custom3.label',
          value: 'custom1.custom2.custom3',
          noTranslate: true,
        },
        {
          name: 'description',
          i18nKey: 'consent.scopes.custom1.custom2.custom3.desc',
          value: 'This will allow the app to view your custom info',
          noTranslate: true,
        },
      ]);
    expect((updatedFormBag.uischema.elements[6] as FieldElement).options.inputMeta.type)
      .toBe('boolean');
    expect((updatedFormBag.uischema.elements[6] as FieldElement).translations)
      .toEqual([
        {
          name: 'label',
          i18nKey: 'consent.scopes.custom4.custom5.custom6.label',
          value: 'custom4.custom5.custom6',
          noTranslate: true,
        },
        {
          name: 'description',
          i18nKey: 'consent.scopes.custom4.custom5.custom6.desc',
          value: undefined,
          noTranslate: true,
        },
      ]);
    expect((updatedFormBag.uischema.elements[7] as ButtonElement).label)
      .toBe('consent.required.consentButton');
    expect((updatedFormBag.uischema.elements[8] as ButtonElement).label)
      .toBe('oform.cancel');
  });
});
