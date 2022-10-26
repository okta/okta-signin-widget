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
import { useAutoFocus, useOnSubmit, useOnSubmitValidation } from '../../hooks';
import {
  AuthenticatorButtonElement,
  ClickHandler,
  UISchemaElementComponent,
} from '../../types';
import { getTranslation, getValidationMessages } from '../../util';
import AuthCoin from '../AuthCoin/AuthCoin';
import ArrowRight from './arrow-right.svg';
import { theme } from './AuthenticatorButton.theme';
import style from './styles.module.css';

const AuthenticatorButton: UISchemaElementComponent<{
  uischema: AuthenticatorButtonElement
}> = ({ uischema }) => {
  const ctaButtonClasses = classNames('cta-button', 'authenticator-button', style.actionName);
  const buttonClasses = classNames('authenticator-row', style.authButton);
  const buttonDescrClasses = classNames('authenticator-description', style.infoSection);
  const {
    translations,
    focus,
    options: {
      type,
      key: authenticationKey,
      actionParams,
      description,
      usageDescription,
      logoUri,
      ctaLabel,
      dataSe,
      iconName,
      iconDescr,
      step,
      includeData,
      includeImmutableData,
    },
  } = uischema;
  const label = getTranslation(translations!, 'label');
  const { dataSchemaRef, data, loading } = useWidgetContext();
  const onSubmitHandler = useOnSubmit();
  const onValidationHandler = useOnSubmitValidation();
  const focusRef = useAutoFocus<HTMLButtonElement>(focus);
  const describedByIds = [
    `${iconName}-ctaLabel`,
    description && `${iconName}-description`,
    usageDescription && `${iconName}-usageDescription`,
  ].filter(Boolean).join(' ');

  const onClick: ClickHandler = async () => {
    const dataSchema = dataSchemaRef.current!;
    const errorMessages = getValidationMessages(
      dataSchema,
      dataSchema.fieldsToValidate,
      data,
      actionParams,
    );
    if (errorMessages) {
      onValidationHandler(errorMessages);
      return;
    }
    onSubmitHandler({
      step,
      params: actionParams,
      includeData,
      includeImmutableData,
    });
  };

  return (
    <Box
      component="button"
      type={type}
      sx={{ width: 1, backgroundColor: 'inherit' }}
      display="flex"
      padding={2}
      border={1}
      borderColor="grey.200"
      borderRadius={Tokens.BorderRadiusBase}
      boxShadow={Tokens.ShadowScale0}
      className={buttonClasses}
      data-se="authenticator-button"
      tabIndex={0}
      onClick={onClick}
      onKeyPress={onClick}
      ref={focusRef}
      disabled={loading}
      aria-labelledby={`${iconName}-label`}
      aria-describedby={describedByIds}
    >
      { authenticationKey && (
        <Box
          className="authenticator-icon-container"
          data-se="authenticator-icon"
        >
          <AuthCoin
            authenticatorKey={authenticationKey}
            url={logoUri}
            name={iconName}
            description={iconDescr}
            customClasses={['authenticator-icon']}
          />
        </Box>
      )}
      <Box className={buttonDescrClasses}>
        <Typography
          variant="h3"
          id={`${iconName}-label`}
          sx={{ fontSize: '1rem', margin: 0, textAlign: 'start' }}
          data-se="authenticator-button-label"
          className="authenticator-label"
        >
          {label}
        </Typography>
        {description && (
          <Typography
            paragraph
            id={`${iconName}-description`}
            sx={{ fontSize: '.875rem', margin: 0, textAlign: 'start' }}
            data-se="authenticator-button-description"
            className="authenticator-description--text"
          >
            {description}
          </Typography>
        )}
        {usageDescription && (
          <Typography
            variant="caption"
            id={`${iconName}-usageDescription`}
            textAlign="start"
            sx={{ fontSize: '.875rem', margin: 0 }}
            data-se="authenticator-button-usage-text"
            className="authenticator-usage-text"
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
            id={`${iconName}-ctaLabel`}
            sx={{ fontWeight: 700, fontSize: '.875rem' }}
            data-se="cta-button-label"
            className="button select-factor link-button"
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
