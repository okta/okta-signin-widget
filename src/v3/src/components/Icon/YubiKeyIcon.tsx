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

export const YubiKeyIcon: FunctionComponent<IconProps> = ({
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
    <circle
      cx="24"
      cy="24"
      r="18.5"
      fill="#fff"
      stroke="#A3C753"
      strokeWidth="3"
    />
    <path
      fill="#A3C753"
      d="m24.406 23.977 1.416-3.996c.723-2.04 1.454-4.08 2.16-6.127.13-.382.328-.525.722-.52 1.466.014 2.933.004 4.4.006.7.001.748.064.49.701-.66 1.62-1.33 3.236-1.988 4.856-1.165 2.872-2.319 5.748-3.486 8.618-1.098 2.7-2.205 5.397-3.315 8.092-.396.961-.405.957-1.472.958-1.417.001-2.833.004-4.25 0-.605-.002-.646-.077-.407-.636.746-1.747 1.482-3.497 2.236-5.24.15-.345.16-.658.022-1.009-1.836-4.666-3.664-9.334-5.494-14.002-.23-.589-.468-1.176-.695-1.767-.164-.425-.084-.564.361-.567 1.6-.01 3.2 0 4.8-.01.38-.002.52.227.63.527.5 1.36 1.004 2.72 1.506 4.08l2.095 5.671c.045.122.101.241.151.361l.118.004Z"
    />
  </svg>
);
