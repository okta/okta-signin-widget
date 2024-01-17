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

export const GoogleOTPIcon: FunctionComponent<IconProps> = ({
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
      fillRule="evenodd"
      clipRule="evenodd"
      d="M39.5 26.9545C41.1569 26.9545 42.5 25.6113 42.5 23.9545C42.5 22.2976 41.1569 20.9545 39.5 20.9545H28.6963L34.0982 11.5981C34.9266 10.1632 34.435 8.32845 33.0001 7.50002C31.5652 6.67159 29.7304 7.16322 28.902 8.5981L18.304 26.9545H39.5Z"
      fill="#1A73E7"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M18.0981 8.5981C17.2697 7.16322 15.4349 6.67159 14 7.50002C12.5651 8.32845 12.0735 10.1632 12.9019 11.5981L18.3039 20.9545H21.7681L23.5001 17.9546L18.0981 8.5981Z"
      fill="#FABB04"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M21.768 20.9545H7.5C5.84315 20.9545 4.5 22.2976 4.5 23.9545C4.5 25.6114 5.84315 26.9545 7.5 26.9545H18.3039L21.768 20.9545Z"
      fill="#34A753"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M18.304 26.9545L12.9021 36.3109C12.0736 37.7458 12.5653 39.5806 14.0001 40.409C15.435 41.2374 17.2698 40.7458 18.0982 39.3109L23.5001 29.9546L28.902 39.3109C29.7304 40.7458 31.5652 41.2374 33 40.409C34.4349 39.5805 34.9265 37.7458 34.0981 36.3109L28.6962 26.9545H18.304Z"
      fill="#E94335"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M23.5001 17.9546L28.6962 26.9545H18.304L23.5001 17.9546Z"
      fill="#174EA5"
    />
  </svg>
);
