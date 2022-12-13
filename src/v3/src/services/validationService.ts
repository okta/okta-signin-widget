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

interface ConfigOptions {
  requiredErrors?: boolean,
  propertiesErrors?: boolean,
  singleErrors?: boolean,
  keyword?: string
}
interface ErrorMessage {
  required?: { [key: string]: string },
  properties?: { [key: string]: string }
}
type ErrorMessageType = 'required' | 'properties';

// Temporary service
const ValidationService = {
  configErrorMessageField(options: ConfigOptions): (
    message: string, type: ErrorMessageType, keyword?: string) => ErrorMessage | string {
    const { requiredErrors, propertiesErrors, singleErrors } = options;
    const errorMessage: ErrorMessage = {};

    if (!singleErrors) {
      if (requiredErrors) {
        errorMessage.required = {};
      }

      if (propertiesErrors) {
        errorMessage.properties = {};
      }
    }

    return (message: string, type: ErrorMessageType, keyword?: string): ErrorMessage | string => {
      if (singleErrors) {
        return message;
      }

      if (keyword) {
        if (type === 'required' && errorMessage.required) {
          errorMessage.required[keyword] = message;
        }

        if (type === 'properties' && errorMessage.properties) {
          errorMessage.properties[keyword] = message;
        }
      }

      return errorMessage;
    };
  },
};

export default ValidationService;
