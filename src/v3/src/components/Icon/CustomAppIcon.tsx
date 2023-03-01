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

export const CustomAppIcon: FunctionComponent<IconProps> = ({ name, description }: IconProps) => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 140 140"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-labelledby={name}
    role="img"
  >
    <title id={name}>{description}</title>
    <circle
      cx="70"
      cy="70"
      r="69"
      fill="#00297A"
      stroke="#F5F5F6"
      strokeLinecap="round"
      strokeLinejoin="round"
      class="siwFillPrimary"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M91.5625 105H49.0625C47.4023 105 43.75 105 43.75 99.6875V67.8125C43.75 66.1523 43.75 62.5 49.0625 62.5V51.875C49.0625 39.5898 58.0273 30.625 70.3125 30.625C82.5977 30.625 91.5625 39.5898 91.5625 51.875V62.5C96.875 62.5 96.875 66.1523 96.875 67.8125V99.6875C96.875 101.348 96.875 105 91.5625 105ZM80.9382 51.876C80.9382 45.5674 76.6218 41.251 70.3132 41.251C64.0046 41.251 59.6882 45.5674 59.6882 51.876V62.501H80.9382V51.876Z"
      fill="white"
    />
  </svg>
);
