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

import { Box } from '@okta/odyssey-react-mui';
import classNames from 'classnames';
import { FunctionComponent, h } from 'preact';

import { AuthCoinProps } from '../../types';
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

  function createAuthCoinIcon() {
    // TODO: OKTA-467022 - Add warning when attempted to customize non-customizeable authenticator
    // if URL is provided it should be with an authenticator
    // key that can be customized or custom push app
    if (url && (authCoinConfig?.customizable || !authCoinConfig?.icon)) {
      return (
        <Box
          as="img"
          src={url}
          alt={authCoinConfig.description}
          className="custom-logo"
          sx={{
            width: (theme) => theme.spacing(6),
            height: (theme) => theme.spacing(6),
          }}
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
      sx={(theme) => ({
        '--PrimaryFill': theme.palette.primary.main,
        '--SecondaryFill': theme.palette.primary.light,
        '--BackgroundFill': theme.palette.grey[50],
      })}
    >
      { createAuthCoinIcon() }
    </Box>
  );
};

export default AuthCoin;
