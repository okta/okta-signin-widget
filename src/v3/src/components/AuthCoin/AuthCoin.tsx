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

import { Box } from '@mui/material';
import { withTheme } from '@okta/odyssey-react-theme';
import classNames from 'classnames';
import { FunctionComponent, h } from 'preact';
import { AuthCoinProps } from 'src/types';

import { theme } from './AuthCoin.theme';
import AuthCoinByAuthenticatorKey from './AuthCoinConfig';
import style from './style.module.css';

const AuthCoin: FunctionComponent<AuthCoinProps> = (props) => {
  const {
    authenticatorKey,
    url,
    customClasses,
    name: authcoinName,
    description: authcoinDescr,
  } = props;

  const authCoinConfig = AuthCoinByAuthenticatorKey[authenticatorKey];

  const containerClasses = classNames(
    style.iconContainer,
    authCoinConfig?.iconClassName,
    customClasses,
  );
  const customLogoClasses = classNames(
    style.customAuthImage,
    'custom-logo',
  );

  function createAuthCoinIcon() {
    // TODO: OKTA-467022 - Add warning when attempted to customize non-customizeable authenticator
    // if URL is provided it should be with an authenticator
    // key that can be customized or custom push app
    if (url && (authCoinConfig?.customizable || !authCoinConfig?.icon)) {
      return (
        <img
          src={url}
          alt={authCoinConfig.description}
          className={customLogoClasses}
        />
      );
    }
    const name = authcoinName || authCoinConfig?.name;
    const description = authcoinDescr || authCoinConfig?.description;
    const AuthCoinIcon = authCoinConfig?.icon;
    return AuthCoinIcon && (
      <AuthCoinIcon
        name={name}
        description={description}
      />
    );
  }

  return authCoinConfig && (
    <Box
      className={containerClasses}
      data-se="factor-beacon"
    >
      { createAuthCoinIcon() }
    </Box>
  );
};

export default withTheme(theme, style)(AuthCoin);
