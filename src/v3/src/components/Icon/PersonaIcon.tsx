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

export const PersonaIcon: FunctionComponent<IconProps> = ({
  name, description, width, height,
}) => (
  <svg
    width={width || 36}
    height={height || 36}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-labelledby={name}
    role="img"
  >
    <title id={name}>{description}</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.8842 4C10.8223 4 7 7.65595 7 12.5761V28H11.3388V21.118H15.8842C20.9461 21.118 24.7683 17.462 24.7683 12.5761C24.7683 7.65595 20.9461 4 15.8842 4ZM20.4295 12.5761C20.4295 9.84265 18.4668 7.96345 15.8842 7.96345C13.3015 7.96345 11.3388 9.84265 11.3388 12.5761V17.1545H15.8842C18.4668 17.1545 20.4295 15.2753 20.4295 12.5761Z"
      fill="#2F4EF7"
    />
  </svg>
);
