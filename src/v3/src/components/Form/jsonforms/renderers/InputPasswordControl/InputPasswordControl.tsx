/*
 * Copyright (c) 2023-present, Okta, Inc. and/or its affiliates. All rights reserved.
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
  ControlProps,
} from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
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
} from '@okta/odyssey-react-mui';
import { merge } from 'lodash';
import { FunctionComponent } from 'preact';
import { useRef, useState } from 'preact/hooks';

import { useWidgetContext } from '../../../../../contexts';
import {
  useAutoFocus,
  useDebouncedChange,
} from '../../../../../hooks';
import { ChangeEvent } from '../../../../../types';
import { eventToValue } from '../../../../../util';

const InputPassword: FunctionComponent<ControlProps> = ({
  // uischema,
  // errors,
  // handleChange,
  // handleBlur,
  // describedByIds,
  data,
  handleChange,
  path,
  label,
  config,
  schema,
  uischema,
  errors,
}) => {
  // const value = useValue(uischema);
  // TODO: OKTA-623544 - this FF will be deprecated for SIW v3 post-GA
  // Sets showPasswordToggleOnSignInPage default value to true for parity with v2
  const {
    loading,
    formErrors,
    widgetProps: { features: { showPasswordToggleOnSignInPage = true } = {} },
  } = useWidgetContext();
  // const {
  //   translations = [],
  //   focus,
  //   parserOptions,
  //   noTranslate,
  //   showAsterisk,
  //   dir,
  // } = uischema;
  // const {
  //   attributes,
  //   inputMeta: { name, required },
  // } = uischema.options;
  // const label = getTranslation(translations, 'label');
  // const hint = getTranslation(translations, 'hint');
  // const explain = getTranslation(translations, 'bottomExplain');
  // const optionalLabel = getTranslation(translations, 'optionalLabel');
  console.log('FORM ERRORS FROM Password control:', formErrors);
  console.log('jsonForms errors property:', errors);
  const appliedUiSchemaOptions = merge({}, config, uischema.options);
  const dir = appliedUiSchemaOptions.dir || 'ltr';
  const focusRef = useAutoFocus<HTMLInputElement>(appliedUiSchemaOptions.focus);
  const [inputText, onChange] = useDebouncedChange(
    handleChange,
    '',
    data,
    path,
    eventToValue,
  );
  // const parsedExplainContent = useHtmlContentParser(explain, parserOptions);
  // const hasErrors = typeof errors !== 'undefined';
  // TODO: OKTA-569647 - refactor logic
  // const hintId = hint && `${name}-hint`;
  // const explainId = explain && `${name}-explain`;
  // const ariaDescribedByIds = [describedByIds, hintId, explainId].filter(Boolean).join(' ')
  //   || undefined;
  const [touched, setTouched] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const showPasswordTimeoutRef = useRef<number | undefined>();
  const hasErrors = touched && typeof errors !== 'undefined' && !!errors;

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
      }, 30000);
    }
  };

  return (
    <Box marginBlockEnd={4}>
      <InputLabel
        htmlFor={path}
      >
        {label}
      </InputLabel>
      <InputBase
        id={path}
        name={path}
        inputRef={focusRef}
        error={hasErrors}
        onChange={onChange}
        onBlur={(e: ChangeEvent<HTMLInputElement>) => {
          e.preventDefault();
          setTouched(true);
        }}
        type={showPassword ? 'text' : 'password'}
        value={inputText}
        disabled={loading}
        fullWidth
        inputProps={{
          'data-se': path,
          // 'aria-describedby': ariaDescribedByIds,
          // ...attributes,
        }}
        // className={noTranslate ? 'no-translate' : undefined}
        dir={dir}
        endAdornment={(
          showPasswordToggleOnSignInPage && (
            <InputAdornment
              position="end"
              // switching on the passed `dir` attribute is needed because plugin does not yet
              // handle nested [dir="ltr"] inside [dir="rtl"] well so explicitly set physical
              // properties when 'ltr' is passed onto this element, else can use logical
              sx={(theme) => (dir === 'ltr' ? {
                marginLeft: '8px',
                marginRight: theme.spacing(2),
              } : {
                marginInlineEnd: theme.spacing(2),
                marginInlineStart: '8px',
              })}
            >
              <Tooltip
                // title={showPassword ? getTranslation(translations, 'hide') : getTranslation(translations, 'show')}
                title={showPassword ? 'Hide' : 'Show'}
                PopperProps={{
                  // keep the added tooltip element inside the SIW container
                  disablePortal: true,
                }}
              >
                <IconButton
                  // aria-label={getTranslation(translations, 'visibilityToggleLabel')}
                  aria-label="Show Password"
                  aria-pressed={showPassword}
                  aria-controls={path}
                  onClick={handleClickShowPassword}
                  sx={{
                    // instead of using IconButton `edge="end"` we use this sx prop
                    // because `edge="end"` does not use logical properties
                    ...(dir === 'ltr' ? { marginRight: '-12px' } : { marginInlineEnd: '-12px' }),
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
        <FormHelperText
          id={`${path}-error`}
          role="alert"
          data-se={`${path}-error`}
          error
          // TODO: OKTA-577905 - Temporary fix until we can upgrade to the latest version of Odyssey
          sx={{ textAlign: 'start' }}
        >
          {errors}
        </FormHelperText>
      )}
    </Box>
  );
};

const WrappedInputPassword = withJsonFormsControlProps(InputPassword);
export default WrappedInputPassword;
