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

export const PasswordIcon: FunctionComponent<IconProps> = ({
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
      d="M11 17h-1V9h8v1h-7v7Zm28 0h-1v-7h-7V9h8v8ZM18 39h-8v-8h1v7h7v1Zm21 0h-8v-1h7v-7h1v8Z"
      class="siwFillSecondary"
    />
    <path
      fill="#00297A"
      d="m14.91 22.067-1.829 1.064V21h-1v2.131l-1.83-1.064-.502.866L11.585 24l-1.836 1.067.502.866 1.83-1.064V27h1v-2.131l1.829 1.064.503-.866L13.576 24l1.837-1.067-.503-.866Zm7.946 0-1.829 1.064V21h-1v2.131l-1.829-1.064-.503.866L19.531 24l-1.836 1.067.503.866 1.83-1.064V27h1v-2.131l1.828 1.064.503-.866L21.523 24l1.836-1.067-.503-.866Zm7.946 0-1.829 1.064V21h-1v2.131l-1.829-1.064-.503.866L27.477 24l-1.836 1.067.503.866 1.83-1.064V27h1v-2.131l1.828 1.064.503-.866L29.47 24l1.836-1.067-.503-.866Zm8.448.866-.501-.866-1.83 1.064V21h-1v2.131l-1.83-1.064-.502.866L35.424 24l-1.837 1.067.503.866 1.829-1.064V27h1v-2.131l1.83 1.064.502-.866L37.415 24l1.836-1.067Z"
      class="siwFillPrimaryDark"
    />
  </svg>
);
