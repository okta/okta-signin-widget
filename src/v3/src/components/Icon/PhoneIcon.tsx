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

export const PhoneIcon: FunctionComponent<IconProps> = ({
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
      fill="#00297A"
      d="M21.5 37h-9a2.6 2.6 0 0 1-2.5-2.682V14.682A2.6 2.6 0 0 1 12.5 12h9a2.6 2.6 0 0 1 2.5 2.682v19.636A2.6 2.6 0 0 1 21.5 37Zm-9-24a1.6 1.6 0 0 0-1.5 1.682v19.636A1.6 1.6 0 0 0 12.5 36h9a1.6 1.6 0 0 0 1.5-1.682V14.682A1.6 1.6 0 0 0 21.5 13h-9Z"
      class="siwFillPrimaryDark"
    />
    <path
      fill="#00297A"
      d="M19 34h-4v1h4v-1Zm-1-19a1 1 0 1 0-2 0 1 1 0 0 0 2 0Z"
      class="siwFillPrimaryDark"
    />
    <path
      fill="#A7B5EC"
      d="M34.606 34.606 33.9 33.9a13.998 13.998 0 0 0 0-19.8l.707-.707a15 15 0 0 1 0 21.212l-.001.001Z"
      class="siwFillSecondary"
    />
    <path
      fill="#A7B5EC"
      d="m31.071 31.071-.707-.707a9 9 0 0 0 0-12.728l.707-.707a10 10 0 0 1 0 14.142Zm-3.535-3.536-.707-.707a4 4 0 0 0 0-5.656l.707-.707a5 5 0 0 1 0 7.07Z"
      class="siwFillSecondary"
    />
  </svg>
);
