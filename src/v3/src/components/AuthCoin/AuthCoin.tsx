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
import classNames from 'classnames';
import { FunctionComponent, h } from 'preact';
import { AuthCoinProps } from 'src/types';

import AuthenticatorConfig from './authenticatorConfiguration';
import style from './style.scss';

const AuthCoin: FunctionComponent<AuthCoinProps> = (props) => {
  const {
    authenticatorKey,
    url,
    theme,
    customClasses,
  } = props;

  const containerClasses = classNames(style.iconContainer, customClasses);

  const authCoinConfig = AuthenticatorConfig[authenticatorKey];

  const createStyleClass = (
    className: string,
    classConfiguration: Array<{ attribute: string; value?: string | number; valueSuffix?: string }>,
  ): string => {
    let classAttributes = '';

    classConfiguration.forEach((map) => {
      if (map.value) {
        const value = map.valueSuffix ? `${map.value}${map.valueSuffix};` : `${map.value}`;
        classAttributes += ` ${map.attribute}: ${value}; `;
      }
    });

    return classAttributes ? ` .${className} { ${classAttributes} } ` : '';
  };

  function createCustomStyle() {
    let styleContent = createStyleClass('siwFillPrimary', [{ attribute: 'fill', value: theme?.primaryColor }]);
    styleContent += createStyleClass('siwFillSecondary', [{ attribute: 'fill', value: theme?.secondaryColor }]);
    styleContent += createStyleClass('siwFillBg', [{ attribute: 'fill', value: theme?.backgroundColor }]);
    styleContent += createStyleClass(
      'customAuthImage',
      [
        { attribute: 'width', value: theme?.width, valueSuffix: 'px' },
        { attribute: 'height', value: theme?.height, valueSuffix: 'px' },
      ],
    );

    // TODO: OKTA-467022 - Add warning when attempted to customize non-customizeable authenticator
    return (authCoinConfig?.customizable && theme) && (
      <style>
        { styleContent }
      </style>
    );
  }

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
      { createCustomStyle() }
      { createAuthCoinImage() }
    </Box>
  );
};

export default AuthCoin;
