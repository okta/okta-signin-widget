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

import {
  ActionOptions,
  ActionParams,
  DataSchema,
  FormBag,
  IdxMessageWithName,
} from '../types';

export const getValidationMessages = (
  dataSchema: Record<string, DataSchema> & {
    submit: ActionOptions;
    fieldsToValidate: string[];
    fieldsToExclude: (data: FormBag['data']) => string[];
  },
  data: FormBag['data'],
  params: ActionParams | undefined,
): Record<string, IdxMessageWithName[]> | undefined => {
  const { fieldsToValidate } = dataSchema;
  // aggregate field level messages based on validation rules in each field
  const messages = Object.entries(dataSchema)
    .reduce((acc: Record<string, IdxMessageWithName[]>, curr) => {
      const name = curr[0];
      const elementSchema = curr[1] as DataSchema;
      if (fieldsToValidate.includes(name) && typeof elementSchema.validate === 'function') {
        const validationMessages = elementSchema.validate({
          ...data,
          ...params,
        });
        if (validationMessages?.length) {
          acc[name] = [...validationMessages];
        }
      }
      return acc;
    }, {});

  return Object.keys(messages)?.length ? messages : undefined;
};
