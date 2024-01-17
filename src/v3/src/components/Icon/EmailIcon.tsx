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

export const EmailIcon: FunctionComponent<IconProps> = ({
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
      fill="#A7B5EC"
      d="M32 18v1h5.3L32 24.29v1.42l6-6.01v12.8a1.5 1.5 0 0 1-1.5 1.5h-17a1.5 1.5 0 0 1-1.5-1.5V31h-1v1.5a2.5 2.5 0 0 0 2.5 2.5h17a2.5 2.5 0 0 0 2.5-2.5V18h-7Z"
      class="siwFillSecondary"
    />
    <path
      fill="#00297A"
      d="M9 13v14.5a2.5 2.5 0 0 0 2.5 2.5h17a2.5 2.5 0 0 0 2.5-2.5V13H9Zm20.293 1-8.81 8.81L10.794 14h18.499ZM28.5 29h-17a1.5 1.5 0 0 1-1.5-1.5V14.63l10.517 9.56L30 14.707V27.5a1.5 1.5 0 0 1-1.5 1.5Z"
      class="siwFillPrimaryDark"
    />
  </svg>
);
