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

import { AUTHENTICATOR_KEY } from '../../constants';
import {
  ButtonElement,
  ButtonType,
  IdxStepTransformer,
  TitleElement,
} from '../../types';
import { getAuthenticatorKey, getDisplayName, loc } from '../../util';

export const transformOktaVerifyCustomAppResendPush: IdxStepTransformer = ({
  formBag,
  transaction,
}) => {
  const { uischema } = formBag;
  const isOV = getAuthenticatorKey(transaction) === AUTHENTICATOR_KEY.OV;

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: isOV
        ? loc('oie.okta_verify.push.title', 'login')
        : loc('oie.verify.custom_app.title', 'login', [getDisplayName(transaction)]),
    },
  };

  const buttonElement: ButtonElement = {
    type: 'Button',
    label: isOV
      ? loc('oie.okta_verify.push.resend', 'login')
      : loc('oie.custom_app.push.resend', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      step: transaction.nextStep!.name,
    },
  };

  uischema.elements.unshift(titleElement);
  uischema.elements.push(buttonElement);

  return formBag;
};
