/*
 * Copyright (c) 2023-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { IDX_STEP, ON_PREM_TOKEN_CHANGE_ERROR_KEY } from '../../../constants';
import {
  ButtonElement, ButtonType, FieldElement, IdxStepTransformer, TitleElement,
} from '../../../types';
import { containsMessageKey, getDisplayName, loc } from '../../../util';
import { getUIElementWithName } from '../../utils';

export const transformRSAAuthenticator: IdxStepTransformer = ({ transaction, formBag }) => {
  const { uischema, data } = formBag;
  const { nextStep: { name: stepName = '' } = {}, messages } = transaction;

  const userNameField = getUIElementWithName('credentials.clientData', uischema.elements);
  if (userNameField) {
    data['credentials.clientData'] = (userNameField as FieldElement).options.inputMeta.value as string;
    userNameField.dir = 'ltr';
  }

  if (containsMessageKey(ON_PREM_TOKEN_CHANGE_ERROR_KEY, messages)) {
    data['credentials.passcode'] = '';
  }

  const authenticatorVendorName = getDisplayName(transaction)
    || loc('oie.on_prem.authenticator.default.vendorName', 'login');
  const titleI18nKey = stepName === IDX_STEP.CHALLENGE_AUTHENTICATOR
    ? 'oie.on_prem.verify.title'
    : 'oie.on_prem.enroll.title';
  const titleElement: TitleElement = {
    type: 'Title',
    options: { content: loc(titleI18nKey, 'login', [authenticatorVendorName]) },
  };

  const submitButton: ButtonElement = {
    type: 'Button',
    label: loc('mfa.challenge.verify', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      step: stepName,
    },
  };

  uischema.elements.unshift(titleElement);
  uischema.elements.push(submitButton);

  return formBag;
};
