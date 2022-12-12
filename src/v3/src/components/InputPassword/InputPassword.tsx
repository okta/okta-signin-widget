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

import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Box, IconButton, InputAdornment, InputLabel, OutlinedInput, Tooltip,
} from '@mui/material';
import { h } from 'preact';
import { useState } from 'preact/hooks';

import { useWidgetContext } from '../../contexts';
import { useAutoFocus, useOnChange, useValue } from '../../hooks';
import {
  ChangeEvent,
  ClickEvent,
  UISchemaElementComponent,
  UISchemaElementComponentWithValidationProps,
} from '../../types';
import { getTranslation } from '../../util';
import FieldErrorContainer from '../FieldErrorContainer';
import { withFormValidationState } from '../hocs';

const InputPassword: UISchemaElementComponent<UISchemaElementComponentWithValidationProps> = ({
  uischema,
  setTouched,
  errors,
  setErrors,
  onValidateHandler,
  describedByIds,
}) => {
  const value = useValue(uischema);
  const { loading } = useWidgetContext();
  const onChangeHandler = useOnChange(uischema);
  const label = getTranslation(uischema.translations!, 'label');
  const { translations = [], focus, required } = uischema;
  const {
    attributes,
    inputMeta: { name },
  } = uischema.options;
  const focusRef = useAutoFocus<HTMLInputElement>(focus);
  const hasErrors = typeof errors !== 'undefined';

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const changedVal = e.currentTarget.value;
    setTouched?.(true);
    onChangeHandler(changedVal);
    onValidateHandler?.(setErrors, changedVal);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (e: ClickEvent) => {
    e.preventDefault();
  };

  return (
    <Box>
      <InputLabel
        htmlFor={name}
        required={required}
      >
        {label}
      </InputLabel>
      <OutlinedInput
        id={name}
        name={name}
        error={hasErrors}
        inputRef={focusRef}
        onChange={handleChange}
        type={showPassword ? 'text' : 'password'}
        value={value}
        disabled={loading}
        fullWidth
        inputProps={{
          'data-se': name,
          'aria-describedby': describedByIds,
          ...attributes,
        }}
        endAdornment={(
          <InputAdornment position="end">
            <Tooltip title={showPassword ? getTranslation(translations, 'hide') : getTranslation(translations, 'show')}>
              <IconButton
                // TODO: OKTA-558040 request translation keys for aria labels
                aria-label={getTranslation(translations, 'visibilityToggleLabel')}
                aria-pressed={showPassword}
                aria-controls={name}
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </Tooltip>
          </InputAdornment>
        )}
      />
      {hasErrors && (
        <FieldErrorContainer
          errors={errors}
          fieldName={name}
        />
      )}
    </Box>
  );
};

export default withFormValidationState(InputPassword);
