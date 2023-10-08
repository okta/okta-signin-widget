/*
 * Copyright (c) 2023-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { APIError, IdxRemediation } from '@okta/okta-auth-js';
import { flow } from 'lodash';

import { AUTHENTICATOR_KEY, IDX_STEP } from '../../constants';
import { RegistrationElementSchema, TransformStepFnWithOptions } from '../../types';
import {
  convertIdxInputsToRegistrationSchema,
  convertRegistrationSchemaToIdxInputs,
  getAuthenticatorKey,
  isVerifyFlow,
  parseRegistrationSchema,
  triggerRegistrationErrorMessages,
} from '../../util';

export const PIV_TYPE = 'X509';

const transformRemediationNameForIdp: TransformStepFnWithOptions = (options) => (formbag) => {
  const { transaction } = options;
  const { neededToProceed: remediations, nextStep } = transaction;
  if (!remediations.length) {
    return formbag;
  }

  if (nextStep?.name === IDX_STEP.REDIRECT_IDP
    && getAuthenticatorKey(transaction) === AUTHENTICATOR_KEY.IDP) {
    // idp authenticator
    const newRemediationName = isVerifyFlow(transaction)
      ? IDX_STEP.CHALLENGE_AUTHENTICATOR
      : IDX_STEP.ENROLL_AUTHENTICATOR;

    nextStep!.name = newRemediationName;
    // This is so the correct authenticator transformer is reached in idxTransformerMapping.ts
    options.step = newRemediationName;
  }

  // update Remediations array
  remediations.forEach((remediation: IdxRemediation) => {
    if (remediation.name === IDX_STEP.REDIRECT_IDP && remediation.type === PIV_TYPE) {
      // piv idp
      remediation.name = IDX_STEP.PIV_IDP;
    }
  });

  // update nextStep step name if applicable
  // @ts-expect-error OKTA-565392 type missing from NextStep type
  const isPivType = nextStep?.type === PIV_TYPE;
  if (nextStep?.name === IDX_STEP.REDIRECT_IDP && isPivType) {
    nextStep.name = IDX_STEP.PIV_IDP;
    options.step = IDX_STEP.PIV_IDP;
  }

  return formbag;
};

const transformRegistrationSchema: TransformStepFnWithOptions = (options) => (formbag) => {
  const {
    transaction: { nextStep: { inputs = [], name } = {} },
    widgetProps,
    setMessage,
    isClientTransaction,
  } = options;
  const { registration: { parseSchema } = {} } = widgetProps;
  // If the step is not enroll-profile or if parseSchema is not defined, no need to evaluate
  if (name !== IDX_STEP.ENROLL_PROFILE || typeof parseSchema !== 'function') {
    return formbag;
  }

  // Converts IDX Input array into Registration Schema element array
  const registrationSchema = convertIdxInputsToRegistrationSchema(inputs);

  parseRegistrationSchema(
    widgetProps,
    registrationSchema,
    (schema: RegistrationElementSchema[]) => {
      // Converts Registration Schema Element array back into IDX Input array
      // Also sets those inputs back into the nextStep.inputs property
      convertRegistrationSchemaToIdxInputs(schema, inputs);
    },
    (error: APIError) => {
      // Prioritize server side errors over custom error message
      if (isClientTransaction) {
        return;
      }
      triggerRegistrationErrorMessages(error, inputs, setMessage);
    },
  );
  return formbag;
};

export const transformTransactionData: TransformStepFnWithOptions = (options) => (formbag) => flow(
  transformRemediationNameForIdp(options),
  transformRegistrationSchema(options),
)(formbag);
