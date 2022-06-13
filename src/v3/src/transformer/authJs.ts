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
import { WidgetProps } from 'src/types';
import { FormBag, IdxTransactionWithNextStep } from 'src/types/jsonforms';

import { AUTHENTICATOR_KEY, IDX_STEP } from '../constants';
import { hasMinAuthenticatorOptions } from '../util';
import { transformInputs } from './field';
import { getButtonControls } from './getButtonControls';
import TransformerMap from './idxTransformerMapping';
import { transformCustomMessages } from './messages/transformCustomMessages';
import { remediationContainsStep } from './utils';

export default (transaction: IdxTransactionWithNextStep, widgetProps: WidgetProps): FormBag => {
  const { nextStep } = transaction;

  const enabledFeatures = transaction?.enabledFeatures;
  const { name: stepName } = nextStep;

  const { schema, uischema } = transformInputs(nextStep.inputs);

  // handle authenticator options
  const formBag = { schema, uischema };

  // Perform custom transformation based on authenticator
  const authenticatorKey = nextStep?.relatesTo?.value?.key || AUTHENTICATOR_KEY.DEFAULT;
  const customTransformer = TransformerMap[stepName]?.[authenticatorKey];
  const updatedFormBag = customTransformer?.transform?.(transaction, formBag, widgetProps)
    ?? formBag;

  const isIdentityStep = remediationContainsStep(transaction.neededToProceed, IDX_STEP.IDENTIFY);
  // TODO: Remove buttons from here and add to custom transformers - OKTA-479077
  const stepWithRegister = enabledFeatures?.includes(IdxFeature.REGISTRATION) && isIdentityStep;
  const stepWithForgotPassword = enabledFeatures?.includes(IdxFeature.PASSWORD_RECOVERY)
    && isIdentityStep;
  const stepWithSignInWithFastPass = remediationContainsStep(
    transaction.neededToProceed,
    IDX_STEP.LAUNCH_AUTHENTICATOR,
  );
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

  const { elements, properties } = getButtonControls(
    transaction,
    {
      stepWithSubmit: customTransformer?.buttonConfig?.showDefaultSubmit ?? true,
      stepWithCancel: customTransformer?.buttonConfig?.showDefaultCancel
        ?? nextStep.name !== IDX_STEP.IDENTIFY,
      stepWithRegister,
      stepWithForgotPassword,
      stepWithSignInWithFastPass,
      stepWithUnlockAccount,
      backToAuthList,
      verifyWithOther,
    },
  );

  updatedFormBag.schema.properties = {
    ...updatedFormBag.schema.properties,
    ...properties,
  };

  updatedFormBag.uischema.elements.push(...elements);

  // Handles custom messages
  transformCustomMessages(transaction, updatedFormBag, widgetProps);

  return updatedFormBag;
};
