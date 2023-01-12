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

import { IdxRemediation } from '@okta/okta-auth-js';
import { flow } from 'lodash';

import { IDX_STEP } from '../../constants';
import { TransformStepFnWithOptions } from '../../types';

export const PIV_TYPE = 'X509';

const transformRemediationNameForIdp: TransformStepFnWithOptions = (options) => (formbag) => {
  const { transaction: { neededToProceed: remediations, nextStep } } = options;
  if (!remediations.length) {
    return formbag;
  }

  // update Remediations array
  remediations.forEach((remediation: IdxRemediation) => {
    // TODO: OKTA-504638 Can Add IDP remediation name renaming logic here
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

export const transformTransactionData: TransformStepFnWithOptions = (options) => (formbag) => flow(
  transformRemediationNameForIdp(options),
)(formbag);
