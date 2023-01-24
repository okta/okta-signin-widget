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

import { flow } from 'lodash';

import {
  TransformStepFnWithOptions,
} from '../../types';
import { addIdToElements } from './addIdToElements';
import { createTextElementKeys } from './createTextElementKeys';
import { setFocusOnFirstElement } from './setFocusOnFirstElement';
import { updateCustomFields } from './updateCustomFields';
import { updateElementKeys } from './updateElementKeys';
import { updateInteractiveElementsDescribedByValue } from './updateInteractiveElementsDescribedByValue';
import { updatePasswordDescribedByValue } from './updatePasswordDescribedByValue';
import { updateRequiredFields } from './updateRequiredFields';

export const transformUISchema: TransformStepFnWithOptions = (
  options,
) => (formbag) => flow(
  updateCustomFields,
  setFocusOnFirstElement(options),
  // TODO: OKTA-524769 - temporary solution for custom fields in profile enrollment
  updateRequiredFields(options),
  createTextElementKeys,
  updateElementKeys(options),
  addIdToElements,
  updateInteractiveElementsDescribedByValue,
  updatePasswordDescribedByValue,
)(formbag);
