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
import { Choice } from 'src/types';

export type Result = { format: 'radio'; choices: Choice[] };

export const transformer = (input: Input): Result | null => {
  const { options } = input;
  if (!options || options.every((opt) => typeof opt.value === 'object')) {
    return null;
  }

  return {
    format: 'radio',
    choices: options.map((opt) => ({
      key: opt.value,
      value: opt.label,
    } as Choice)),
  };
};
