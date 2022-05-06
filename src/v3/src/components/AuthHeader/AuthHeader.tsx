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

import { Heading } from '@okta/odyssey-react';
import classNames from 'classnames/bind';
import { FunctionComponent, h } from 'preact';
import { AuthCoinProps } from 'src/types';

import AuthCoin from '../AuthCoin/AuthCoin';
import AuthenticatorConfiguration from '../AuthCoin/authenticatorConfiguration';
import style from './style.scss';

const cx = classNames.bind(style);
const DEFAULT_LOGO = '/img/atko_brand_logo.svg'; // TODO: Need to retrieve default Okta Brand Logo

// TODO: maybe extract to util class if used reused
const shouldRenderAuthCoin = (props?: AuthCoinProps): boolean => {
  const authCoinConfig = props?.authenticatorKey
    && AuthenticatorConfiguration[props?.authenticatorKey];
  if (!authCoinConfig) {
    return false;
  }

  if (!authCoinConfig.icon && !props.url) {
    return false;
  }

  return true;
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
    <div className={containerClasses}>
      <Heading level="1">
        <img
          alt={logoText || (logo && brandName ? brandName : 'Logo')}
          src={logo || DEFAULT_LOGO}
          className={imageClasses}
        />
      </Heading>
      { renderAuthCoin() }
    </div>
  );
};

export default AuthHeader;
