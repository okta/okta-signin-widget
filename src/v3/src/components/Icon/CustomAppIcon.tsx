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

export const CustomAppIcon: FunctionComponent<IconProps> = ({
  name, description, width, height,
}: IconProps) => (
  <svg
    width={width || 48}
    height={height || 48}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-labelledby={name}
    role="img"
  >
    <title id={name}>{description}</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      fill="#00297A"
      d="M19.5 15A1 1 0 0128.5 15V20.7H33.5V35Q33.5 37.5 31 37.5H17Q14.5 37.5 14.5 35V20.7H19.5V15M27.2 15V20.7H20.8V15A1 1 0 0127.2 15M15.8 22V35Q15.8 36.2 17 36.2H31Q32.2 36.2 32.2 35V22H15.8Z"
      class="siwFillPrimaryDark"
    />
    <path
      fill="#A7B5EC"
      d="M21.35 29.1A2.65 2.65 0 1026.65 29.1 2.65 2.65 0 1021.35 29.1M22.65 29.1A1.35 1.35 0 1125.35 29.1 1.35 1.35 0 1122.65 29.1Z"
      class="siwFillSecondary"
    />
  </svg>
);
