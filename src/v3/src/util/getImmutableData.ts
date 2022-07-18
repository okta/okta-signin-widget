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

import { IdxTransaction, Input, NextStep } from '@okta/okta-auth-js';

import { flattenInputs } from './flattenInputs';

export const getImmutableData = (
  transaction: IdxTransaction,
  stepName?: string,
): Record<string, unknown> => {
  const {
    nextStep = {},
    availableSteps = [],
  } = transaction;

  const step = stepName ? availableSteps.find((s) => s.name === stepName) : nextStep;
  const inputs = (step as NextStep).inputs || [];

  return inputs
    .reduce((acc: Input[], input: Input) => {
      const flattenedInputs = flattenInputs(input);
      return [...acc, ...flattenedInputs];
    }, [])
    .filter((input) => input.mutable === false)
    .reduce((acc: any, input) => {
      acc[input.name] = input.value;
      return acc;
    }, {});
};
