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
      fill="#D9222A"
      d="m40 29.725-4.93-11.438h.002-.002v-.002.001h-1.98L28.27 29.73h2.124l3.669-8.974 3.825 8.974L40 29.725Zm-25.757-4.897c1.547-.588 2.287-1.886 2.27-3.21-.028-2.009-1.579-3.41-3.771-3.41H8V29.71h1.727v-9.824h2.916c.978 0 2.028.517 2.045 1.755.014 1.104-.796 1.793-2.169 1.852l-.027.001-1.046.01 3.484 6.225 2.04-.005-2.727-4.898Zm4.61-3.65c0 2.29 2.237 2.937 3.976 3.435 1.812.52 2.443 1.107 2.443 1.997 0 1.484-1.481 1.715-2.397 1.715-1.257 0-2.295-.357-3.31-.994l-.867 1.492C19.98 29.626 21.307 30 22.875 30c2.62 0 4.36-1.38 4.36-3.514 0-2.385-2.117-3.045-3.897-3.556-1.813-.52-2.522-.961-2.522-1.851 0-1.348 1.623-1.479 2.204-1.479.915 0 2.077.311 2.766.672l.729-1.458c-.929-.488-2.353-.814-3.543-.814-2.533 0-4.119 1.172-4.119 3.178Z"
    />
  </svg>
);