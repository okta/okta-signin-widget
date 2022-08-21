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

import { Box, Typography } from '@mui/material';
import * as Tokens from '@okta/odyssey-design-tokens';
import { withTheme } from '@okta/odyssey-react-theme';
import classNames from 'classnames';
import { h } from 'preact';

import { useWidgetContext } from '../../contexts';
import { useAutoFocus, useOnSubmit } from '../../hooks';
import {
  AuthenticatorButtonElement,
  ClickHandler,
  UISchemaElementComponent,
} from '../../types';
import { getTranslation } from '../../util';
import AuthCoin from '../AuthCoin/AuthCoin';
import ArrowRight from './arrow-right.svg';
import { theme } from './AuthenticatorButton.theme';
import style from './styles.module.css';

const AuthenticatorButton: UISchemaElementComponent<{
  uischema: AuthenticatorButtonElement
}> = ({ uischema }) => {
  const ctaButtonClasses = classNames('cta-button', style.actionName);
  const {
    translations,
    focus,
    options: {
      key: authenticationKey,
      actionParams,
      description,
      usageDescription,
      ctaLabel,
      dataSe,
    },
  } = uischema;
  const label = getTranslation(translations!, 'label');
  const { idxTransaction } = useWidgetContext();
  const onSubmitHandler = useOnSubmit();
  const focusInput = useAutoFocus(focus);

  const onClick: ClickHandler = async () => {
    // TODO: pass step from uischema
    const { name: step } = idxTransaction!.nextStep!;
    onSubmitHandler({
      params: actionParams,
      includeData: true,
      step,
    });
  };

  return (
    <Box
      display="flex"
      padding={2}
      border={1}
      borderColor="grey.200"
      borderRadius={Tokens.BorderRadiusBase}
      boxShadow={Tokens.ShadowScale0}
      className={style.authButton}
      role="button"
      data-se="authenticator-button"
      tabIndex={0}
      onClick={onClick}
      onKeyPress={onClick}
      ref={focusInput}
    >
      { authenticationKey && (
        <Box data-se="authenticator-icon">
          <AuthCoin authenticatorKey={authenticationKey} />
        </Box>
      )}
      <Box className={style.infoSection}>
        <Box
          className={style.title}
          data-se="authenticator-button-label"
        >
          {label}
        </Box>
        {description && (
          <Box
            className={style.description}
            data-se="authenticator-button-description"
          >
            {description}
          </Box>
        )}
        {usageDescription && (
          <Typography
            className={style.description}
            variant="caption"
            data-se="authenticator-button-usage-text"
          >
            {usageDescription}
          </Typography>
        )}
        <Box
          className={ctaButtonClasses}
          data-se={dataSe}
        >
          <Box
            component="span"
            data-se="cta-button-label"
          >
            {ctaLabel}
          </Box>
          <ArrowRight />
        </Box>
      </Box>
    </Box>
  );
};
export default withTheme(theme, style)(AuthenticatorButton);
