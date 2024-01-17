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

export const RSAIcon: FunctionComponent<IconProps> = ({ name, description }) => (
  <svg
    width="48"
    height="48"
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
      d="M24 48C37.2548 48 48 37.2548 48 24C48 10.7452 37.2548 0 24 0C10.7452 0 0 10.7452 0 24C0 37.2548 10.7452 48 24 48Z"
      fill="#F5F5F6"
      class="siwFillBg"
    />
    <path
      d="M42 30.3102H39.6261L35.3202 20.898L31.1912 30.3228H28.8046L34.2217 18.3024H36.4567L42 30.3102ZM15.584 21.8052C15.5461 19.6884 13.8036 18.2142 11.3413 18.2142H6.97229H6V30.2976H7.94458V19.9782H11.2276C12.3262 19.9782 13.5132 20.52 13.5258 21.8178C13.5384 22.977 12.6293 23.6952 11.0887 23.7582H11.0635L9.88916 23.7708L13.8036 30.3102H16.1017C16.1017 30.3102 14.2203 27.1476 13.0333 25.1694C14.7632 24.552 15.5966 23.1912 15.584 21.8052ZM23.2613 23.1786C21.2157 22.6368 20.4202 22.1706 20.4202 21.2382C20.4202 19.827 22.2511 19.6884 22.8951 19.6884C23.9306 19.6884 25.2311 20.016 26.0014 20.394L26.8348 18.8568C25.7867 18.3402 24.1831 18 22.8446 18C19.9909 18 18.2105 19.2348 18.2105 21.339C18.2105 23.7456 20.7233 24.426 22.6805 24.9426C24.7134 25.4844 25.4332 26.1018 25.4332 27.0468C25.4332 28.6092 23.7664 28.8486 22.731 28.8486C21.3167 28.8486 20.1424 28.4706 19.006 27.8028L18.0337 29.3652C19.4732 30.2094 20.9632 30.6 22.731 30.6C25.6731 30.6 27.6303 29.151 27.6303 26.9082C27.6429 24.4008 25.2564 23.7078 23.2613 23.1786Z"
      fill="#BE3A34"
    />
  </svg>
);
