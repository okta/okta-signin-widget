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

import { Input } from '@okta/okta-auth-js';

export const flattenInputs = (input: Input): Input[] => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const fn = (input: Input, nameTracker = '', requiredTracker: Input['required']): Input[] => {
    const res: Input[] = [];
    const { value, options, type } = input;

    // Calculate "required" attribute for the flatten input
    // 1. when upper value is falsy - take "required" value from the current level
    // 2. when upper value is truthy
    //    a. set as "true" when current required field is undefined
    //    b. follow current required field if it exists
    let required: Input['required'] = false;
    if (requiredTracker) {
      required = typeof input.required === 'undefined' ? true : input.required;
    } else if (requiredTracker === false) {
      required = typeof input.required === 'undefined' ? false : input.required;
    } else {
      required = input.required;
    }
    let name: Input['name'];
    if (nameTracker) {
      name = typeof input.name === 'undefined' ? nameTracker : `${nameTracker}.${input.name}`;
    } else {
      name = input.name;
    }

    // flatten stepper related fields
    if (type === 'object' && name !== 'authenticator' && Array.isArray(options)) {
      return options.reduce((acc, curr) => [
        ...acc,
        ...fn(curr as Input, name, required),
      ], res);
    }

    if (Array.isArray(value)) {
      return value.reduce((acc, curr) => [
        ...acc,
        ...fn(curr, name, required),
      ], res);
    }

    return [{
      ...input,
      name,
      ...(typeof required !== 'undefined' && { required }),
    }];
  };

  return fn(input, '', undefined);
};
