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

import { IdxTransaction, NextStep } from '@okta/okta-auth-js';

import { AUTHENTICATOR_KEY } from '../../constants';
import {
  LinkElement,
  TransformStepFnWithOptions,
} from '../../types';
import {
  getAuthenticatorKey, getForgotPasswordUri, isConfigRecoverFlow, loc,
} from '../../util';
import TransformerMap from '../layout/idxTransformerMapping';

const getStepByName = (
  stepName: string,
  transaction: IdxTransaction,
): NextStep | undefined => transaction.availableSteps?.find(({ name }) => name === stepName);

export const transformForgotPasswordButton: TransformStepFnWithOptions = ({
  transaction,
  step,
  widgetProps,
}) => (
  formbag,
) => {
  const forgotPasswordAuthenticatorStepName = 'currentAuthenticator-recover';
  const forgotPasswordAuthenticatorEnrollmentStep = 'currentAuthenticatorEnrollment-recover';
  const authenticatorKey = getAuthenticatorKey(transaction) ?? AUTHENTICATOR_KEY.DEFAULT;
  const customTransformer = TransformerMap[step]?.[authenticatorKey];
  const shouldAddDefaultButton = customTransformer?.buttonConfig?.showForgotPassword ?? false;
  const forgotPasswordStep = getStepByName(forgotPasswordAuthenticatorStepName, transaction)
    ?? getStepByName(forgotPasswordAuthenticatorEnrollmentStep, transaction);
  if (!shouldAddDefaultButton || typeof forgotPasswordStep === 'undefined') {
    return formbag;
  }

  // TODO
  // OKTA-651781
  // when flow param is set to resetPassword, the identify page is redressed as identify-recovery page
  // so this link needs to be hidden
  if (isConfigRecoverFlow(widgetProps.flow)) {
    return formbag;
  }

  const { name: stepName } = forgotPasswordStep;
  const forgotPassword: LinkElement = {
    type: 'Link',
    contentType: 'footer',
    options: {
      label: loc('forgotpassword', 'login'),
      isActionStep: true,
      step: stepName,
    },
  };
  const forgotPasswordUri = getForgotPasswordUri(widgetProps);
  if (forgotPasswordUri) {
    forgotPassword.options.href = forgotPasswordUri;
  }

  formbag.uischema.elements.push(forgotPassword);

  return formbag;
};
