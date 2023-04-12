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

import { IDX_STEP } from '../../constants';
import {
  FieldElement,
  TransformStepFnWithOptions,
} from '../../types';
import { traverseLayout } from '../util';

export const applyAsteriskToFieldElements: TransformStepFnWithOptions = ({
  transaction,
}) => (formbag) => {
  const { nextStep: { name = '' } = {} } = transaction;
  if (![IDX_STEP.ENROLL_PROFILE, IDX_STEP.ENROLL_PROFILE_UPDATE].includes(name)) {
    return formbag;
  }
  traverseLayout({
    layout: formbag.uischema,
    predicate: (el) => (el.type === 'Field'),
    callback: (el) => {
      const fieldElement = (el as FieldElement);
      const { options: { inputMeta: { required } } } = fieldElement;
      fieldElement.showAsterisk = required;
    },
  });
  return formbag;
};
