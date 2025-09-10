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

export const CustomIDVIcon: FunctionComponent<IconProps> = ({
  name,
  description,
  width,
  height,
}) => (
  <svg
    width={width || 40}
    height={height || 40}
    viewBox="0 0 40 40"
    fill="none"
    aria-labelledby={name}
    xmlns="http://www.w3.org/2000/svg"
  >
    <title id={name}>{description}</title>
    <rect
      width="40"
      height="40"
      fill="white"
    />
    <path
      d="M32.7686 27.0683L28.7636 31.0724C28.3663 31.4694 27.7226 31.4695 27.3255 31.0724L25.1079 28.8548L25.5876 28.3751L26.0673 27.8964L28.0445 29.8738L31.8094 26.1089L32.7686 27.0683Z"
      fill="#22307C"
    />
    <path
      d="M18.2198 17.1862C21.3088 17.1862 23.8129 14.6821 23.8129 11.5931C23.8129 8.50413 21.3088 6 18.2198 6C15.1308 6 12.6267 8.50413 12.6267 11.5931C12.6267 14.6821 15.1308 17.1862 18.2198 17.1862Z"
      stroke="#22307C"
    />
    <path
      d="M28.7291 34.5866C32.1925 34.5866 35.0001 31.7789 35.0001 28.3155C35.0001 24.8521 32.1925 22.0444 28.7291 22.0444C25.2657 22.0444 22.458 24.8521 22.458 28.3155C22.458 31.7789 25.2657 34.5866 28.7291 34.5866Z"
      stroke="#9DAAF1"
    />
    <path
      d="M5 33.3494C5 33.3494 5.54794 26.1121 11.0263 21.9357C16.5047 17.7592 24.1744 21.3921 24.1744 21.3921"
      stroke="#22307C"
    />
    <path
      d="M10.2688 34.1839C10.2688 34.1839 10.7567 32.157 11.1201 31.147C11.4834 30.1372 12.1968 28.6802 12.1968 28.6802"
      stroke="#22307C"
    />
  </svg>
);
