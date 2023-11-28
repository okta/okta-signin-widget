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
import { Box, Typography } from '@okta/odyssey-react-mui-legacy';
import classNames from 'classnames';
import { FunctionComponent, h } from 'preact';
import { AuthCoinProps } from 'src/types';

import { loc } from '../../util';
import AuthCoin from '../AuthCoin/AuthCoin';
import { getAuthCoinConfiguration } from '../AuthCoin/authCoinConfigUtil';

// TODO: maybe extract to util class if used reused
const shouldRenderAuthCoin = (props?: AuthCoinProps): boolean => {
  const authCoinConfiguration = getAuthCoinConfiguration();
  const authCoinConfigByAuthKey = props?.authenticatorKey
    && authCoinConfiguration[props?.authenticatorKey];

  return typeof authCoinConfigByAuthKey !== 'undefined'
    || typeof props?.url !== 'undefined';
};

export type AuthHeaderProps = {
  logo?: string;
  logoText?: string;
  brandName?: string;
  authCoinProps?: AuthCoinProps;
};
const AuthHeader: FunctionComponent<AuthHeaderProps> = ({
  logo,
  logoText,
  brandName,
  authCoinProps,
}) => {
  const showAuthCoin = shouldRenderAuthCoin(authCoinProps);
  const containerClasses = classNames('okta-sign-in-header', 'auth-header', { authCoinSpacing: showAuthCoin });
  const imageClasses = classNames('auth-org-logo', 'siwOrgLogo');
  const Tokens = useOdysseyDesignTokens();

  function renderAuthCoin() {
    return (showAuthCoin && authCoinProps) && (
      <AuthCoin
        authenticatorKey={authCoinProps.authenticatorKey}
        url={authCoinProps.url}
        theme={authCoinProps.theme}
        sx={{
          margin: 'auto',
          insetBlockStart: '24px',
        }}
      />
    );
  }

  return (
    <Box
      className={containerClasses}
      sx={{
        paddingBlockStart: Tokens.Spacing5,
        paddingBlockEnd: showAuthCoin ? Tokens.Spacing1 : Tokens.Spacing5,
        paddingInlineStart: Tokens.Spacing6,
        paddingInlineEnd: Tokens.Spacing6,
        borderBlockEnd: `1px solid ${Tokens.BorderColorDisplay}`,
        '& h1': {
          lineHeight: 0,
          marginBlock: 0,
          textAlign: 'center',
        },
      }}
    >
      <Typography variant="h1">
        { logo && (
          <Box
            component="img"
            alt={logoText || brandName || loc('logo.default.alt.text', 'login')}
            src={logo}
            className={imageClasses}
            sx={{
              maxInlineSize: '200px',
              maxBlockSize: '40px',
            }}
          />
        )}
      </Typography>
      { renderAuthCoin() }
    </Box>
  );
};

export default AuthHeader;
