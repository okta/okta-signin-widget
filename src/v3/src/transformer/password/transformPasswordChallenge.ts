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
  FieldElement,
  IdxStepTransformer,
  TitleElement,
} from '../../types';
import { loc } from '../../util';
import { isCustomizedI18nKey } from '../i18nTransformer';
import { getUIElementWithName } from '../utils';

export const transformPasswordChallenge: IdxStepTransformer = ({
  formBag,
  transaction,
  widgetProps,
}) => {
  const { uischema } = formBag;

  const passcodeEle = getUIElementWithName(
    'credentials.passcode',
    uischema.elements,
  ) as FieldElement;
  if (passcodeEle && isCustomizedI18nKey('primaryauth.password.tooltip', widgetProps)) {
    passcodeEle.options.hint = loc('primaryauth.password.tooltip', 'login');
  }

  const titleElement: TitleElement = {
    type: 'Title',
    options: { content: loc('oie.password.challenge.title', 'login') },
  };

  const submitBtnElement: ButtonElement = {
    type: 'Button',
    label: loc('mfa.challenge.verify', 'login'),
    scope: `#/properties/${ButtonType.SUBMIT}`,
    options: {
      type: ButtonType.SUBMIT,
      step: transaction.nextStep!.name,
    },
  };

  uischema.elements.unshift(titleElement);
  uischema.elements.push(submitBtnElement);

  return formBag;
};
