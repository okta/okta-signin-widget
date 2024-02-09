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
import { useOdysseyDesignTokens } from '@okta/odyssey-react-mui';
import { FunctionComponent, h } from 'preact';

import { AuthCoinProps } from '../../types';
import Image from '../Image';
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

  const containerTestIds = `factor-beacon ${authCoinConfigByAuthKey?.iconClassName} ${customClasses ? customClasses?.join(' ') : ''}`;
  const tokens = useOdysseyDesignTokens();

  function createAuthCoinIcon() {
    // TODO: OKTA-467022 - Add warning when attempted to customize non-customizeable authenticator
    // if URL is provided it should be with an authenticator
    // key that can be customized or custom push app
    if (url && (authCoinConfigByAuthKey?.customizable || !authCoinConfigByAuthKey?.icon)) {
      return (
        <Image
          src={url}
          alt={authCoinConfigByAuthKey.description}
          width={tokens.Spacing7}
          height={tokens.Spacing7}
          testId="custom-logo"
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
        width={tokens.Spacing7}
        height={tokens.Spacing7}
      />
    );
  }

  return authCoinConfigByAuthKey && (
    <Box
      data-se={containerTestIds}
      aria-hidden
      sx={{
        position: 'relative',
        inlineSize: tokens.Spacing7,
        blockSize: tokens.Spacing7,
        paddingBlock: tokens.Spacing0,
        ...sx,
      }}
    >
      { createAuthCoinIcon() }
    </Box>
  );
};

export default AuthCoin;
