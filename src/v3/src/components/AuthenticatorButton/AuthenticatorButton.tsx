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
import { AddIcon, ArrowLeftIcon, ArrowRightIcon } from '@okta/odyssey-react-mui/icons';
import { Box, Typography } from '@okta/odyssey-react-mui-legacy';
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

const AuthenticatorButton: UISchemaElementComponent<{
  uischema: AuthenticatorButtonElement
}> = ({ uischema }) => {
  const {
    translations = [],
    focus,
    ariaDescribedBy,
    noTranslate,
    options: {
      type,
      key: authenticationKey,
      isEnroll,
      isAdditionalEnroll,
      actionParams,
      nickname,
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
  const label = getTranslation(translations, 'label') ?? uischema.label;
  const description = getTranslation(translations, 'description') ?? uischema.options.description;
  const {
    dataSchemaRef, data, loading, languageDirection,
  } = useWidgetContext();
  const onSubmitHandler = useOnSubmit();
  const onValidationHandler = useOnSubmitValidation();
  const focusRef = useAutoFocus<HTMLButtonElement>(focus);
  const describedByIds = [
    ariaDescribedBy,
    description && `${iconName}-description`,
    nickname && `${iconName}-nickname`,
    usageDescription && `${iconName}-usageDescription`,
    `${iconName}-ctaLabel`,
  ].filter(Boolean).join(' ');
  const tokens = useOdysseyDesignTokens();

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

  function createCtaIcon() {
    if (isAdditionalEnroll) {
      return <AddIcon titleAccess={ctaLabel} />;
    }
    if (languageDirection === 'rtl') {
      return <ArrowLeftIcon titleAccess={ctaLabel} />;
    }
    return <ArrowRightIcon titleAccess={ctaLabel} />;
  }

  return (
    <Box
      component="button"
      type={type}
      sx={{
        '&:hover': {
          color: tokens.PalettePrimaryDark,
          cursor: 'pointer',
          borderColor: tokens.PalettePrimaryMain,
        },
        '&:focus': {
          outlineColor: tokens.PalettePrimaryMain,
          outlineOffset: tokens.FocusOutlineOffsetMain,
          outlineStyle: tokens.FocusOutlineStyle,
          outlineWidth: tokens.FocusOutlineWidthMain,
          borderColor: tokens.BorderColorDisplay,
        },
        width: 1,
        // Assuming we want to allow users to customize this color, we should try to map this to
        // a more semantic token. We also don't want users to override white just for this
        backgroundColor: tokens.HueNeutralWhite,
        paddingBlock: tokens.Spacing3,
        paddingInline: tokens.Spacing3,
        alignItems: !isEnroll ? 'center' : '',
      }}
      display="flex"
      border={1}
      borderColor={tokens.BorderColorDisplay}
      borderRadius={tokens.BorderRadiusMain}
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
          data-se="authenticator-icon"
        >
          <AuthCoin
            authenticatorKey={authenticationKey}
            url={logoUri}
            name={iconName}
            description={iconDescr}
          />
        </Box>
      )}
      <Box
        data-se="authenticator-button-content"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          paddingBlock: tokens.Spacing0,
          paddingInline: '12px 0',
          // needed to solve ie11 'flexbug' where nested flex element overflows container
          minInlineSize: '0%',
        }}
      >
        <Typography
          variant="h3"
          id={`${iconName}-label`}
          sx={{
            fontSize: tokens.TypographySizeBody,
            fontWeight: tokens.TypographyWeightBodyBold,
            color: tokens.TypographyColorBody,
            margin: tokens.Spacing0,
            textAlign: 'start',
          }}
          data-se="authenticator-button-label"
          translate="no"
        >
          {label}
        </Typography>
        {description && (
          <Typography
            paragraph
            id={`${iconName}-description`}
            sx={{
              fontSize: tokens.TypographySizeSubordinate,
              fontWeight: tokens.TypographyWeightBody,
              color: tokens.TypographyColorSubordinate,
              margin: tokens.Spacing0,
              marginBlockStart: '6px',
              textAlign: 'start',
            }}
            data-se="authenticator-button-description"
            translate={noTranslate ? 'no' : undefined}
          >
            {description}
          </Typography>
        )}
        {nickname && (
          <Typography
            paragraph
            id={`${iconName}-nickname`}
            sx={{
              fontSize: tokens.TypographySizeSubordinate,
              fontWeight: tokens.TypographyWeightBody,
              color: tokens.TypographyColorSubordinate,
              margin: tokens.Spacing0,
              marginBlockStart: '6px',
              textAlign: 'start',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
            title={nickname}
            data-se="authenticator-button-nickname"
            translate="no"
          >
            {nickname}
          </Typography>
        )}
        {usageDescription && (
          <Typography
            variant="caption"
            id={`${iconName}-usageDescription`}
            textAlign="start"
            sx={{
              fontSize: tokens.TypographySizeSubordinate,
              fontWeight: tokens.TypographyWeightBody,
              color: tokens.TypographyColorSubordinate,
              margin: tokens.Spacing0,
              marginBlockStart: '6px',
            }}
            data-se="authenticator-button-usage-text"
          >
            {usageDescription}
          </Typography>
        )}
        {isEnroll && (
          <Box
            data-se={dataSe}
            sx={{
              display: 'flex',
              alignItems: 'center',
              marginBlockStart: '14px',
              marginInline: tokens.Spacing0,
              color: tokens.TypographyColorAction,
              '& svg': {
                marginBlock: tokens.Spacing0,
                marginInlineStart: isAdditionalEnroll ? tokens.Spacing0 : '5px',
                marginInlineEnd: isAdditionalEnroll ? '5px' : tokens.Spacing0,
              },
            }}
          >
            <Box
              component="span"
              id={`${iconName}-ctaLabel`}
              sx={{
                fontWeight: tokens.TypographyWeightBodyBold,
                fontSize: tokens.TypographySizeBody,
                order: isAdditionalEnroll ? 1 : 0,
              }}
              data-se="cta-button-label"
            >
              {ctaLabel}
            </Box>
            <Box
              data-se="cta-button-icon"
              sx={{
                display: 'flex',
              }}
            >
              { createCtaIcon() }
            </Box>
          </Box>
        )}
      </Box>
      {!isEnroll && (
        <Box
          data-se={dataSe}
          sx={{
            color: tokens.TypographyColorAction,
          }}
        >
          <Box
            data-se="cta-button-icon"
            sx={{
              display: 'flex',
            }}
          >
            { createCtaIcon() }
          </Box>
        </Box>
      )}
    </Box>
  );
};
export default AuthenticatorButton;
