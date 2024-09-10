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

import { FunctionComponent, h } from 'preact';

import { IconProps } from '../../types';

export const PersonaIcon: FunctionComponent<IconProps> = ({
  name, description, width, height,
}) => (
  <svg
    width={width || 36}
    height={height || 36}
    viewBox="0 0 32 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-labelledby={name}
    role="img"
  >
    <title id={name}>{description}</title>
    <path
      fill-rule="evenodd" clip-rule="evenodd"
      d="M16.3263 0C8.73345 0 3 5.48392 3 12.8641V36H9.50812V25.677H16.3263C23.9191 25.677 29.6524 20.1931 29.6524 12.8641C29.6524 5.48392 23.9191 0 16.3263 0ZM23.1442 12.8641C23.1442 8.76397 20.2001 5.94517 16.3263 5.94517C12.4522 5.94517 9.50812 8.76397 9.50812 12.8641V19.7318H16.3263C20.2001 19.7318 23.1442 16.913 23.1442 12.8641Z"
      fill="#2F4EF7"
    />
  </svg>
);
