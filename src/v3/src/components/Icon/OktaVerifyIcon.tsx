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

export const OktaVerifyIcon: FunctionComponent<IconProps> = ({
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
      fillRule="evenodd"
      d="M32.872 22.853a8.947 8.947 0 1 1-2.288-4.91L24 24.498l-3.205-3.19c-.482-.48-1.322-.48-1.804 0a1.26 1.26 0 0 0-.374.898c0 .34.133.659.374.898l4.107 4.09c.24.239.561.371.902.371.336 0 .664-.136.902-.372L38.636 13.52a18.089 18.089 0 0 0-1.634-1.967A17.947 17.947 0 0 0 24 6C14.059 6 6 14.059 6 24s8.059 18 18 18 18-8.059 18-18c0-2.972-.722-5.775-1.998-8.245l-7.13 7.098Z"
      clipRule="evenodd"
    />
  </svg>
);
