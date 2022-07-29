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

import { AUTHENTICATOR_KEY, IDX_STEP } from '../../constants';
import { TransformStepFnWithOptions } from '../../types';
import { getAuthenticatorKey, hasMinAuthenticatorOptions } from '../../util';
import TransformerMap from '../layout/idxTransformerMapping';
import { getButtonControls } from './getButtonControls';

export const transformButtons: TransformStepFnWithOptions = (options) => (formbag) => {
  const { transaction, step, widgetProps } = options;
  const { availableSteps, enabledFeatures } = transaction;

  const hasIdentityStep = availableSteps?.some((s) => s.name === IDX_STEP.IDENTIFY);
  const stepWithRegister = enabledFeatures?.includes(IdxFeature.REGISTRATION) && hasIdentityStep;
  const stepWithUnlockAccount = enabledFeatures?.includes(IdxFeature.ACCOUNT_UNLOCK)
    && hasIdentityStep;
  const verifyWithOther = hasMinAuthenticatorOptions(
    transaction,
    IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE,
    1, // Min # of auth options for link to display
  );
  const backToAuthList = hasMinAuthenticatorOptions(
    transaction,
    IDX_STEP.SELECT_AUTHENTICATOR_ENROLL,
    0, // Min # of auth options for link to display
  );

  const authenticatorKey = getAuthenticatorKey(transaction) ?? AUTHENTICATOR_KEY.DEFAULT;
  const customTransformer = TransformerMap[step]?.[authenticatorKey];

  const { elements } = getButtonControls(
    transaction,
    {
      stepWithSubmit: customTransformer?.buttonConfig?.showDefaultSubmit ?? true,
      stepWithCancel: customTransformer?.buttonConfig?.showDefaultCancel ?? true,
      stepWithRegister,
      stepWithForgotPassword: customTransformer?.buttonConfig?.showForgotPassword ?? false,
      stepWithUnlockAccount,
      backToAuthList,
      verifyWithOther,
      // TODO: This was added as a workaround for OKTA-512706
      proceed: widgetProps.authClient?.idx.proceed,
    },
  );

  formbag.uischema.elements.push(...elements);

  return formbag;
};
