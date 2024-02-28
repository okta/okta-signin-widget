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

export const SmartCardIcon: FunctionComponent<IconProps> = ({
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
      d="M17.5 37h13a2.6 2.6 0 0 0 2.5-2.682V14.682A2.6 2.6 0 0 0 30.5 12h-13a2.6 2.6 0 0 0-2.5 2.682v19.636A2.6 2.6 0 0 0 17.5 37Zm-1.096-23.468A1.6 1.6 0 0 1 17.5 13h13a1.6 1.6 0 0 1 1.5 1.682v19.636A1.6 1.6 0 0 1 30.5 36h-13a1.6 1.6 0 0 1-1.5-1.682V14.682a1.6 1.6 0 0 1 .404-1.15ZM23 28h-1v1h1v-1Zm-3 0h1v1h-1v-1Zm0 5v-3h3v1h-2v2h-1Zm2-1h1v1h-1v-1Zm-2-5a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1h-3Z"
      class="siwFillPrimaryDark"
      clipRule="evenodd"
    />
    <path
      fill="#A7B5EC"
      fillRule="evenodd"
      d="M28 17h-4v1h4v-1Zm2 2h-6v1h6v-1Zm-6 2h6v1h-6v-1Z"
      class="siwFillSecondary"
      clipRule="evenodd"
    />
  </svg>
);
