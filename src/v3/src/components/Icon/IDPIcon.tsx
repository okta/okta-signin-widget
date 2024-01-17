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

export const IDPIcon: FunctionComponent<IconProps> = ({
  name, description, width, height,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width || 48}
    height={height || 48}
    fill="none"
    aria-labelledby={name}
    role="img"
    viewBox="0 0 48 48"
  >
    <title id={name}>{description}</title>
    <path
      fill="#A7B5EC"
      d="M15 29.5a5 5 0 1 1 4.78-6.5h1.03a6 6 0 1 0 0 3h-1.03A5.013 5.013 0 0 1 15 29.5Z"
      class="siwFillSecondary"
    />
    <path
      fill="#00297A"
      d="M27.5 36a11.433 11.433 0 0 1-6.61-2.088l-.186-.134.592-.806.17.123a10.5 10.5 0 1 0-.166-17.066l-.592-.806A11.5 11.5 0 1 1 27.5 36Z"
      class="siwFillPrimaryDark"
    />
    <path
      fill="#00297A"
      d="m29.354 19.646-.708.708L32.293 24H14.707l1.647-1.646-.708-.708-2.853 2.854 2.853 2.854.708-.708L14.707 25h17.586l-3.647 3.646.708.708 4.853-4.854-4.853-4.854Z"
      class="siwFillPrimaryDark"
    />
  </svg>
);
