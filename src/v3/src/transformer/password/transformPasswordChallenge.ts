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
  HiddenInputElement,
  IdxStepTransformer,
  TitleElement,
} from '../../types';
import { getUserInfo, isConfigRecoverFlow, loc } from '../../util';
import { removeUIElementWithName } from '../utils';

export const transformPasswordChallenge: IdxStepTransformer = ({
  formBag,
  transaction,
  widgetProps,
}) => {
  const { uischema } = formBag;

  // TODO
  // OKTA-651781
  // when flow param is set to resetPassword and there is an api error (eg. not allowed to reset),
  // the error will show on the Verify with password challenge page and stop the flow.  So we need to hide this input
  if (isConfigRecoverFlow(widgetProps.flow)) {
    uischema.elements = removeUIElementWithName('credentials.passcode', uischema.elements);
    return formBag;
  }

  const titleElement: TitleElement = {
    type: 'Title',
    options: { content: loc('oie.password.challenge.title', 'login') },
  };

  const submitBtnElement: ButtonElement = {
    type: 'Button',
    label: loc('mfa.challenge.verify', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      step: transaction.nextStep!.name,
    },
  };

  const userInfo = getUserInfo(transaction);
  uischema.elements.unshift({
    type: 'HiddenInput',
    noMargin: true,
    options: { name: 'username', value: userInfo.identifier },
  } as HiddenInputElement);
  uischema.elements.unshift(titleElement);
  uischema.elements.push(submitBtnElement);

  return formBag;
};
