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
  ActionParams,
  DataSchema,
  FormBag,
  WidgetMessage,
} from '../types';

export const getValidationMessages = (
  dataSchema: Record<string, DataSchema>,
  fieldsToValidate: string[],
  data: FormBag['data'],
  params?: ActionParams,
): Record<string, WidgetMessage[]> | undefined => {
  // aggregate field level messages based on validation rules in each field
  const messages = Object.entries(dataSchema)
    .reduce((acc: Record<string, WidgetMessage[]>, [name, elementSchema]) => {
      if (fieldsToValidate.includes(name) && typeof elementSchema.validate === 'function') {
        const validationMessages = elementSchema.validate({
          // data & params are passed here for validation in case a required field
          // does not translate to user input, we rely on the transformer to populate
          // actionParams to pass the required validation check.
          ...data,
          ...params,
        });
        if (validationMessages?.length) {
          acc[name] = validationMessages;
        }
      }
      return acc;
    }, {});

  return Object.keys(messages).length ? messages : undefined;
};
