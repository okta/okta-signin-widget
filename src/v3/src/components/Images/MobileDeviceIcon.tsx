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

import { loc } from '../../util/locUtil';

export const MobileDeviceIcon: FunctionComponent = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-hidden="true"
  >
    <title id="mobile-icon">
      {loc('icon.title.browser', 'login')}
    </title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.5 1H5.5C4.94772 1 4.5 1.44772 4.5 2V14C4.5 14.5523 4.94772 15 5.5 15H11.5C12.0523 15 12.5 14.5523 12.5 14V2C12.5 1.44772 12.0523 1 11.5 1ZM5.5 0C4.39543 0 3.5 0.895431 3.5 2V14C3.5 15.1046 4.39543 16 5.5 16H11.5C12.6046 16 13.5 15.1046 13.5 14V2C13.5 0.895431 12.6046 0 11.5 0H5.5ZM10 13V14H7V13H10ZM8.5 3C8.77614 3 9 2.77614 9 2.5C9 2.22386 8.77614 2 8.5 2C8.22386 2 8 2.22386 8 2.5C8 2.77614 8.22386 3 8.5 3Z"
      fill="#1662DD"
      class="siwIconFillPrimary"
    />
  </svg>
);
