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

export const RightArrowIcon: FunctionComponent<IconProps> = ({ name, description }) => (
  <svg
    width="14"
    height="11"
    viewBox="0 0 14 11"
    xmlns="http://www.w3.org/2000/svg"
    aria-labelledby={name}
    fill="currentColor"
    role="img"
  >
    <title id={name}>{description}</title>
    <path d="M0 6.5H8V10.5L13.8158 5.8842C13.8734 5.83728 13.9198 5.77855 13.9517 5.71217C13.9835 5.64579 14 5.5734 14 5.5001C14 5.42681 13.9835 5.35441 13.9517 5.28803C13.9198 5.22165 13.8734 5.16292 13.8158 5.116L8 0.5V4.5H0V6.5Z" />
  </svg>
);
