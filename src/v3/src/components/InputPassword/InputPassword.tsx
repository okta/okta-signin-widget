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

import {
  Box,
  EyeIcon,
  EyeOffIcon,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputBase,
  InputLabel,
  Tooltip,
  Typography,
} from '@okta/odyssey-react-mui';
import { h } from 'preact';
import { useRef, useState } from 'preact/hooks';

import { useWidgetContext } from '../../contexts';
import {
  useAutoFocus,
  useHtmlContentParser,
  useValue,
} from '../../hooks';
import {
  ChangeEvent,
  UISchemaElementComponent,
  UISchemaElementComponentWithValidationProps,
} from '../../types';
import { getTranslation } from '../../util';
import FieldLevelMessageContainer from '../FieldLevelMessageContainer';
import { withFormValidationState } from '../hocs';

const InputPassword: UISchemaElementComponent<UISchemaElementComponentWithValidationProps> = ({
  uischema,
  errors,
  handleChange,
  handleBlur,
  describedByIds,
}) => {
  const value = useValue(uischema);
  // TODO: OKTA-623544 - this FF will be deprecated for SIW v3 post-GA
  // Sets showPasswordToggleOnSignInPage default value to true for parity with v2
  const {
    loading,
    widgetProps: { features: { showPasswordToggleOnSignInPage = true } = {} },
  } = useWidgetContext();
  const {
    translations = [],
    focus,
    parserOptions,
    noTranslate,
    showAsterisk,
    dir,
  } = uischema;
  const {
    attributes,
    inputMeta: { name, required },
  } = uischema.options;
  const label = getTranslation(translations, 'label');
  const hint = getTranslation(translations, 'hint');
  const explain = getTranslation(translations, 'bottomExplain');
  const optionalLabel = getTranslation(translations, 'optionalLabel');
  const focusRef = useAutoFocus<HTMLInputElement>(focus);
  const parsedExplainContent = useHtmlContentParser(explain, parserOptions);
  const hasErrors = typeof errors !== 'undefined';
  // TODO: OKTA-569647 - refactor logic
  const hintId = hint && `${name}-hint`;
  const explainId = explain && `${name}-explain`;
  const ariaDescribedByIds = [describedByIds, hintId, explainId].filter(Boolean).join(' ')
    || undefined;
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const showPasswordTimeoutRef = useRef<number | undefined>();

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);

    if (showPasswordTimeoutRef.current) {
      window.clearTimeout(showPasswordTimeoutRef.current);
    }
    // If the new value of showPassword is being set to true, set a 30-second timeout to auto-hide the password
    // See: https://github.com/okta/okta-signin-widget#featuresshowpasswordtoggleonsigninpage
    if (!showPassword) {
      showPasswordTimeoutRef.current = window.setTimeout(() => {
        setShowPassword(false);
      }, 30000)
    }
  };

  return (
    <Box>
      <InputLabel
        htmlFor={name}
        // To prevent asterisk from shifting far right
        sx={{ justifyContent: showAsterisk ? 'flex-start' : undefined }}
      >
        {label}
        {showAsterisk && (
          <Box
            component="span"
            sx={(theme) => ({
              marginInlineStart: theme.spacing(1),
              marginInlineEnd: theme.spacing(1),
            })}
            className="no-translate"
            aria-hidden
          >
            *
          </Box>
        )}
        {required === false && (
          <Typography
            variant="subtitle1"
            sx={{ whiteSpace: 'nowrap' }}
          >
            {optionalLabel}
          </Typography>
        )}
      </InputLabel>
      {hint && (
        <FormHelperText
          id={hintId}
          className="o-form-explain"
          data-se={hintId}
          // TODO: OKTA-577905 - Temporary fix until we can upgrade to the latest version of Odyssey
          sx={{ textAlign: 'start' }}
        >
          {hint}
        </FormHelperText>
      )}
      <InputBase
        id={name}
        name={name}
        error={hasErrors}
        inputRef={focusRef}
        onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          handleChange?.(e.currentTarget.value);
        }}
        onBlur={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          handleBlur?.(e?.currentTarget?.value);
        }}
        type={showPassword ? 'text' : 'password'}
        value={value}
        disabled={loading}
        fullWidth
        inputProps={{
          'data-se': name,
          'aria-describedby': ariaDescribedByIds,
          ...attributes,
        }}
        className={noTranslate ? 'no-translate' : undefined}
        dir={dir}
        endAdornment={(
          showPasswordToggleOnSignInPage && (
            <InputAdornment position="end">
              <Tooltip title={showPassword ? getTranslation(translations, 'hide') : getTranslation(translations, 'show')}>
                <IconButton
                  aria-label={getTranslation(translations, 'visibilityToggleLabel')}
                  aria-pressed={showPassword}
                  aria-controls={name}
                  onClick={handleClickShowPassword}
                  edge="end"
                  sx={{
                    '&.Mui-focusVisible': {
                      outlineStyle: 'solid',
                      outlineWidth: '1px',
                    },
                  }}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </IconButton>
              </Tooltip>
            </InputAdornment>
          )
        )}
      />
      {hasErrors && (
        <FieldLevelMessageContainer
          messages={errors}
          fieldName={name}
        />
      )}
      {explain && (
        <FormHelperText
          id={explainId}
          className="o-form-explain"
          data-se={explainId}
          // TODO: OKTA-577905 - Temporary fix until we can upgrade to the latest version of Odyssey
          sx={{ textAlign: 'start' }}
        >
          {parsedExplainContent}
        </FormHelperText>
      )}
    </Box>
  );
};

const WrappedInputPassword = withFormValidationState(InputPassword);
export default WrappedInputPassword;
