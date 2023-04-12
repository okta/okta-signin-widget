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
  IdxStepTransformer,
  LinkElement,
} from '../../../types';
import { loc } from '../../../util';
import { removeUIElementWithName } from '../../utils';
import { buildScopeElements } from './buildScopeElements';

export const transformEnduserConsent: IdxStepTransformer = ({ transaction, formBag }) => {
  const { uischema } = formBag;
  const {
    // @ts-expect-error OKTA-598868 app is missing from rawIdxState type
    rawIdxState: { app },
    nextStep: {
      name: stepName,
      // @ts-expect-error OKTA-599472 scopes array missing from NextStep type
      scopes,
    } = {},
  } = transaction;

  uischema.elements = removeUIElementWithName('consent', uischema.elements);

  const scopeElements = buildScopeElements(scopes);
  if (scopeElements) {
    uischema.elements.push(...scopeElements);
  }

  const descriptionEle: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    noMargin: true,
    options: {
      content: loc('consent.required.description', 'login'),
      dataSe: 'consent-description',
    },
  };

  uischema.elements.push(descriptionEle);

  const termsOfServiceHref = app?.value?.termsOfService
    && (app.value.termsOfService as Record<string, Record<string, unknown>>).href;
  if (termsOfServiceHref) {
    const tosLink: LinkElement = {
      type: 'Link',
      options: {
        label: loc('consent.required.termsOfService', 'login'),
        href: termsOfServiceHref as string,
        dataSe: 'terms-of-service',
        target: '_blank',
        step: '',
      },
    };
    uischema.elements.push(tosLink);
  }

  const privacyPolicyHref = app?.value?.privacyPolicy
    && (app.value.privacyPolicy as Record<string, Record<string, unknown>>).href;
  if (privacyPolicyHref) {
    const privacyPolicyLink: LinkElement = {
      type: 'Link',
      options: {
        label: loc('consent.required.privacyPolicy', 'login'),
        href: privacyPolicyHref as string,
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
      step: stepName!,
      dataType: 'save',
      variant: 'secondary',
    },
  };

  const cancelButton: ButtonElement = {
    type: 'Button',
    label: loc('consent.required.cancelButton', 'login'),
    options: {
      type: ButtonType.BUTTON,
      includeData: false,
      actionParams: { consent: false },
      step: stepName!,
      dataType: 'cancel',
      variant: 'secondary',
    },
  };

  uischema.elements.push(submitButton);
  uischema.elements.push(cancelButton);

  return formBag;
};
