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

import { IdxTransaction } from '@okta/okta-auth-js';
import { flow } from 'lodash';

import { FormBag, UISchemaLayoutType } from '../types';
import { transformAttributes } from './attribute';
import { transformButtons } from './button';
import { transformFields } from './field';
import { transformI18n } from './i18n';
import { transformLayout } from './layout';
import { transformStyle } from './style';
import { transformTestAttributes } from './testAttribute';

export type TransformStepFn = (formbag: FormBag) => FormBag;
// TODO: update to include all possible context in higher order fn argument
export type WithContextTransformStepFn = (transaction: IdxTransaction) => TransformStepFn;

// use this function after each transformation step to log the formbag output
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const logger = (formbag: FormBag) => {
  // eslint-disable-next-line no-console
  console.log(formbag);
  return formbag;
};

export const transformIdxTransaction = (transaction: IdxTransaction): FormBag => {
  const transformationStepFns: TransformStepFn[] = [
    // Transform form fields from authjs transaction (based on selected step)
    transformFields(transaction),
    transformAttributes,
    // Transform all action buttons
    transformButtons(transaction),
    // Transform custom layout and all ui elements that should be rendered on form
    transformLayout(transaction),
    // IMPORTANT: steps below should happen after "transformLayout"
    // they should include centralized logic that target to all uielements in schema
    transformI18n(transaction),
    transformStyle,
    transformTestAttributes,
  ];
  
  return flow(transformationStepFns)({
    schema: {
      type: 'object',
      properties: {},
      required: [],
    },
    uischema: {
      type: UISchemaLayoutType.VERTICAL,
      elements: [],
    },
    data: {},
    dataSchema: {},
  });
};
