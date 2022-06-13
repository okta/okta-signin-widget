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

import { Box } from '@okta/odyssey-react';
import { withTheme } from '@okta/odyssey-react-theme';
import classNames from 'classnames';
import { FunctionComponent, h } from 'preact';
import { AuthCoinProps } from 'src/types';

import { theme } from './AuthCoin.theme';
import AuthenticatorConfig from './authenticatorConfiguration';
import style from './style.module.css';

const AuthCoin: FunctionComponent<AuthCoinProps> = (props) => {
  const {
    authenticatorKey,
    url,
    customClasses,
  } = props;

  const containerClasses = classNames(style.iconContainer, customClasses);

  const authCoinConfig = AuthenticatorConfig[authenticatorKey];

  function createAuthCoinImage() {
    // TODO: OKTA-467022 - Add warning when attempted to customize non-customizeable authenticator
    // if URL is provided it should be with an authenticator
    // key that can be customized or custom push app
    if (url && (authCoinConfig?.customizable || !authCoinConfig?.icon)) {
      return (
        <img
          src={url}
          alt={authCoinConfig.description}
          className={style.customAuthImage}
        />
      );
    }
    const Icon = authCoinConfig?.icon;
    return Icon && <Icon />;
  }

  return authCoinConfig && (
    // @ts-ignore OKTA-471233
    <Box className={containerClasses}>
      { createAuthCoinImage() }
    </Box>
  );
};

export default withTheme(theme, style)(AuthCoin);
