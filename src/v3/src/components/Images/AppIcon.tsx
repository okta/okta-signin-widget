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

import { loc } from '../../util';

export const AppIcon: FunctionComponent = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-hidden="true"
  >
    <title>
      {loc('icon.title.application', 'login')}
    </title>
    <rect
      x="1.5"
      y="1.5"
      width="5"
      height="5"
      stroke="#1662DD"
      class="siwIconStrokePrimary"
    />
    <rect
      x="1.5"
      y="9.5"
      width="5"
      height="5"
      stroke="#1662DD"
      class="siwIconStrokePrimary"
    />
    <rect
      x="9.5"
      y="9.5"
      width="5"
      height="5"
      stroke="#1662DD"
      class="siwIconStrokePrimary"
    />
    <rect
      x="9.5"
      y="1.5"
      width="5"
      height="5"
      stroke="#1662DD"
      class="siwIconStrokePrimary"
    />
  </svg>
);
