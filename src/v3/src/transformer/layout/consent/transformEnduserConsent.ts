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

import { doesI18NKeyExist } from '../../../../../v2/ion/i18nUtils';
import {
  ButtonElement,
  ButtonType,
  ConsentScope,
  DescriptionElement,
  FieldElement,
  IdxStepTransformer,
  LinkElement,
} from '../../../types';
import { loc } from '../../../util';
import { removeUIElementWithName } from '../../utils';

export const transformEnduserConsent: IdxStepTransformer = ({ transaction, formBag }) => {
  const { uischema, data } = formBag;
  const {
    // @ts-expect-error OKTA-598868 app is missing from rawIdxState type
    rawIdxState: { app },
    nextStep: {
      name: stepName,
      // @ts-expect-error OKTA-599472 scopes array missing from NextStep type
      scopes,
    } = {},
  } = transaction;

  if (typeof stepName === 'undefined') {
    return formBag;
  }

  uischema.elements = removeUIElementWithName('consent', uischema.elements);

  const descriptionEle: DescriptionElement = {
    type: 'Description',
    noMargin: true,
    contentType: 'subtitle',
    options: {
      content: loc('oie.consent.scopes.granular.description', 'login'),
      dataSe: 'consent-description',
    },
  };
  uischema.elements.push(descriptionEle);

  if (Array.isArray(scopes)) {
    uischema.elements.push(...(scopes?.map((scope: ConsentScope) => {
      const labelI18nKey = `consent.scopes.${scope.name}.label`;
      const descrI18nKey = `consent.scopes.${scope.name}.desc`;
      const isPredefinedLabel = doesI18NKeyExist(labelI18nKey);
      const label = isPredefinedLabel ? loc(labelI18nKey, 'login') : scope.label;
      const description = doesI18NKeyExist(descrI18nKey)
        ? loc(descrI18nKey, 'login')
        : scope.desc;
      const fieldName = `consent.scopes.${scope.name}`;
      data[fieldName] = true;
      return {
        type: 'Field',
        key: fieldName,
        translations: [
          {
            name: 'label',
            i18nKey: labelI18nKey,
            value: label,
            noTranslate: !isPredefinedLabel,
          },
          {
            name: 'description',
            i18nKey: descrI18nKey,
            value: description,
            noTranslate: !isPredefinedLabel,
          },
        ],
        options: {
          inputMeta: {
            name: fieldName,
            type: 'boolean',
            mutable: false,
          },
        },
      } as FieldElement;
    })));
  }

  const termsOfServiceHref = app?.value?.termsOfService
    && (app.value.termsOfService as Record<string, string>).href;
  if (termsOfServiceHref) {
    const tosLink: LinkElement = {
      type: 'Link',
      options: {
        label: loc('consent.required.termsOfService', 'login'),
        href: termsOfServiceHref,
        dataSe: 'terms-of-service',
        target: '_blank',
        step: '',
      },
    };
    uischema.elements.push(tosLink);
  }

  const privacyPolicyHref = app?.value?.privacyPolicy
    && (app.value.privacyPolicy as Record<string, string>).href;
  if (privacyPolicyHref) {
    const privacyPolicyLink: LinkElement = {
      type: 'Link',
      options: {
        label: loc('consent.required.privacyPolicy', 'login'),
        href: privacyPolicyHref,
        dataSe: 'privacy-policy',
        target: '_blank',
        step: '',
      },
    };
    uischema.elements.push(privacyPolicyLink);
  }

  const submitButton: ButtonElement = {
    type: 'Button',
    label: loc('consent.required.consentButton', 'login'),
    options: {
      type: ButtonType.BUTTON,
      includeData: false,
      actionParams: { consent: true },
      step: stepName,
      dataType: 'save',
      variant: 'secondary',
    },
  };

  const cancelButton: ButtonElement = {
    type: 'Button',
    label: loc('oform.cancel', 'login'),
    options: {
      type: ButtonType.BUTTON,
      includeData: false,
      actionParams: { consent: false },
      step: stepName,
      dataType: 'cancel',
      variant: 'secondary',
    },
  };

  uischema.elements.push(submitButton);
  uischema.elements.push(cancelButton);

  return formBag;
};
