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

export const CustomOTPIcon: FunctionComponent<IconProps> = ({
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
      d="M28 23h-6v-6h1v5h5v1Z"
      class="siwFillSecondary"
    />
    <path
      fill="#A7B5EC"
      d="m29.39 14.32 1.46-1.47-.7-.7-1.6 1.59A11.323 11.323 0 0 0 23 12.03V10h2V9h-5v1h2v2.03c-1.967.078-3.88.667-5.55 1.71l-1.6-1.59-.7.7 1.46 1.47A11.459 11.459 0 0 0 13.79 31h1.37a10.5 10.5 0 1 1 14.68 0h1.37a11.459 11.459 0 0 0-1.82-16.68Z"
      class="siwFillSecondary"
    />
    <path
      fill="#00297A"
      d="m21.257 33.929-.514-.858L19 34.117V32h-1v2.117l-1.743-1.046-.514.858L17.528 35l-1.785 1.071.514.858L18 35.883V38h1v-2.117l1.743 1.046.514-.858L19.472 35l1.785-1.071Zm8 0-.514-.858L27 34.117V32h-1v2.117l-1.743-1.046-.514.858L25.528 35l-1.785 1.071.514.858L26 35.883V38h1v-2.117l1.743 1.046.514-.858L27.472 35l1.785-1.071Zm8 0-.514-.858L35 34.117V32h-1v2.117l-1.743-1.046-.514.858L33.528 35l-1.785 1.071.514.858L34 35.883V38h1v-2.117l1.743 1.046.514-.858L35.472 35l1.785-1.071Z"
      class="siwFillPrimaryDark"
    />
  </svg>
);
