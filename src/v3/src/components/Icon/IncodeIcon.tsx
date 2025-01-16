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

export const IncodeIcon: FunctionComponent<IconProps> = ({
  name,
  description,
  width,
  height,
}) => (
  <svg
    width={width || 36}
    height={height || 36}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-labelledby={name}
    role="img"
  >
    <title id={name}>{description}</title>
    <g clipPath="url(#clip0_2840_49026)">
      <circle
        cx="20"
        cy="20"
        r="20"
        fill="#007AFF"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.3227 15.682L14.3509 29.1526H11.083V15.682H14.3227ZM14.4327 11V13.8465H11V11H14.4327Z"
        fill="white"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M24.5719 15.0209C26.0745 15.0209 27.5044 15.288 28.8609 15.8221L28.9734 15.8664V18.719L28.7216 18.6171C27.3535 18.0635 26.1073 17.7877 24.983 17.7877C23.5852 17.7877 22.5534 18.1196 21.8784 18.7755C21.2041 19.4314 20.8619 20.4881 20.8619 21.9538C20.8619 23.4925 21.1967 24.605 21.8557 25.2946C22.5103 25.9813 23.5761 26.3288 25.0651 26.3288C26.2803 26.3288 27.5054 26.0459 28.7403 25.4787L29 25.3594V28.22L28.8924 28.266C27.5556 28.8374 26.1244 29.1226 24.5993 29.1226C22.7145 29.1226 21.1242 28.625 19.8351 27.6291L19.6439 27.476L19.4986 27.3505C18.2629 26.2388 17.6493 24.5057 17.6493 22.1642C17.6493 19.6634 18.3007 17.8416 19.6139 16.7092C20.9184 15.5837 22.574 15.0209 24.5719 15.0209Z"
        fill="white"
      />
    </g>
    <defs>
      <clipPath id="clip0_2840_49026">
        <rect
          width="40"
          height="40"
          fill="white"
        />
      </clipPath>
    </defs>
  </svg>
);