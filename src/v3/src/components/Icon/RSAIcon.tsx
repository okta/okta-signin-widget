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

export const RSAIcon: FunctionComponent<IconProps> = ({
  name, description, width, height,
}) => (
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
      d="M 42 30.01 L 39.626 30.01 L 35.32 20.598 L 31.191 30.023 L 28.804 30.023 L 34.221 18.003 L 36.456 18.003 L 42 30.01 Z M 15.584 21.505 C 15.546 19.389 13.803 17.914 11.341 17.914 L 6.972 17.914 L 6 17.914 L 6 29.998 L 7.944 29.998 L 7.944 19.678 L 11.227 19.678 C 12.326 19.678 13.513 20.22 13.525 21.518 C 13.538 22.677 12.629 23.395 11.088 23.458 L 11.063 23.458 L 9.889 23.471 L 13.803 30.01 L 16.101 30.01 C 16.101 30.01 14.22 26.848 13.033 24.87 C 14.763 24.252 15.596 22.891 15.584 21.505 Z M 23.261 22.879 C 21.215 22.337 20.42 21.871 20.42 20.938 C 20.42 19.527 22.251 19.389 22.895 19.389 C 23.93 19.389 25.231 19.716 26.001 20.094 L 26.834 18.557 C 25.786 18.04 24.183 17.7 22.844 17.7 C 19.991 17.7 18.21 18.935 18.21 21.039 C 18.21 23.446 20.723 24.126 22.68 24.643 C 24.713 25.185 25.433 25.802 25.433 26.747 C 25.433 28.309 23.766 28.549 22.731 28.549 C 21.316 28.549 20.142 28.171 19.006 27.503 L 18.033 29.065 C 19.473 29.91 20.963 30.3 22.731 30.3 C 25.673 30.3 27.63 28.851 27.63 26.608 C 27.643 24.101 25.256 23.408 23.261 22.879 Z"
      fill="#BE3A34"
    />
  </svg>
);
