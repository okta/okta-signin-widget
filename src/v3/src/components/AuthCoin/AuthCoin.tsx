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
import { Box } from '@okta/odyssey-react-mui-legacy';
import classNames from 'classnames';
import { FunctionComponent, h } from 'preact';

import { AuthCoinProps } from '../../types';
import { getAuthCoinConfiguration } from './authCoinConfigUtil';

const AuthCoin: FunctionComponent<AuthCoinProps> = (props) => {
  const {
    authenticatorKey,
    url,
    customClasses,
    name: authcoinName,
    description: authcoinDescr,
    sx,
  } = props;

  const authCoinConfiguration = getAuthCoinConfiguration();
  const authCoinConfigByAuthKey = authCoinConfiguration[authenticatorKey];

  const containerClasses = classNames(authCoinConfigByAuthKey?.iconClassName, customClasses);
  const tokens = useOdysseyDesignTokens();

  function createAuthCoinIcon() {
    // TODO: OKTA-467022 - Add warning when attempted to customize non-customizeable authenticator
    // if URL is provided it should be with an authenticator
    // key that can be customized or custom push app
    if (url && (authCoinConfigByAuthKey?.customizable || !authCoinConfigByAuthKey?.icon)) {
      return (
        <Box
          as="img"
          src={url}
          alt={authCoinConfigByAuthKey.description}
          className="custom-logo"
          sx={{
            width: tokens.Spacing7,
            height: tokens.Spacing7,
          }}
        />
      );
    }
    const name = authcoinName || authCoinConfigByAuthKey?.name;
    const description = authcoinDescr || authCoinConfigByAuthKey?.description;
    const AuthCoinIcon = authCoinConfigByAuthKey?.icon;
    return AuthCoinIcon && (
      <AuthCoinIcon
        name={name}
        description={description}
      />
    );
  }

  return authCoinConfigByAuthKey && (
    <Box
      className={containerClasses}
      data-se="factor-beacon"
      aria-hidden
      sx={{
        position: 'relative',
        background: 'white',
        inlineSize: '54px',
        blockSize: '48px',
        paddingBlock: 0,
        paddingInline: '3px',
        ...sx,
      }}
    >
      { createAuthCoinIcon() }
    </Box>
  );
};

export default AuthCoin;
