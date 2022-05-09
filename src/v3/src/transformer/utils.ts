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

import { ControlElement } from '@jsonforms/core';
import { IdxTransaction } from '@okta/okta-auth-js';
import { IdxRemediation } from '@okta/okta-auth-js/lib/idx/types/idx-js';

import { FormBag, LayoutType, RequiredKeys } from '../types';

export const createForm = (): FormBag => ({
  schema: {
    type: 'object',
    properties: {},
    required: [],
  },
  uischema: {
    type: LayoutType.VERTICAL,
    elements: [],
  },
  data: {},
});

export const removeUIElementWithScope = (
  scope: string,
  elements: ControlElement[],
): ControlElement[] => (
  elements.filter((element) => (
    scope !== element.scope
  ))
);

export const getUIElementWithScope = (
  scope: string,
  elements: ControlElement[],
): ControlElement | undefined => (
  elements.find((element) => (
    scope === element.scope
  ))
);

export const isNextStepAvailable = (
  transaction: IdxTransaction,
): transaction is RequiredKeys<IdxTransaction, 'nextStep'> => !!transaction.nextStep;

export const remediationContainsStep = (
  neededToProceed: IdxRemediation[],
  step: string,
): boolean => neededToProceed.some((remediation) => remediation.name === step);

export const getCurrentTimestamp = (): number => (new Date().getTime());
