/*
 * Copyright (c) 2024-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { WidgetMessage } from '../types';

type FieldLevelErrorMessages = {
  errorMessage?: string;
  errorMessageList?: string[];
};

export const buildFieldLevelErrorMessages = (
  errors: WidgetMessage[] | undefined,
) : FieldLevelErrorMessages => {
  const hasErrors = typeof errors !== 'undefined' && errors.length > 0;

  if (hasErrors) {
    if (errors.length === 1) {
      const error = errors[0];
      // Covers nested messages, e.g. password requirements not met
      // The SIW does not have messages nested more than once
      if (Array.isArray(error.message)) {
        return {
          errorMessage: error.description,
          errorMessageList: error.message
            .filter((msg) => typeof msg.message === 'string')
            .map((msg) => msg.message as string),
        };
      }
      return { errorMessage: error.message };
    }
    return {
      errorMessageList: errors
        .filter((error) => typeof error.message === 'string')
        .map((error) => error.message as string),
    };
  }

  return {};
};
