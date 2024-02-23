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
import { Typography, useOdysseyDesignTokens } from '@okta/odyssey-react-mui';
import { FunctionComponent, h } from 'preact';
import { AuthCoinProps } from 'src/types';

import { loc } from '../../util';
import AuthCoin from '../AuthCoin/AuthCoin';
import { getAuthCoinConfiguration } from '../AuthCoin/authCoinConfigUtil';
import Image from '../Image';

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
  const containerTestIds = `okta-sign-in-header auth-header ${showAuthCoin ? 'authCoinSpacing' : ''}`;
  const tokens = useOdysseyDesignTokens();

  function renderAuthCoin() {
    return (showAuthCoin && authCoinProps) && (
      <AuthCoin
        authenticatorKey={authCoinProps.authenticatorKey}
        url={authCoinProps.url}
        theme={authCoinProps.theme}
        sx={{
          margin: 'auto',
          insetBlockStart: '26px',
          borderRadius: '24px',
          backgroundColor: tokens.HueNeutralWhite,
        }}
      />
    );
  }

  return (
    <Box
      data-se={containerTestIds}
      sx={{
        paddingBlockStart: tokens.Spacing5,
        paddingBlockEnd: showAuthCoin ? tokens.Spacing1 : tokens.Spacing5,
        paddingInlineStart: tokens.Spacing6,
        paddingInlineEnd: tokens.Spacing6,
        borderBlockEnd: `1px solid ${tokens.BorderColorDisplay}`,
        '& h1': {
          lineHeight: 0,
          marginBlock: 0,
          textAlign: 'center',
        },
      }}
    >
      <Typography variant="h1">
        { logo && (
          <Image
            alt={logoText || brandName || loc('logo.default.alt.text', 'login')}
            src={logo}
            testId="auth-org-logo"
            maxWidth="200px"
            maxHeight="40px"
          />
        )}
      </Typography>
      { renderAuthCoin() }
    </Box>
  );
};

export default AuthHeader;
