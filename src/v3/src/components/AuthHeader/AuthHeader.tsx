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

import { Box, Typography } from '@okta/odyssey-react-mui';
import classNames from 'classnames/bind';
import { FunctionComponent, h } from 'preact';
import { AuthCoinProps } from 'src/types';

import { loc } from '../../util';
import AuthCoin from '../AuthCoin/AuthCoin';
import { getAuthCoinConfiguration } from '../AuthCoin/authCoinConfigUtil';
import style from './style.module.css';

const cx = classNames.bind(style);

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
  const containerClasses = cx('okta-sign-in-header', 'auth-header', 'siwHeader', { authCoinSpacing: showAuthCoin });
  const imageClasses = cx('auth-org-logo', 'siwOrgLogo');

  function renderAuthCoin() {
    return (showAuthCoin && authCoinProps) && (
      <AuthCoin
        customClasses={style.authCoinOverlay}
        authenticatorKey={authCoinProps.authenticatorKey}
        url={authCoinProps.url}
        theme={authCoinProps.theme}
      />
    );
  }

  return (
    <Box
      className={containerClasses}
      sx={{
        paddingTop: (theme) => theme.spacing(4),
        paddingRight: (theme) => theme.spacing(5),
        paddingBottom: (theme) => theme.spacing(showAuthCoin ? 0 : 4),
        paddingLeft: (theme) => theme.spacing(5),
        borderBottom: (theme) => `1px solid ${theme.palette.grey[400]}`,
      }}
    >
      <Typography variant="h1">
        { logo && (
          <img
            alt={logoText || brandName || loc('logo.default.alt.text', 'login')}
            src={logo}
            className={imageClasses}
          />
        )}
      </Typography>
      { renderAuthCoin() }
    </Box>
  );
};

export default AuthHeader;
