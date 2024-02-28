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

export const DuoIcon: FunctionComponent<IconProps> = ({
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
      fill="#77AF54"
      fillRule="evenodd"
      d="M10.632 17H4v6.13h13.25c-.197-3.418-3.085-6.13-6.618-6.13Zm7.242 0v6.506c0 3.466 2.766 6.3 6.25 6.494V17h-6.25Zm13.886 6.13c.2-3.418 3.087-6.13 6.62-6.13s6.42 2.712 6.62 6.13H31.76Zm-6.873 6.859h6.238v-6.114a6.32 6.32 0 0 0 .012-.375V17h-6.25v12.989Zm-14.255.01H4v-6.124h13.25C17.054 27.291 14.166 30 10.633 30ZM38.38 30c-3.533 0-6.42-2.709-6.62-6.125H45C44.801 27.291 41.913 30 38.38 30Z"
      clipRule="evenodd"
    />
  </svg>
);
