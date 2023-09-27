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

import { IdxFeature } from '@okta/okta-auth-js';

import { STEPS_REQUIRING_UNLOCK_ACCOUNT_LINK } from '../../constants';
import {
  LinkElement,
  TransformStepFnWithOptions,
} from '../../types';
import { getUnlockAccountUri, isConfigRecoverFlow, loc } from '../../util';

export const transformUnlockAccountButton: TransformStepFnWithOptions = ({
  transaction,
  widgetProps,
}) => (
  formbag,
) => {
  const { availableSteps, enabledFeatures } = transaction;
  const shouldAddDefaultButton = enabledFeatures?.includes(IdxFeature.ACCOUNT_UNLOCK)
    && availableSteps?.some((s) => STEPS_REQUIRING_UNLOCK_ACCOUNT_LINK.includes(s.name));
  const unlockStep = availableSteps?.find(
    ({ name }) => name === 'unlock-account',
  );

  // TODO
  // OKTA-651781
  // when flow param is set to resetPassword, the identify page is redressed as identify-recovery page
  // so this link needs to be hidden
  if (isConfigRecoverFlow(widgetProps.flow)) {
    return formbag;
  }

  if (!shouldAddDefaultButton || typeof unlockStep === 'undefined') {
    return formbag;
  }

  const unlockLink: LinkElement = {
    type: 'Link',
    contentType: 'footer',
    options: {
      label: loc('unlockaccount', 'login'),
      step: unlockStep.name,
      dataSe: 'unlock',
    },
  };
  const unlockAccountUri = getUnlockAccountUri(widgetProps);
  if (unlockAccountUri) {
    unlockLink.options.href = unlockAccountUri;
  }
  formbag.uischema.elements.push(unlockLink);

  return formbag;
};
