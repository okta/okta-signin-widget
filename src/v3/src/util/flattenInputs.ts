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

export const flattenInputs = (input: Input, name = ''): Input[] => {
  const res: Input[] = [];
  const { value } = input;

  if (Array.isArray(value)) {
    return value.reduce((acc, curr) => [
      ...acc,
      ...flattenInputs(curr, input.name),
    ], res);
  }

  return [{
    ...input,
    name: name ? `${name}.${input.name}` : input.name,
  }];
};
