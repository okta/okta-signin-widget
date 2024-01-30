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

export const PhoneIcon: FunctionComponent = () => {
  const tokens = useOdysseyDesignTokens();

  return (
    <svg
      width={tokens.Spacing9}
      height={tokens.Spacing9}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-hidden="true"
    >
      <title>
        {loc('icon.title.mobileDevice', 'login')}
      </title>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21.7496 62.7498H44.2496C45.957 62.6872 47.5708 61.9538 48.7409 60.7089C49.9109 59.4639 50.5429 57.8078 50.4996 56.0998V6.99981C50.5564 5.28333 49.9304 3.61435 48.7589 2.35851C47.5874 1.10268 45.9659 0.362378 44.2496 0.299805H21.7496C20.0334 0.362378 18.4119 1.10268 17.2404 2.35851C16.0689 3.61435 15.4429 5.28333 15.4996 6.99981V28.1311H17.9996V6.99981C17.9658 6.47429 18.036 5.94727 18.2063 5.44896C18.3766 4.95065 18.6436 4.49087 18.992 4.09601C19.3404 3.70114 19.7634 3.37896 20.2366 3.14794C20.7098 2.91693 21.224 2.78163 21.7496 2.74981L44.2496 2.7998C45.3021 2.86429 46.2865 3.34172 46.9888 4.12826C47.691 4.91479 48.0543 5.9468 47.9996 6.99981V56.0498C48.0335 56.5753 47.9633 57.1023 47.793 57.6007C47.6227 58.099 47.3557 58.5587 47.0073 58.9536C46.6589 59.3485 46.2359 59.6707 45.7627 59.9017C45.2895 60.1327 44.7753 60.268 44.2496 60.2998H21.7496C20.6972 60.2353 19.7128 59.7579 19.0105 58.9714C18.3082 58.1848 17.9449 57.1528 17.9996 56.0998V34.6311H15.4996V56.0498C15.4429 57.7663 16.0689 59.4353 17.2404 60.6911C18.4119 61.9469 20.0334 62.6872 21.7496 62.7498ZM38 55.25H28V57.75H38V55.25ZM33 5.25C34.3807 5.25 35.5 6.36929 35.5 7.75C35.5 9.13071 34.3807 10.25 33 10.25C31.6193 10.25 30.5 9.13071 30.5 7.75C30.5 6.36929 31.6193 5.25 33 5.25Z"
        fill="#00297A"
        class="siwIconFillPrimaryDark"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M26.2191 32.6309L20.85 38L22.62 39.76L31 31.38L22.62 23L20.85 24.76L26.2209 30.1309H2.98047V32.6309H26.2191Z"
        fill="#A7B5EC"
        class="siwIconFillSecondary"
      />
    </svg>
  );
};
