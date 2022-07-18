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
import { FormBag, IdxTransactionWithNextStep, WidgetProps } from 'src/types';

import { AUTHENTICATOR_KEY, IDX_STEP, STEPS_MISSING_RELATES_TO } from '../constants';
import { hasMinAuthenticatorOptions } from '../util';
import { transformInputs } from './field';
import { getButtonControls } from './getButtonControls';
import TransformerMap from './idxTransformerMapping';
import { transformCustomMessages } from './messages/transformCustomMessages';
import { remediationContainsStep } from './utils';

export default (transaction: IdxTransactionWithNextStep, widgetProps: WidgetProps): FormBag => {
  const { nextStep, context } = transaction;

  const enabledFeatures = transaction?.enabledFeatures;
  const { name: stepName } = nextStep;

  const formBag = transformInputs(transaction);

  const authenticatorKey = (STEPS_MISSING_RELATES_TO.includes(stepName)
    // TODO: OKTA-503490 temporary sln to grab auth key for enroll-poll step its missing relatesTo obj
    ? context.currentAuthenticator?.value?.key
    : nextStep?.relatesTo?.value?.key) ?? AUTHENTICATOR_KEY.DEFAULT;
  const customTransformer = TransformerMap[stepName]?.[authenticatorKey];
  const updatedFormBag = customTransformer?.transform?.(transaction, formBag, widgetProps)
    ?? formBag;

  const isIdentityStep = remediationContainsStep(transaction.neededToProceed, IDX_STEP.IDENTIFY);
  // TODO: Remove buttons from here and add to custom transformers - OKTA-479077
  const stepWithRegister = enabledFeatures?.includes(IdxFeature.REGISTRATION) && isIdentityStep;
  // TODO: OKTA-451535 Unlock this when we implement fastpass
  // const stepWithSignInWithFastPass = remediationContainsStep(
  //   transaction.neededToProceed,
  //   IDX_STEP.LAUNCH_AUTHENTICATOR,
  // );
  const stepWithUnlockAccount = enabledFeatures?.includes(IdxFeature.ACCOUNT_UNLOCK)
    && isIdentityStep;
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

  updatedFormBag.uischema.elements.push(...elements);

  // Handles custom messages
  transformCustomMessages(transaction, updatedFormBag, widgetProps);

  return updatedFormBag;
};
