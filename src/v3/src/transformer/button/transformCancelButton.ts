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
  LinkElement,
  TransformStepFnWithOptions,
} from '../../types';
import {
  getAuthenticatorKey, getBackToSignInUri, loc, shouldShowCancelLink,
} from '../../util';
import TransformerMap from '../layout/idxTransformerMapping';

export const transformCancelButton: TransformStepFnWithOptions = ({
  transaction,
  step,
  widgetProps,
}) => (
  formbag,
) => {
  const authenticatorKey = getAuthenticatorKey(transaction) ?? AUTHENTICATOR_KEY.DEFAULT;
  const customTransformer = TransformerMap[step]?.[authenticatorKey];
  const shouldAddDefaultButton = customTransformer?.buttonConfig?.showDefaultCancel ?? true;
  const cancelStep = transaction.availableSteps?.find(({ name }) => name === 'cancel');
  if (!shouldAddDefaultButton || typeof cancelStep === 'undefined' || !shouldShowCancelLink(widgetProps?.features)) {
    return formbag;
  }

  const cancelLink: LinkElement = {
    type: 'Link',
    contentType: 'footer',
    options: {
      label: loc('goback', 'login'),
      isActionStep: true,
      step: cancelStep.name,
      dataSe: 'cancel',
    },
  };
  const backToSigninUri = getBackToSignInUri(widgetProps);
  if (backToSigninUri) {
    cancelLink.options.href = backToSigninUri;
  }

  formbag.uischema.elements.push(cancelLink);

  return formbag;
};
