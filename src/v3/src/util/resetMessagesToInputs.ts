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

import { WidgetMessage } from '../types';

export function resetMessagesToInputs(
  inputs: Input[],
  messagesByField: Record<string, WidgetMessage[]>,
): void {
  const fn = (items: Input[], namePrefix: string) => {
    items.forEach((input) => {
      let name: Input['name'];
      if (namePrefix) {
        name = typeof input.name === 'undefined' ? namePrefix : `${namePrefix}.${input.name}`;
      } else {
        name = input.name;
      }

      // add message to stepper related fields
      if (input.type === 'object' && name !== 'authenticator' && Array.isArray(input.options)) {
        input.options.forEach((option) => {
          fn(option.value as Input[], name);
        });
        return;
      }

      if (Array.isArray(input.value)) {
        fn(input.value, name);
        return;
      }

      const messages = messagesByField[name];
      // @ts-ignore update Input type in okta-auth-js
      // eslint-disable-next-line no-param-reassign
      input.messages = messages?.length ? {
        type: 'object',
        value: [...messages],
      } : undefined;
    });
  };

  fn(inputs, '');
}
