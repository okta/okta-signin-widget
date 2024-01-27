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
  FormBag,
  TransformationOptions,
  TransformStepFn,
  UISchemaLayoutType,
} from '../types';
import { isServerGeneratedSchemaAvailable } from '../util';
import { transformButtons } from './button';
import { transformCaptcha } from './captcha';
import { transformDataSchema } from './dataSchema';
import { transformFields } from './field';
import { transformI18n } from './i18n';
import { transformLayout } from './layout';
import { transformMessages } from './messages';
import { transformServerSchema } from './serverSchema';
import { transformTestAttribute } from './testAttribute';
import { transformTransactionData } from './transaction';
import { transformUISchema } from './uischema';

// use this function after each transformation step to log the formbag output
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const logger: TransformStepFn = (formbag) => {
  // eslint-disable-next-line no-console
  console.log(formbag);
  return formbag;
};

export const transformIdxTransaction = (options: TransformationOptions): FormBag => {
  const defaultFormBag = {
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
    dataSchema: {
      fieldsToTrim: [],
      fieldsToValidate: [],
      fieldsToExclude: () => ([]),
    },
  };

  // Transformation for new server generated uischema
  if (isServerGeneratedSchemaAvailable(options.widgetProps, options.transaction)) {
    return flow([transformServerSchema(options)])(defaultFormBag);
  }

  const transformationStepFns: TransformStepFn[] = [
    transformTransactionData(options),
    transformFields(options),
    transformLayout(options),
    transformButtons(options),
    transformCaptcha(options),
    transformMessages(options),
    transformI18n(options),
    transformUISchema(options),
    transformDataSchema,
    transformTestAttribute,
  ];

  return flow(transformationStepFns)(defaultFormBag);
};
