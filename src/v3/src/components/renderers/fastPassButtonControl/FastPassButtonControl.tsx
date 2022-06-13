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

import {
  and, ControlProps, optionIs, rankWith,
} from '@jsonforms/core';
import { FunctionComponent, h } from 'preact';
import { ClickHandler } from 'src/types';

import SocialIcons from '../../SocialButton/icons';
import SocialButton from '../../SocialButton/SocialButton';

const FastPassButtonControl: FunctionComponent<ControlProps> = ({
  uischema,
  visible,
}) => {
  const deviceChallengeUrl: string | null = uischema.options?.deviceChallengeUrl;

  const onClick: ClickHandler = (event) => {
    event.preventDefault();

    // forward user
    if (deviceChallengeUrl) {
      window.location.href = deviceChallengeUrl;
    }
  };

  return visible ? (
    <SocialButton
      Icon={SocialIcons.oktaIcon}
      text="Sign in with Okta FastPass"
      authenticator="fastpass"
      onClick={onClick}
    />
  ) : null;
};

export const tester = rankWith(
  11,
  and(
    optionIs('format', 'button'),
    optionIs('type', 'signInWithFastPass'),
  ),
);

export default FastPassButtonControl;
