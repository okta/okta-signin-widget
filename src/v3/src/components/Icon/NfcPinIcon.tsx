/*
 * Copyright (c) 2026-present, Okta, Inc. and/or its affiliates. All rights reserved.
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

export const NfcPinIcon: FunctionComponent<IconProps> = ({
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
      d="M14.3765 16.9467C18.1132 20.6833 18.1132 26.7423 14.3765 30.4789C13.8245 31.0305 12.9294 31.0307 12.3775 30.4789C11.8256 29.927 11.8258 29.0319 12.3775 28.4799C15.0101 25.8472 15.0101 21.5783 12.3775 18.9457C11.8257 18.3937 11.8256 17.4986 12.3775 16.9467C12.9294 16.3947 13.8245 16.3949 14.3765 16.9467Z"
      fill="#22307C"
    />
    <path
      d="M18.2213 13.1029C24.0807 18.9626 24.0807 28.463 18.2212 34.3227C17.6693 34.8746 16.7742 34.8745 16.2222 34.3227C15.6702 33.7707 15.6702 32.8756 16.2222 32.3236C20.9777 27.568 20.9776 19.8577 16.2222 15.102C15.6702 14.5499 15.6702 13.6549 16.2222 13.1029C16.7742 12.5509 17.6692 12.5509 18.2213 13.1029Z"
      fill="#22307C"
    />
    <path
      d="M22.065 9.2582C30.0478 17.241 30.0477 30.1836 22.065 38.1664C21.513 38.7184 20.618 38.7184 20.066 38.1664C19.5144 37.6145 19.5144 36.7203 20.066 36.1684C26.9448 29.2895 26.9448 18.136 20.066 11.2572C19.5142 10.7052 19.514 9.81014 20.066 9.2582C20.6179 8.70631 21.513 8.70642 22.065 9.2582Z"
      fill="#2E40A5"
    />
    <path
      d="M25.9097 5.41445C36.0153 15.5203 36.0154 31.9053 25.9097 42.0111C25.3578 42.5631 24.4627 42.5629 23.9107 42.0111C23.3587 41.4591 23.3587 40.5641 23.9107 40.0121C32.9124 31.0103 32.9123 16.4154 23.9107 7.41348C23.3587 6.86147 23.3587 5.96646 23.9107 5.41445C24.4627 4.86253 25.3577 4.86247 25.9097 5.41445Z"
      fill="#22307C"
    />
  </svg>
);
