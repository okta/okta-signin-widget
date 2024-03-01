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

export const SecurityKeyOrBiometricsIcon: FunctionComponent<IconProps> = (
  {
    name, description, width, height,
  },
) => (
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
      d="M24 17V9h-9v8h-3v15.5a2.5 2.5 0 0 0 2.5 2.5h6.34a8.58 8.58 0 0 1-.38-1H14.5a1.5 1.5 0 0 1-1.5-1.5V18h13v3.84a8.58 8.58 0 0 1 1-.38V17h-3Zm-8 0v-7h7v7h-7Z"
      class="siwFillPrimaryDark"
    />
    <path
      fill="#00297A"
      d="M19.5 25a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Zm0-4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"
      class="siwFillPrimaryDark"
    />
    <path
      fill="#A7B5EC"
      d="M30 40a9 9 0 1 1 9-9 9.01 9.01 0 0 1-9 9Zm0-17a8 8 0 1 0 8 8 8.009 8.009 0 0 0-8-8Z"
      class="siwFillSecondary"
    />
    <path
      fill="#A7B5EC"
      d="M32.084 36.019a.472.472 0 0 1-.319-.112.501.501 0 0 1-.159-.532c.43-1.389 1.274-4.787-.119-6.352a1.962 1.962 0 0 0-1.946-.6 1.93 1.93 0 0 0-1.387 2.354c.007.024.666 2.823-.966 4.55a.5.5 0 1 1-.727-.685c1.24-1.314.728-3.6.723-3.622a2.933 2.933 0 0 1 2.106-3.566 2.977 2.977 0 0 1 2.944.906c1.67 1.875.922 5.386.328 7.312a.5.5 0 0 1-.478.347Z"
      class="siwFillSecondary"
    />
    <path
      fill="#A7B5EC"
      d="M28.63 37.25a.5.5 0 0 1-.359-.849c2.235-2.3 1.345-5.782 1.336-5.817a.5.5 0 0 1 .966-.259c.045.165 1.052 4.067-1.586 6.774a.5.5 0 0 1-.358.151Z"
      class="siwFillSecondary"
    />
    <path
      fill="#A7B5EC"
      d="M34.88 35.2a.5.5 0 0 1-.488-.612c.493-2.2.716-5.235-1.03-7.2a4.508 4.508 0 0 0-4.455-1.357 4.416 4.416 0 0 0-2.72 2.069 4.2 4.2 0 0 0-.468 3.2 3.1 3.1 0 0 1-.355 2.347.5.5 0 1 1-.728-.685 2.37 2.37 0 0 0 .11-1.434 5.174 5.174 0 0 1 .577-3.939 5.42 5.42 0 0 1 3.333-2.518 5.524 5.524 0 0 1 5.453 1.66c1.628 1.832 2.051 4.551 1.257 8.082a.5.5 0 0 1-.487.387Z"
      class="siwFillSecondary"
    />
  </svg>
);
