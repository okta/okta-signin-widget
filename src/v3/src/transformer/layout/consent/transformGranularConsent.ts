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

import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  FieldElement,
  IdxStepTransformer,
  LinkElement,
} from '../../../types';
import { loc } from '../../../util';

export const transformGranularConsent: IdxStepTransformer = ({ transaction, formBag }) => {
  const { uischema } = formBag;
  const {
    // @ts-expect-error OKTA-598868 app is missing from rawIdxState type
    rawIdxState: { app },
    nextStep: { name: stepName } = {},
  } = transaction;

  if (typeof stepName === 'undefined') {
    return formBag;
  }

  // sorting field elements to display mutuable items first.
  uischema.elements.sort((a, b) => {
    if (a.type !== 'Field' || b.type !== 'Field') {
      return 0;
    }
    const aField = a as FieldElement;
    const bField = b as FieldElement;
    if (aField.options.inputMeta.mutable === true && bField.options.inputMeta.mutable === false) {
      return -1;
    }
    return 1;
  });

  const descriptionEle: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    noMargin: true,
    options: {
      content: loc('oie.consent.scopes.granular.description', 'login'),
      dataSe: 'consent-description',
    },
  };

  uischema.elements.unshift(descriptionEle);

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
      includeData: true,
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
      includeData: true,
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
