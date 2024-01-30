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

import { useOdysseyDesignTokens } from '@okta/odyssey-react-mui';
import { FunctionComponent, h } from 'preact';

import { loc } from '../../util';

export const YubikeyDemoImage: FunctionComponent = () => {
  const tokens = useOdysseyDesignTokens();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={tokens.Spacing9}
      height={tokens.Spacing9}
      fill="none"
      role="img"
      viewBox="0 0 43 58"
      aria-hidden="true"
    >
      <title>{loc('factor.totpHard.yubikey', 'login')}</title>
      <path
        fill="#00297A"
        fillRule="evenodd"
        d="M10.61 0a9 9 0 0 0-9 9v.5a8.5 8.5 0 0 0 8.5 8.5v-2a6.5 6.5 0 0 1-6.5-6.5V9a7 7 0 0 1 7-7h13v14h-5.75v2h7.75v-3h8V3h-8V0h-15Zm15 5v8h6V5h-6Z"
        class="siwIconFillPrimaryDark"
        clipRule="evenodd"
      />
      <path
        fill="#A7B5EC"
        fillRule="evenodd"
        d="M25.61 6.5h4v2h-4v-2Zm0 3h4v2h-4v-2Zm-15.356 2.486a2.986 2.986 0 0 1 5.973 0V32.86a1 1 0 1 0 2 0v-4.892a2 2 0 0 1 2-2h2.13a2 2 0 0 1 2 2v7.475a1 1 0 1 0 2 0v-1.047c0-1.633 1.352-2.975 3.005-2.975 1.619 0 2.944 1.315 2.944 2.914v5.764a1 1 0 1 0 2 0v-.614a3.042 3.042 0 1 1 6.084 0v4.683h2v-4.683a5.042 5.042 0 0 0-8.084-4.022v-1.128c0-2.724-2.24-4.914-4.944-4.914a5.003 5.003 0 0 0-3.006 1.002v-2.455a4 4 0 0 0-4-4h-2.13c-.728 0-1.411.195-2 .535V11.986a4.986 4.986 0 0 0-9.972 0v19.607c-1.398.5-2.847 1.495-4.072 2.492A29.391 29.391 0 0 0 .935 37.18l-.155.175-.062.226c-.146.542-.128 1.168-.044 1.783.086.633.254 1.345.478 2.1.447 1.509 1.139 3.276 1.93 5.082 1.581 3.616 3.6 7.483 4.977 9.943l.489.872 1.745-.977-.489-.873c-1.356-2.421-3.342-6.227-4.89-9.767-.776-1.772-1.431-3.453-1.845-4.849a12.468 12.468 0 0 1-.414-1.8 3.726 3.726 0 0 1-.038-.795 27.872 27.872 0 0 1 2.828-2.664c.943-.768 1.918-1.44 2.81-1.874v8.552a1 1 0 1 0 2 0V11.986Z"
        class="siwIconFillSecondary"
        clipRule="evenodd"
      />
    </svg>
  );
};
