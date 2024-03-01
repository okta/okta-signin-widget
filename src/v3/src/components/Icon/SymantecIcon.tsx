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

export const SymantecIcon: FunctionComponent<IconProps> = ({
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
      fill="#FDB511"
      d="M40.92 5v1.046H42V5h-1.08Zm0 2.092v1.046H42V7.092h-1.08Zm-3.243 1.046v1.047h1.08V8.138h-1.08Zm-14.141.784C14.954 8.922 8 15.654 8 23.96 8 32.267 14.954 39 23.536 39c8.581 0 15.536-6.732 15.536-15.04 0-8.307-6.955-15.038-15.535-15.038h-.001Zm0 4.796c5.839 0 10.583 4.59 10.583 10.242 0 5.652-4.744 10.244-10.583 10.244-5.84 0-10.537-4.591-10.537-10.244 0-5.652 4.698-10.242 10.537-10.242Z"
    />
    <path
      fill="#000"
      d="M39.839 6.046v1.046h1.08V6.046h-1.08Zm0 1.046h-2.162v1.046h2.162V7.092Zm-2.162 1.046h-1.08v2.093h1.08V8.138Zm0 2.093v1.046h1.08V10.23h-1.08Zm1.08 0h1.082V9.185h-1.081v1.046Zm-1.08 1.046h-1.08v1.046h-1.082v-1.046h-2.161v1.046h-1.08v1.046h1.08v1.046h-1.08V13.37h-1.082v1.046h-1.08v1.046H29.03v4.185h2.161V18.6h1.081v-1.046h1.08v-1.046h-1.08V15.46h1.08v1.047h1.082V15.46h1.08v-1.046h1.081V13.37h1.08v-2.092Zm-2.162 0h1.081V10.23h-1.08v1.046Zm0-1.046V9.185h-1.08v1.046h1.08Z"
    />
    <path
      fill="#000"
      d="M23.294 24.178c1.124-2.76 1.834-4.259 4.656-7.67l2.162-.002v4.185c-3.005 2.77-3.643 5.076-4.136 7.306-.304 1.36-.304 2.145-1.898 2.328-.298 0-1.076-.254-1.398-.828-.403-.724-1.602-3.501-2.566-5.188-.822-1.438-2.008-2.61-3.063-3.879-.402-.484-.608-.895-.27-1.352.337-.456.582-.385 1.08-.26 2.636 1.14 4.158 2.863 5.433 5.36Z"
    />
  </svg>
);
