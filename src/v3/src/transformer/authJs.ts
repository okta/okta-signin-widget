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

import { IdxFeature, IdxTransaction } from '@okta/okta-auth-js';

import { AUTHENTICATOR_KEY, IDX_STEP } from '../constants';
import { FormBag, WidgetProps } from '../types';
import { getAuthenticatorKey, hasMinAuthenticatorOptions } from '../util';
import { transformInputs } from './field';
import { getButtonControls } from './getButtonControls';
import { transformAdditionalPhoneUITranslations, uischemaLabelTransformer } from './i18nTransformer';
import TransformerMap from './idxTransformerMapping';
import { transformMessages } from './messages/transformMessages';

type Options = {
  transaction: IdxTransaction;
  prevTransaction: IdxTransaction | undefined;
  step?: string;
  widgetProps: WidgetProps;
};

export default ({
  transaction, prevTransaction, step, widgetProps,
} : Options): FormBag => {
  const { nextStep, availableSteps } = transaction;

  const enabledFeatures = transaction?.enabledFeatures;
  const stepName = (step || nextStep?.name) as string;

  const formBag = transformInputs(transaction, stepName!);
  uischemaLabelTransformer(transaction, formBag);
  transformAdditionalPhoneUITranslations({ transaction, formBag, widgetProps });

  const authenticatorKey = getAuthenticatorKey(transaction) ?? AUTHENTICATOR_KEY.DEFAULT;
  const customTransformer = TransformerMap[stepName]?.[authenticatorKey];
  const updatedFormBag = customTransformer?.transform?.({
    transaction,
    prevTransaction,
    formBag,
    widgetProps,
  }) ?? formBag;

  const hasIdentityStep = availableSteps?.some((s) => s.name === IDX_STEP.IDENTIFY);
  // TODO: Remove buttons from here and add to custom transformers - OKTA-479077
  const stepWithRegister = enabledFeatures?.includes(IdxFeature.REGISTRATION) && hasIdentityStep;
  // TODO: OKTA-451535 Unlock this when we implement fastpass
  // const stepWithSignInWithFastPass = remediationContainsStep(
  //   transaction.neededToProceed,
  //   IDX_STEP.LAUNCH_AUTHENTICATOR,
  // );
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

  transformMessages({ transaction, formBag: updatedFormBag, widgetProps });

  return updatedFormBag;
};
