/*
 * Copyright (c) 2022-present, Okta, Inc. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant
 * to the Apache License, Version 2.0 (the "License.")
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { IdxFeature } from '@okta/okta-auth-js';

import { IDX_STEP } from '../../constants';
import {
  LinkElement,
  TransformStepFnWithOptions,
} from '../../types';
import { loc } from '../../util';

export const transformUnlockAccountButton: TransformStepFnWithOptions = ({
  transaction,
}) => (
  formbag,
) => {
  const { availableSteps, enabledFeatures } = transaction;
  const hasIdentityStep = availableSteps?.some((s) => s.name === IDX_STEP.IDENTIFY);
  const shouldAddDefaultButton = enabledFeatures?.includes(IdxFeature.ACCOUNT_UNLOCK)
    && hasIdentityStep;
  const unlockStep = availableSteps?.find(
    ({ name }) => name === 'unlock-account',
  );
  if (!shouldAddDefaultButton || typeof unlockStep === 'undefined') {
    return formbag;
  }

  const unlockLink: LinkElement = {
    type: 'Link',
    contentType: 'footer',
    options: {
      label: loc('unlockaccount', 'login'),
      step: unlockStep.name,
    },
  };
  formbag.uischema.elements.push(unlockLink);

  return formbag;
};
