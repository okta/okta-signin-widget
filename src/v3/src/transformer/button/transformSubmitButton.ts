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
  TransformStepFnWithOptions,
} from '../../types';
import { getAuthenticatorKey, loc } from '../../util';
import TransformerMap from '../layout/idxTransformerMapping';

export const transformSubmitButton: TransformStepFnWithOptions = ({
  transaction,
  step,
}) => (
  formbag,
) => {
  const authenticatorKey = getAuthenticatorKey(transaction) ?? AUTHENTICATOR_KEY.DEFAULT;
  const customTransformer = TransformerMap[step]?.[authenticatorKey];
  const shouldAddDefaultButton = customTransformer?.buttonConfig?.showDefaultSubmit ?? true;
  if (!shouldAddDefaultButton) {
    return formbag;
  }

  const submit: ButtonElement = {
    type: 'Button',
    label: loc('oform.next', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      step: transaction.nextStep!.name,
    },
  };

  formbag.uischema.elements.push(submit);

  return formbag;
};
