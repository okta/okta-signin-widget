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
import { Box } from '@mui/material';
import {
  PasswordField,
  useOdysseyDesignTokens,
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
  const tokens = useOdysseyDesignTokens();
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
    <Box sx={{marginBlockEnd: tokens.Spacing3}}>
      <PasswordField
        // ariaDescribedBy={describedByIds}
        // autoCompleteType={autocomplete as PasswordAutoCompleteValue}
        errorMessage={errors}
        // errorMessageList={errorMessageList}
        hasShowPassword={showPasswordToggleOnSignInPage}
        // hint={hint ?? parsedExplainContent as string}
        id={path}
        inputRef={focusRef}
        isDisabled={loading}
        isFullWidth
        // isOptional={required === false}
        name={path}
        label={label}
        onChange={onChange}
        onBlur={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          e?.preventDefault();
          setTouched(true);
        }}
        testId={path}
        translate={appliedUiSchemaOptions.noTranslate ? 'no' : undefined}
        value={inputText}
      />
    </Box>
  );
};

const WrappedInputPassword = withJsonFormsControlProps(InputPassword);
export default WrappedInputPassword;
