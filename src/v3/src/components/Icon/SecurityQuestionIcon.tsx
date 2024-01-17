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

export const SecurityQuestionIcon: FunctionComponent<IconProps> = ({
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
      d="m24.25 39.123-4.615-3.433a21.799 21.799 0 0 1-8.827-16.259l-.329-5.738 12.84-4.534a2.818 2.818 0 0 1 1.862 0l12.84 4.534-.329 5.738a21.8 21.8 0 0 1-8.827 16.259l-4.615 3.433ZM11.521 14.387l.285 4.987a20.811 20.811 0 0 0 8.425 15.514l4.019 2.989 4.019-2.989a20.81 20.81 0 0 0 8.425-15.514l.285-4.987L24.848 10.1a1.792 1.792 0 0 0-1.2 0l-12.127 4.287Z"
      class="siwFillSecondary"
    />
    <path
      fill="#00297A"
      d="M29.44 19.729a5.007 5.007 0 0 0-8.846-2.356 4.484 4.484 0 0 0-.827 4.385l.929-.367A3.48 3.48 0 0 1 21.369 18a4.027 4.027 0 1 1 5.244 5.972C25 25 23.5 26.252 23.5 28.528h1c0-1.691 1.058-2.7 2.646-3.707a5.067 5.067 0 0 0 2.294-5.092Zm-5.454 12.246a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
      class="siwFillPrimaryDark"
    />
  </svg>
);
