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

export const OnPremMFAIcon: FunctionComponent<IconProps> = ({ name, description }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    fill="none"
    aria-labelledby={name}
    role="img"
    viewBox="0 0 48 48"
  >
    <title id={name}>{description}</title>
    <path
      fill="#F5F5F6"
      fillRule="evenodd"
      d="M24 48c13.255 0 24-10.745 24-24S37.255 0 24 0 0 10.745 0 24s10.745 24 24 24Z"
      class="siwFillBg"
      clipRule="evenodd"
    />
    <path
      fill="#00297A"
      d="M39 20h-8v-3H16.5a7.5 7.5 0 0 0 0 15H31v-3h8v-9Zm-9 11H16.5a6.5 6.5 0 1 1 0-13H30v13Zm8-3h-7v-7h7v7Z"
      class="siwFillPrimary"
    />
    <path
      fill="#A7B5EC"
      d="M15.5 28a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Zm0-6a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z"
      class="siwFillSecondary"
    />
  </svg>
);
